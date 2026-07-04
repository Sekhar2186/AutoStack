/**
 * AI Provider Factory
 *
 * Retrieves a provider instance from the registry by name.
 * Throws a descriptive error if the provider doesn't exist.
 *
 * Responsibilities:
 *   ✅ Lookup from registry by name
 *   ✅ Throw on unknown provider
 *   ❌ NO generation logic
 *   ❌ NO fallback logic
 *   ❌ NO env var access
 */

import {
    providerRegistry,
    type AIProvider,
    type RegisteredProviderName,
} from "@/lib/services/ai/providerRegistry";

/**
 * Returns the AIProvider instance for the given name.
 *
 * @throws Error if the provider name is not registered.
 */
export function getProvider(name: string): AIProvider {
    const provider = providerRegistry[name as RegisteredProviderName];

    if (!provider) {
        const available = Object.keys(providerRegistry).join(", ");
        throw new Error(
            `[ProviderFactory] Unknown provider "${name}". ` +
            `Registered providers: [${available}].`
        );
    }

    return provider;
}
