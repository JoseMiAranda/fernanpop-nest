import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { FilterProductDto } from '../dto/filter-product.dto';

@Injectable()
export class PriceRangeValidationPipe implements PipeTransform {
  transform(value: FilterProductDto, metadata: ArgumentMetadata) {
    const { price_min, price_max } = value;

    if (price_max < price_min) {
      throw new BadRequestException('price_max cannot be less than price_min.');
    }

    return value;
  }
}
