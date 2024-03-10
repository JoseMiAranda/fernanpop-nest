import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './resources/products/products.module';
import { SellersModule } from './resources/sellers/sellers.module';
import { ApiTokenCheck } from './common/middleware/api-token-check';
import { ProductsController } from './resources/products/products.controller';

@Module({
  imports: [ProductsModule, SellersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
