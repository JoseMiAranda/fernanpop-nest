import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Filter } from './entities/filter.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // @Get('/filter')
  // find(@Query() queryParams: Filter) {
  //   return this.productsService.find(queryParams);
  // }

  @Get(':id')
  findById(@Param('id') id: string){
    return this.productsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto, @Req() request: Request) {
    return this.productsService.create(createProductDto, request["firebaseUser"]["uid"]);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() request: Request) {
    return this.productsService.update(id, request["firebaseUser"]["uid"], updateProductDto);
  }
}
