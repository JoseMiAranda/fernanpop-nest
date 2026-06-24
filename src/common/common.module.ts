import { Global, Module } from '@nestjs/common';
import { RateLimiterService } from './services/rate-limiter.service';
import { UserProfileService } from './services/user-profile.service';

@Global()
@Module({
  providers: [UserProfileService, RateLimiterService],
  exports: [UserProfileService, RateLimiterService],
})
export class CommonModule {}
