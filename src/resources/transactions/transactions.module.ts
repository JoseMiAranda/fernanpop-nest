import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [ReviewsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes(TransactionsController);
  }
}
