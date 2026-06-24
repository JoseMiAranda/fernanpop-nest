import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';

@Module({
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
})
export class EmailVerificationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiTokenCheck).forRoutes(EmailVerificationController);
  }
}
