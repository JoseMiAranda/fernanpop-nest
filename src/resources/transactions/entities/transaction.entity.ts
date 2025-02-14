import { TransactionStatus } from "./transaction-status";

export class Transaction {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    creationDate: number;
    updateDate: number;
    status: TransactionStatus;
}
