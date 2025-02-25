import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

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

  // @Patch(':id')
  // updateTransaction(@Param('id') transactionId: string, @Body() updateTransactionDto: UpdateTransactionDto, @Req() request: Request) {
  //   return this.transactionsService.update(transactionId, request["firebaseUser"]["uid"], updateTransactionDto);
  // }

  @Patch(':id/sell')
  @HttpCode(HttpStatus.CREATED)
  sell(@Param('id') productId: string, @Req() request: Request) {
    return this.transactionsService.sell(productId, request["firebaseUser"]["uid"]);
  }
}
