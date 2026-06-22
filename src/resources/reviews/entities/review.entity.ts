export class Review {
    id?: string;
    transactionId: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    score: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
