import * as admin from 'firebase-admin';

export class FirebaseFavoriteSchema {
    id?: string;
    userId: string;
    productId: string;
    createdAt: admin.firestore.Timestamp;
}
