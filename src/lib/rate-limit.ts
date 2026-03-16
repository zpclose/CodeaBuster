export class RateLimiter {
    private tokenCache: Map<string, { count: number; reset: number }>;

    constructor() {
        this.tokenCache = new Map();
    }

    check(limit: number, token: string): boolean {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        const tokenData = this.tokenCache.get(token);

        if (!tokenData) {
            this.tokenCache.set(token, { count: 1, reset: now + 60000 });
            return true;
        }

        if (tokenData.reset < now) {
            // Window expired, reset
            this.tokenCache.set(token, { count: 1, reset: now + 60000 });
            return true;
        }

        if (tokenData.count >= limit) {
            return false;
        }

        tokenData.count += 1;
        return true;
    }

    // Optional: Cleanup old entries to prevent memory leak
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.tokenCache.entries()) {
            if (value.reset < now) {
                this.tokenCache.delete(key);
            }
        }
    }
}

export const limiter = new RateLimiter();
