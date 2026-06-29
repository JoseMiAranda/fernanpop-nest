import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';
import { EmailVerifiedCheck } from '../../common/middleware/email-verified-check';
import { ReviewsModule } from '../reviews/reviews.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [ReviewsModule, ConversationsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes(
        { path: 'transactions', method: RequestMethod.GET },
        { path: 'transactions/:id/accept', method: RequestMethod.PATCH },
        { path: 'transactions/:id/cancel', method: RequestMethod.PATCH },
        { path: 'transactions/:id/review', method: RequestMethod.POST },
      );

    consumer
      .apply(ApiTokenCheck, EmailVerifiedCheck)
      .forRoutes({ path: 'transactions/:productId', method: RequestMethod.POST });
  }
}
