export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error (429)
            const isRateLimit =
                error.message?.includes("429") ||
                error.status === 429 ||
                error.response?.status === 429;

            if (!isRateLimit && i === maxRetries - 1) {
                break;
            }

            // Exponential backoff with jitter
            const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;

            // If it's a rate limit error, we might want to wait longer
            const waitTime = isRateLimit ? Math.max(delay, 5000) : delay;

            console.warn(`[Retry] Attempt ${i + 1} failed. Retrying in ${Math.round(waitTime)}ms...`, error.message);

            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError;
}
