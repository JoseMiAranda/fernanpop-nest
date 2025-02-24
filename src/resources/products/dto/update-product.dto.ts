import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProductStatus } from '../entities/produc-status.entity';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true }) 
    @IsNotEmpty()
    images?: string[]

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    desc?: string

    @IsOptional()
    @IsNumber()  
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price?: number

    @IsOptional()
    @IsArray()
    @IsEnum(ProductStatus, { each: true })
    status?: ProductStatus[]
}
