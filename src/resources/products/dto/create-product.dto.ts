import { IsArray, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { IsValidCategory } from "../validators/is-valid-category.validator";
import { IsValidCondition } from "../validators/is-valid-condition.validator";

export class CreateProductDto {

    @IsArray()
    @IsString({ each: true }) 
    @IsNotEmpty()
    images: string[]

    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    desc: string

    @IsNumber()  
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price: number

    @IsString()
    @IsNotEmpty()
    @IsValidCategory()
    categoryId: string

    @IsString()
    @IsNotEmpty()
    @IsValidCondition()
    condition: string
}
