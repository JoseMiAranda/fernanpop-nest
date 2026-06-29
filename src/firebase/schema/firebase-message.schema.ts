import * as admin from 'firebase-admin';

export class FirebaseMessageSchema {
  id?: string;
  senderId: string;
  ciphertext: string;
  iv: string;
  authTag: string;
  createdAt: admin.firestore.Timestamp;
}
