import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidCategory } from '../validators/is-valid-category.validator';

export class FilterProductDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => parseInt(value))
    page: number = 1;

    @IsOptional()
    @IsString()
    q: string = '';

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => parseInt(value))
    price_min: number = 0;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => parseInt(value))
    price_max: number = Number.MAX_SAFE_INTEGER;

    @IsOptional()
    @IsString()
    @IsValidCategory()
    @Transform(({ value }) => value === '' ? undefined : value)
    categoryId?: string;
}