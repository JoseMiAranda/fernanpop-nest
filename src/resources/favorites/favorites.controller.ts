import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() request: Request) {
    return this.favoritesService.findProductsByUser(request['firebaseUser']['uid']);
  }

  @Get('ids')
  findIds(@Req() request: Request) {
    return this.favoritesService.findProductIdsByUser(request['firebaseUser']['uid']);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  create(@Param('productId') productId: string, @Req() request: Request) {
    return this.favoritesService.create(productId, request['firebaseUser']['uid']);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('productId') productId: string, @Req() request: Request) {
    return this.favoritesService.remove(productId, request['firebaseUser']['uid']);
  }
}
