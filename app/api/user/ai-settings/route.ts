/**
 * /api/user/ai-settings
 *
 * GET    — Return the user's current AI settings (API keys masked).
 * POST   — Save/update a provider config (encrypts the API key before storing).
 * DELETE — Remove the stored API key for a specific provider (?provider=gemini).
 *
 * All routes require a valid JWT token in Authorization: Bearer <token>.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { UserAISettings } from "@/lib/db/models/UserAISettings";
import type {
    SupportedProvider,
    ProviderConfig,
    IUserAISettings,
} from "@/lib/db/models/UserAISettings";
import { encrypt, decrypt } from "@/lib/services/ai/encryption";
import { verifyToken } from "@/lib/middleware/auth";

// ─── Supported providers list ─────────────────────────────────────────────────

const SUPPORTED_PROVIDERS: SupportedProvider[] = [
    "gemini",
    "groq",
    "openai",
    "claude",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskKey(encrypted: string): string {
    if (!encrypted) return "";
    try {
        const plain = decrypt(encrypted);
        if (plain.length <= 8) return "••••••••";
        return plain.slice(0, 4) + "••••••••••••••••" + plain.slice(-4);
    } catch {
        return "••••••••";
    }
}

function buildSafeSettings(settings: IUserAISettings | null) {
    const providers: Record<string, {
        model: string;
        hasKey: boolean;
        maskedKey: string;
    }> = {};

    for (const p of SUPPORTED_PROVIDERS) {
        const cfg: ProviderConfig | undefined = settings?.providers?.[p as SupportedProvider];
        providers[p] = {
            model: cfg?.model ?? "",
            hasKey: Boolean(cfg?.apiKey),
            maskedKey: maskKey(cfg?.apiKey ?? ""),
        };
    }

    return {
        generationMode: settings?.generationMode ?? "auto",
        selectedProvider: settings?.selectedProvider ?? "gemini",
        providers,
    };
}

// ─── Authenticate helper ──────────────────────────────────────────────────────

function authenticate(req: NextRequest): { id: string } | null {
    const decoded = verifyToken(req as unknown as Request);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        return null;
    }
    return decoded as { id: string };
}

// ─── GET /api/user/ai-settings ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const user = authenticate(req);
    if (!user) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await connectDB();
        const settings = await UserAISettings.findOne({ userId: user.id }).lean();

        return NextResponse.json({
            success: true,
            settings: buildSafeSettings(settings),
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("[AI Settings GET] Error:", err?.message ?? error);
        return NextResponse.json(
            { success: false, message: "Failed to load AI settings" },
            { status: 500 }
        );
    }
}

// ─── POST /api/user/ai-settings ───────────────────────────────────────────────

/**
 * Body shape:
 * {
 *   provider: "gemini" | "groq" | "openai" | "claude",
 *   apiKey: string,           // plaintext — will be encrypted before storage
 *   model: string,
 *   enabled: boolean,
 *   preferredProvider?: "auto" | "gemini" | "groq" | "openai" | "claude"
 * }
 */
export async function POST(req: NextRequest) {
    const user = authenticate(req);
    if (!user) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    let body: {
        provider: SupportedProvider;
        apiKey: string;
        model: string;
        generationMode?: "auto" | "manual";
        selectedProvider?: SupportedProvider;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const { provider, apiKey, model, generationMode, selectedProvider } = body;

    // Validate provider
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
        return NextResponse.json(
            {
                success: false,
                message: `Unsupported provider "${provider}". Valid: ${SUPPORTED_PROVIDERS.join(", ")}`,
            },
            { status: 400 }
        );
    }

    if (!model || typeof model !== "string") {
        return NextResponse.json(
            { success: false, message: '"model" is required and must be a string' },
            { status: 400 }
        );
    }

    try {
        await connectDB();

        // Encrypt the API key — blank keys are stored as empty string (no-op)
        const encryptedKey = apiKey ? encrypt(apiKey.trim()) : "";

        // Build the update object
        const updateFields: Record<string, unknown> = {
            [`providers.${provider}.model`]: model.trim(),
        };

        // Only update the key if a new one was supplied
        if (encryptedKey) {
            updateFields[`providers.${provider}.apiKey`] = encryptedKey;
        }

        // Update mode and selected provider if supplied
        if (generationMode) {
            const validModes = ["auto", "manual"];
            if (!validModes.includes(generationMode)) {
                return NextResponse.json(
                    { success: false, message: `Invalid generationMode "${generationMode}"` },
                    { status: 400 }
                );
            }
            updateFields["generationMode"] = generationMode;
        }

        if (selectedProvider) {
            if (!SUPPORTED_PROVIDERS.includes(selectedProvider)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid selectedProvider "${selectedProvider}"`,
                    },
                    { status: 400 }
                );
            }
            updateFields["selectedProvider"] = selectedProvider;
        }

        const updated = await UserAISettings.findOneAndUpdate(
            { userId: user.id },
            { $set: updateFields },
            { upsert: true, new: true }
        ).lean();

        console.log(
            `[AI Settings POST] Updated "${provider}" settings for user ${user.id}`
        );

        return NextResponse.json({
            success: true,
            message: `Provider "${provider}" settings saved successfully.`,
            settings: buildSafeSettings(updated),
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("[AI Settings POST] Error:", err?.message ?? error);
        return NextResponse.json(
            { success: false, message: "Failed to save AI settings" },
            { status: 500 }
        );
    }
}

// ─── DELETE /api/user/ai-settings?provider=gemini ────────────────────────────

export async function DELETE(req: NextRequest) {
    const user = authenticate(req);
    if (!user) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") as SupportedProvider | null;

    if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
        return NextResponse.json(
            {
                success: false,
                message: `A valid "provider" query param is required. Valid: ${SUPPORTED_PROVIDERS.join(", ")}`,
            },
            { status: 400 }
        );
    }

    try {
        await connectDB();

        const updated = await UserAISettings.findOneAndUpdate(
            { userId: user.id },
            {
                $set: {
                    [`providers.${provider}.apiKey`]: "",
                },
            },
            { new: true }
        ).lean();

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "No AI settings found for this user" },
                { status: 404 }
            );
        }

        console.log(
            `[AI Settings DELETE] Cleared API key for "${provider}" — user ${user.id}`
        );

        return NextResponse.json({
            success: true,
            message: `API key for "${provider}" has been deleted.`,
            settings: buildSafeSettings(updated),
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("[AI Settings DELETE] Error:", err?.message ?? error);
        return NextResponse.json(
            { success: false, message: "Failed to delete API key" },
            { status: 500 }
        );
    }
}
