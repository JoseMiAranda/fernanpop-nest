import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import * as admin from 'firebase-admin'

@Injectable()
export class SellersService {
  
  constructor(private productsService: ProductsService, private transactionsService: TransactionsService) {}

  async createProduct(createProductDto: CreateProductDto, sellerId: string) {
    return await this.productsService.create(createProductDto, sellerId)
  }

  async productsBySeller(queryParams: any, sellerId: string) {
    return await this.productsService.findBySeller(queryParams, sellerId)
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, sellerId: string) {
    return await this.productsService.update(id, updateProductDto, sellerId)
  }

  async removeProduct(idProduct: string, idSeller: string) {
    return await this.productsService.remove(idProduct, idSeller);
  }

  async createTransacion(createTransactionDto: CreateTransactionDto, buyerId: any) {
    
    // Si el producto no existe
    let product;
    try {
        product = await this.productsService.findById(createTransactionDto.idProduct);
    } catch (error) {
        throw new HttpException("product-not-found", HttpStatus.NOT_FOUND);
    }

    let sellerId = product.sellerId;

    if(sellerId == buyerId) {
        throw new HttpException("user-can't-sell-his-self", HttpStatus.FORBIDDEN);
    }

    return this.transactionsService.create(product.id, sellerId, buyerId);
  }

  async getSellerById(idSeller: string) {
    const users = await admin.auth().listUsers();
    for (const user of users.users) {
      if (user.uid === idSeller) {
        return user;
      }
    }
    return null;
  }
}
