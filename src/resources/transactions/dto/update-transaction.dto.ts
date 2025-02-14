import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TransactionStatus } from '../entities/transaction-status';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    @IsEnum(TransactionStatus)
    status: TransactionStatus;
}




