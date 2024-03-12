import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { StatusTransaction } from '../entities/status-transaction.entity';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    @IsString()
    @IsNotEmpty()
    @IsEnum(StatusTransaction)
    status: string;
}




