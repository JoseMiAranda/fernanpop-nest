import * as admin from 'firebase-admin';

export class FirebaseConversationSchema {
  id?: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  buyerId: string;
  enabled: boolean;
  disabledReason?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  lastMessageAt: admin.firestore.Timestamp;
  lastMessageSenderId?: string;
}
