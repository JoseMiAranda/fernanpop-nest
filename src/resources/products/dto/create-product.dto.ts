import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from "class-validator";

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
}
