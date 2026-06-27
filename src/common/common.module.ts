import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { UserProfileService } from './services/user-profile.service';

@Global()
@Module({
  providers: [UserProfileService, RateLimiterService, MailService],
  exports: [UserProfileService, RateLimiterService, MailService],
})
export class CommonModule {}
