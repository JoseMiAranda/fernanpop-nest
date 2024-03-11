import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    img: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    desc: string

    @IsOptional()
    @IsNumber()  
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price: number
}
