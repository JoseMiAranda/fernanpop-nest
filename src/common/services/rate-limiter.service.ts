import { Injectable } from '@nestjs/common';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

@Injectable()
export class RateLimiterService {
  private readonly buckets = new Map<string, number[]>();

  peek(key: string, config: RateLimitConfig): RateLimitResult {
    return this.evaluate(key, config, false);
  }

  consume(key: string, config: RateLimitConfig): RateLimitResult {
    return this.evaluate(key, config, true);
  }

  private evaluate(key: string, config: RateLimitConfig, record: boolean): RateLimitResult {
    const now = Date.now();
    const timestamps = (this.buckets.get(key) ?? []).filter((t) => now - t < config.windowMs);

    if (timestamps.length >= config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, timestamps[0] + config.windowMs - now),
      };
    }

    if (record) {
      timestamps.push(now);
      this.buckets.set(key, timestamps);
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - timestamps.length,
      retryAfterMs: 0,
    };
  }
}
