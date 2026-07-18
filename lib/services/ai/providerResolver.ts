/**
 * AI Provider Resolver
 *
 * Given a userId, loads that user's AI settings from the database and returns
 * a resolved provider configuration ready for use in the model router.
 *
 * Resolution logic:
 *   1. Load UserAISettings for the userId.
 *   2. Check generationMode — if "auto", return { provider: "auto" }.
 *   3. Check if the selectedProvider has an API key.
 *   4. Decrypt the API key and return the full config.
 *   5. If any step fails (no settings, no key), return { provider: "auto" }
 *      to signal fallback to system providers.
 *
 * Responsibilities:
 *   ✅ Load UserAISettings
 *   ✅ Decrypt API keys
 *   ✅ Return resolved provider config
 *   ❌ NO generation logic
 *   ❌ NO env var access
 */

import { connectDB } from "@/lib/db/connect";
import { UserAISettings } from "@/lib/db/models/UserAISettings";
import type { SupportedProvider } from "@/lib/db/models/UserAISettings";
import { decrypt } from "@/lib/services/ai/encryption";

// ─── Return types ─────────────────────────────────────────────────────────────

interface UserProviderResolved {
    provider: SupportedProvider;
    apiKey: string;
    model: string;
    isUserProvider: true;
}

interface SystemProviderFallback {
    provider: "auto";
    isUserProvider: false;
}

export type ResolvedProvider = UserProviderResolved | SystemProviderFallback;

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolves the AI provider configuration for a given user.
 *
 * Returns a user-specific provider config if the user has configured one,
 * or `{ provider: "auto" }` to signal the router to use system providers.
 */
export async function resolveProviderForUser(
    userId: string
): Promise<ResolvedProvider> {
    try {
        await connectDB();

        const settings = await UserAISettings.findOne({ userId }).lean();

        if (!settings) {
            return { provider: "auto", isUserProvider: false };
        }

        const mode = settings.generationMode;

        // "auto" means user wants system defaults
        if (mode === "auto") {
            return { provider: "auto", isUserProvider: false };
        }

        const providerName = settings.selectedProvider;
        const providerConfig = settings.providers[providerName];

        // Check provider has a key
        if (!providerConfig || !providerConfig.apiKey) {
            if (mode === "manual") {
                throw new Error(`Generation Mode is manual but the selected provider (${providerName}) has no API key.`);
            }
            console.warn(
                `[ProviderResolver] User ${userId} selected "${providerName}" ` +
                `but it has no API key. Falling back to system.`
            );
            return { provider: "auto", isUserProvider: false };
        }

        // Decrypt the stored key
        const apiKey = decrypt(providerConfig.apiKey);

        if (!apiKey) {
            if (mode === "manual") {
                throw new Error(`Generation Mode is manual but the selected provider (${providerName}) has an invalid API key.`);
            }
            console.warn(
                `[ProviderResolver] Decryption returned empty key for user ${userId} / "${providerName}". ` +
                `Falling back to system.`
            );
            return { provider: "auto", isUserProvider: false };
        }

        console.log(
            `[ProviderResolver] Resolved user provider: "${providerName}" for user ${userId}`
        );

        return {
            provider: providerName,
            apiKey,
            model: providerConfig.model,
            isUserProvider: true,
        };
    } catch (error: unknown) {
        const err = error as { message?: string };
        // Any error resolving user settings = fall back to system safely
        console.error(
            `[ProviderResolver] Failed to resolve provider for user ${userId}:`,
            err?.message ?? error
        );
        return { provider: "auto", isUserProvider: false };
    }
}
