import * as admin from 'firebase-admin';

export class FirebaseReviewSchema {
    id?: string;
    transactionId: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    score: number;
    description?: string;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}
