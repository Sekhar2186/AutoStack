/**
 * Provider Session Manager
 *
 * Tracks which AI provider is active for the current generation run.
 * modelRouter.ts is the only consumer that should mutate session state.
 * Agents and providers must never import this module directly.
 */

export type AIProvider = "gemini" | "groq" | "openai" | "claude";

interface ProviderSession {
    activeProvider: AIProvider;
    fallbackUsed: boolean;
}

// Module-level singleton — lives for the lifetime of the Node process.
const session: ProviderSession = {
    activeProvider: "gemini",
    fallbackUsed: false,
};

/** Returns the currently active provider for this generation session. */
export function getActiveProvider(): AIProvider {
    return session.activeProvider;
}

/** Switches the active provider (call only after exhausting the current one). */
export function setActiveProvider(provider: AIProvider): void {
    session.activeProvider = provider;
    if (provider !== "gemini") {
        session.fallbackUsed = true;
    }
}

/** Returns true if the session has already fallen back to a secondary provider. */
export function isFallbackActive(): boolean {
    return session.fallbackUsed;
}

/**
 * Resets session to defaults.
 * Must be called at the start of every new project generation so that a
 * previous failure does not affect the next run.
 */
export function resetProviderSession(): void {
    session.activeProvider = "gemini";
    session.fallbackUsed = false;
    console.log("[AI Router] Provider session reset.");
    console.log("[AI Router] Active Provider = Gemini");
}
