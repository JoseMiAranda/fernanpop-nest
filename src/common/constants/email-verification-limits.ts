import { RateLimitConfig } from '../services/rate-limiter.service';

export const EMAIL_VERIFICATION_SEND_LIMIT: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 5 * 60 * 1000,
};

export const EMAIL_VERIFICATION_CHECK_LIMIT: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 60 * 1000,
};

export const RATE_LIMIT_EXCEEDED = 'rate-limit-exceeded';
