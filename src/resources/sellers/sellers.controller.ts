import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';


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

  @Patch('/product')
  update(@Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.sellersService.updateProduct(updateProductDto, request["firebaseUser"]["uid"]);
  }

  @Delete('/product/:id')
  remove(@Param('id') idProduct: string, @Req() request: Request) {
    return this.sellersService.removeProduct(idProduct, request["firebaseUser"]["uid"]);
  }
}