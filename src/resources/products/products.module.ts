import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ApiTokenCheck } from '../../common/middleware/api-token-check';
import { EmailVerifiedCheck } from '../../common/middleware/email-verified-check';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheck)
      .forRoutes({ path: 'products/seller', method: RequestMethod.GET });

    consumer
      .apply(ApiTokenCheck, EmailVerifiedCheck)
      .forRoutes(
        { path: 'products', method: RequestMethod.POST },
        { path: 'products/:id', method: RequestMethod.PATCH },
        { path: 'products/:id', method: RequestMethod.DELETE },
      );
  }
}
