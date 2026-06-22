import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProductStatus } from '../entities/produc-status.entity';
import { IsValidCategory } from '../validators/is-valid-category.validator';
import { IsValidCondition } from '../validators/is-valid-condition.validator';

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
    @IsString()
    @IsNotEmpty()
    @IsValidCategory()
    categoryId?: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsValidCondition()
    condition?: string

    @IsOptional()
    @IsArray()
    @IsEnum(ProductStatus, { each: true })
    status?: ProductStatus[]
}
