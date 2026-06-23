import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidCategory } from '../validators/is-valid-category.validator';

export const PRODUCT_SORT_OPTIONS = ['newest', 'oldest'] as const;
export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number];

export const PRODUCT_RESERVED_FILTER_OPTIONS = ['all', 'yes', 'no'] as const;
export type ProductReservedFilterOption = (typeof PRODUCT_RESERVED_FILTER_OPTIONS)[number];

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

    @IsOptional()
    @IsIn(PRODUCT_SORT_OPTIONS)
    sort: ProductSortOption = 'newest';

    @IsOptional()
    @IsIn(PRODUCT_RESERVED_FILTER_OPTIONS)
    reserved: ProductReservedFilterOption = 'all';
}