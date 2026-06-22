import { Controller, Get, Param } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sellersService.findById(id);
  }

  @Get(':id/products')
  findProducts(@Param('id') id: string) {
    return this.sellersService.findProducts(id);
  }

  @Get(':id/sold')
  findSold(@Param('id') id: string) {
    return this.sellersService.findSold(id);
  }

  @Get(':id/purchased')
  findPurchased(@Param('id') id: string) {
    return this.sellersService.findPurchased(id);
  }

  @Get(':id/reviews')
  findReviews(@Param('id') id: string) {
    return this.reviewsService.findBySellerId(id);
  }
}
