/**
 * Centralized AI error classification utility.
 *
 * All AI providers (Gemini, Groq, Claude, OpenAI) should rely on these helpers
 * instead of duplicating inline string/status checks. This is the single source
 * of truth for what constitutes a retryable, quota, auth, or timeout error.
 */

// ─── Status Code Extraction ───────────────────────────────────────────────────

export function getStatusCode(error: any): number | null {
    return (
        error?.status ??
        error?.response?.status ??
        error?.statusCode ??
        null
    );
}

// ─── Classification Sets & Patterns ──────────────────────────────────────────

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const QUOTA_PATTERNS = [
    "RESOURCE_EXHAUSTED",
    "quota exceeded",
    "rate limit exceeded",
    "rate limit",
    "too many requests",
];

const TIMEOUT_PATTERNS = [
    "timeout",
    "ETIMEDOUT",
    "ECONNRESET",
    "fetch failed",
    "network error",
];

const AUTH_STATUSES = new Set([401, 403]);

const AUTH_PATTERNS = [
    "invalid api key",
    "api key not valid",
    "authentication failed",
    "permission denied",
    "unauthenticated",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesAny(message: string, patterns: string[]): boolean {
    const lower = message.toLowerCase();
    return patterns.some((p) => lower.includes(p.toLowerCase()));
}

// ─── Exported Classifiers ────────────────────────────────────────────────────

/**
 * Returns true for transient errors that are safe to retry:
 * HTTP 429/5xx, quota exhaustion, rate limits, network/timeout issues.
 */
export function isRetryableError(error: any): boolean {
    const status = getStatusCode(error);
    if (status !== null && RETRYABLE_STATUSES.has(status)) return true;
    const message: string = error?.message ?? "";
    return matchesAny(message, [...QUOTA_PATTERNS, ...TIMEOUT_PATTERNS]);
}

/**
 * Returns true when the error indicates quota exhaustion or rate limiting.
 * Useful for deciding to switch providers vs. simply waiting.
 */
export function isQuotaError(error: any): boolean {
    const status = getStatusCode(error);
    if (status === 429) return true;
    const message: string = error?.message ?? "";
    return matchesAny(message, QUOTA_PATTERNS);
}

/**
 * Returns true for authentication or configuration failures.
 * These should NEVER be retried — they require operator intervention.
 */
export function isAuthError(error: any): boolean {
    const status = getStatusCode(error);
    if (status !== null && AUTH_STATUSES.has(status)) return true;
    const message: string = error?.message ?? "";
    return matchesAny(message, AUTH_PATTERNS);
}

/**
 * Returns true for network-level timeout and connection errors.
 */
export function isTimeoutError(error: any): boolean {
    const message: string = error?.message ?? "";
    return matchesAny(message, TIMEOUT_PATTERNS);
}
