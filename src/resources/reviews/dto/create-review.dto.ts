import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    score: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
