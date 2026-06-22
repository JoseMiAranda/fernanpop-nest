import { Controller, Get, Param } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sellersService.findById(id);
  }

  @Get(':id/products')
  findProducts(@Param('id') id: string) {
    return this.sellersService.findProducts(id);
  }

  @Get(':id/sold')
  findSold(@Param('id') id: string) {
    return this.sellersService.findSold(id);
  }
}
