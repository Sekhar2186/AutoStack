/**
 * AI Provider Resolver
 *
 * Given a userId, loads that user's AI settings from the database and returns
 * a resolved provider configuration ready for use in the model router.
 *
 * Resolution logic:
 *   1. Load UserAISettings for the userId.
 *   2. Check preferredProvider — if "auto", return { provider: "auto" }.
 *   3. Check if the preferred provider is enabled and has an API key.
 *   4. Decrypt the API key and return the full config.
 *   5. If any step fails (no settings, not enabled, no key), return { provider: "auto" }
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

        const preferred = settings.preferredProvider;

        // "auto" means user wants system defaults
        if (preferred === "auto") {
            return { provider: "auto", isUserProvider: false };
        }

        const providerConfig = settings.providers[preferred];

        // Check provider is enabled and has a key
        if (!providerConfig?.enabled || !providerConfig.apiKey) {
            console.warn(
                `[ProviderResolver] User ${userId} preferred "${preferred}" ` +
                `but it is not enabled or has no API key. Falling back to system.`
            );
            return { provider: "auto", isUserProvider: false };
        }

        // Decrypt the stored key
        const apiKey = decrypt(providerConfig.apiKey);

        if (!apiKey) {
            console.warn(
                `[ProviderResolver] Decryption returned empty key for user ${userId} / "${preferred}". ` +
                `Falling back to system.`
            );
            return { provider: "auto", isUserProvider: false };
        }

        console.log(
            `[ProviderResolver] Resolved user provider: "${preferred}" for user ${userId}`
        );

        return {
            provider: preferred,
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
