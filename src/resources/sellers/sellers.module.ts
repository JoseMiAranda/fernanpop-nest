import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { ProductsModule } from '../products/products.module';
import { ApiTokenCheck } from 'src/common/middleware/api-token-check';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [ProductsModule, TransactionsModule],
  controllers: [SellersController],
  providers: [SellersService],
})
export class SellersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes('seller/*');
  }
}
