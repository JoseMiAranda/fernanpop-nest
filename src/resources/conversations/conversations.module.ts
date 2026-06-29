import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes(ConversationsController);
  }
}
