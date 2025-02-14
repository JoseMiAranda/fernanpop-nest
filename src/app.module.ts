import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './resources/products/products.module';
import { ApiTokenCheck } from './common/middleware/api-token-check';
import { ProductsController } from './resources/products/products.controller';
import { TransactionsModule } from './resources/transactions/transactions.module';

@Module({
  imports: [ProductsModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
