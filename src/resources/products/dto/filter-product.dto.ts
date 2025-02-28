import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

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
    price_min: number = 0;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price_max: number = Number.MAX_SAFE_INTEGER;
}