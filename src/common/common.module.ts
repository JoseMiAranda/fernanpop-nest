import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MessageEncryptionService } from './services/message-encryption.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { UserProfileService } from './services/user-profile.service';

@Global()
@Module({
  providers: [UserProfileService, RateLimiterService, MailService, MessageEncryptionService],
  exports: [UserProfileService, RateLimiterService, MailService, MessageEncryptionService],
})
export class CommonModule {}
