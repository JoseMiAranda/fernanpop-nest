import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { UpdateProductDto } from '../products/dto/update-product.dto';

@Injectable()
export class SellersService {
  
  constructor(private productsService: ProductsService) {}

  async createProduct(createProductDto: CreateProductDto, sellerId: string) {
    return await this.productsService.create(createProductDto, sellerId)
  }

  async productsBySeller(queryParams: any, sellerId: string) {
    return await this.productsService.findBySeller(queryParams, sellerId)
  }

  async updateProduct(updateProductDto: UpdateProductDto, sellerId: any) {
    return await this.productsService.update(updateProductDto, sellerId)
  }

  async removeProduct(idProduct: string, idSeller: string) {
    return await this.productsService.remove(idProduct, idSeller);
  }

}
