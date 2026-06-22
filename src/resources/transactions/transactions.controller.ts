import { Body, Controller, Get, Post, Patch, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  transactionsByUser(@Req() request: Request) {
    return this.transactionsService.findByUser(request["firebaseUser"]["uid"]);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  createTransaction(@Param('productId') productId: string, @Req() request: Request) {
    return this.transactionsService.create(productId, request["firebaseUser"]["uid"]);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Req() request: Request) {
    return this.transactionsService.accept(id, request["firebaseUser"]["uid"]);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() request: Request) {
    return this.transactionsService.cancel(id, request["firebaseUser"]["uid"]);
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.CREATED)
  createReview(
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: Request,
  ) {
    return this.reviewsService.create(id, request["firebaseUser"]["uid"], createReviewDto);
  }
}
