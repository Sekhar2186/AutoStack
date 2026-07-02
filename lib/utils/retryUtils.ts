import {
    getStatusCode,
    isRetryableError,
    isAuthError,
} from "@/lib/services/ai/errorUtils";

/**
 * Retries `fn` up to `maxRetries` times using exponential backoff with jitter.
 *
 * - Auth/permanent errors are thrown immediately without retrying.
 * - Retryable errors (quota, 5xx, network) are retried with backoff.
 * - Unknown errors are retried up to the last attempt, then thrown.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const status = getStatusCode(error);
            const statusLabel = status !== null ? ` (${status})` : "";

            // Auth/config errors must never be retried.
            if (isAuthError(error)) {
                console.error(
                    `[Retry] Non-retryable error detected${statusLabel}. Aborting retries.`
                );
                console.error(`[Retry] Reason: ${error?.message ?? "Unknown"}`);
                throw error;
            }

            const retryable = isRetryableError(error);

            // Unknown error on the final attempt — give up.
            if (!retryable && attempt === maxRetries) {
                console.warn(
                    `[Retry] Unrecognised error${statusLabel} on final attempt. Giving up.`
                );
                break;
            }

            if (retryable) {
                console.warn(`[Retry] Retryable error detected${statusLabel}`);
            } else {
                console.warn(`[Retry] Error${statusLabel} — will retry anyway.`);
            }

            if (attempt < maxRetries) {
                const base =
                    initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                // Rate-limit errors warrant a longer minimum wait.
                const waitTime = status === 429 ? Math.max(base, 5000) : base;

                console.warn(`[Retry] Waiting ${Math.round(waitTime / 1000)}s before retry...`);
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries}`);
            }
        }
    }

    throw lastError;
}
