import * as admin from 'firebase-admin';

export class FirebaseTransactionSchema {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    price: number;
    image: string;
    status: string[];
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}