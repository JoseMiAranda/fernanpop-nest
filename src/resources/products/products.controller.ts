import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get('/filter')
  // Asignamos un valor por defecto a la página si no se ha definido o escrito correctamente
  find(@Query() queryParams) {
    return this.productsService.find(queryParams);
  }

  @Get('/:id')
  findById(@Param('id') id: string){
    return this.productsService.findById(id);
  }

}
