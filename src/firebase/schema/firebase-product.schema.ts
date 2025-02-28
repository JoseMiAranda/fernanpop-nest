import * as admin from 'firebase-admin';

export class FirebaseProductSchema {
    id?: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    status: string[];
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}