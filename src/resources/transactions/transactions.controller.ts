import { Controller, Get, Post, Patch, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  transactionsByUser(@Req() request: Request) {
    return this.transactionsService.findByUser(request["firebaseUser"]["uid"]);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  createTransaction(@Param('productId') productId: string, @Req() request: Request) {
    return this.transactionsService.create(productId, request["firebaseUser"]["uid"]);
  }

  @Patch(':id/sell')
  sell(@Param('id') id: string, @Req() request: Request) {
    return this.transactionsService.sell(id, request["firebaseUser"]["uid"]);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() request: Request) {
    return this.transactionsService.cancel(id, request["firebaseUser"]["uid"]);
  }
}
