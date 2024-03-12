import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../transactions/dto/update-transaction.dto';


@Controller('seller')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('/product')
  createProduct(@Body() createProductDto: CreateProductDto, @Req() request: Request) {
    return this.sellersService.createProduct(createProductDto, request["firebaseUser"]["uid"]);
  }

  @Get('/products')
  productsBySeller(@Query() queryParams, @Req() request: Request) {
    return this.sellersService.productsBySeller(queryParams, request["firebaseUser"]["uid"]);
  }

  @Patch('/product/:id')
  update(@Param('id') productId: string, @Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.sellersService.updateProduct(productId, updateProductDto, request["firebaseUser"]["uid"]);
  }

  @Delete('/product/:id')
  remove(@Param('id') productId: string, @Req() request: Request) {
    return this.sellersService.removeProduct(productId, request["firebaseUser"]["uid"]);
  }

  @Post('/transaction')
  createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Req() request: Request) {
    return this.sellersService.createTransacion(createTransactionDto, request["firebaseUser"]["uid"]);
  }

  @Get('/transactions')
  transactionsByUser(@Req() request: Request) {
    return this.sellersService.transactionsByUser(request["firebaseUser"]["uid"]);
  }

  @Patch('/transaction/:id')
  updateTransaction(@Param('id') transactionId: string, @Body() updateTransactionDto: UpdateTransactionDto, @Req() request: Request) {
    return this.sellersService.updateTransaction(transactionId, updateTransactionDto, request["firebaseUser"]["uid"]);
  }
}
