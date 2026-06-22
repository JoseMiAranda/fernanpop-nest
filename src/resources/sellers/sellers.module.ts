import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { ProductsModule } from '../products/products.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [ProductsModule, ReviewsModule],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
