import { TransactionStatus } from "./transaction-status";
import { TransactionReview } from "./transaction-review.entity";

export class Transaction {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    sellerEmail: string;
    title: string;
    price: number;
    image: string;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
    review?: TransactionReview;
}
