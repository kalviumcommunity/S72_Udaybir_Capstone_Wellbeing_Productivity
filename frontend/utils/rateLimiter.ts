// Client-side rate limiter utility

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    if (!this.requests.has(key)) {
      return this.config.maxRequests;
    }

    const requestTimes = this.requests.get(key)!;
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    if (!this.requests.has(key)) {
      return Date.now();
    }

    const requestTimes = this.requests.get(key)!;
    if (requestTimes.length === 0) {
      return Date.now();
    }

    const oldestRequest = Math.min(...requestTimes);
    return oldestRequest + this.config.windowMs;
  }

  clear(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

// Create default rate limiters
export const apiRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000 // 1 minute
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000 // 1 minute
});

export const dataSyncRateLimiter = new RateLimiter({
  maxRequests: 2,
  windowMs: 30000 // 30 seconds
});

// Helper function to check if request can be made
export const canMakeApiRequest = (endpoint: string): boolean => {
  return apiRateLimiter.canMakeRequest(endpoint);
};

export const canMakeAuthRequest = (): boolean => {
  return authRateLimiter.canMakeRequest('auth');
};

export const canMakeDataSyncRequest = (): boolean => {
  return dataSyncRateLimiter.canMakeRequest('sync');
}; 