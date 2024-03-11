import { IsNotEmpty, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    idProduct: string;
}