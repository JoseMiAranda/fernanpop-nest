import { TransactionStatus } from "./transaction-status";

export class Transaction {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    price: number;
    image: string;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
}
