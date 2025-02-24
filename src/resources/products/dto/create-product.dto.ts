import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateProductDto {

    // TODO
    @IsString()
    @IsNotEmpty()
    img: string

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
