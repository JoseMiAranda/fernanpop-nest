import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, HttpStatus, HttpCode, UsePipes } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { PriceRangeValidationPipe } from './validators/price-range.validator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @UsePipes(new PriceRangeValidationPipe())
  find(@Query() queryParams: FilterProductDto) {
    return this.productsService.find(queryParams);
  }

  @Get('/seller')
  findBySeller(@Req() request: Request){
    return this.productsService.findBySeller(request["firebaseUser"]["uid"]);
  }

  @Get(':id')
  findById(@Param('id') id: string){
    return this.productsService.findById(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() request: Request) {
    return this.productsService.create(createProductDto, request["firebaseUser"]["uid"]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.productsService.update(id, request["firebaseUser"]["uid"], updateProductDto);
  }
}
