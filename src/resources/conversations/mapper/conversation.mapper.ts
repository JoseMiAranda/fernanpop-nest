import * as admin from 'firebase-admin';
import { FirebaseConversationSchema } from '../../../firebase/schema/firebase-conversation.schema';
import { FirebaseMessageSchema } from '../../../firebase/schema/firebase-message.schema';
import { Conversation } from '../entities/conversation.entity';
import { ConversationDisabledReason } from '../entities/conversation-disabled-reason.entity';
import { Message } from '../entities/message.entity';

const validDisabledReasons: string[] = [
  ConversationDisabledReason.SOLD,
  ConversationDisabledReason.DELETED,
];

export function firebaseConversationSchemaToConversation(
  firebaseConversation: FirebaseConversationSchema,
): Conversation {
  return {
    id: firebaseConversation.id,
    productId: firebaseConversation.productId,
    productSlug: firebaseConversation.productSlug,
    productTitle: firebaseConversation.productTitle,
    productImage: firebaseConversation.productImage,
    sellerId: firebaseConversation.sellerId,
    buyerId: firebaseConversation.buyerId,
    enabled: firebaseConversation.enabled,
    disabledReason: validDisabledReasons.includes(firebaseConversation.disabledReason ?? '')
      ? firebaseConversation.disabledReason as ConversationDisabledReason
      : undefined,
    createdAt: firebaseConversation.createdAt.toDate(),
    updatedAt: firebaseConversation.updatedAt.toDate(),
    lastMessageAt: firebaseConversation.lastMessageAt.toDate(),
  };
}

export function conversationToFirebaseConversationSchema(
  conversation: Conversation,
): FirebaseConversationSchema {
  const firebaseConversation: FirebaseConversationSchema = {
    productId: conversation.productId,
    productSlug: conversation.productSlug,
    productTitle: conversation.productTitle,
    productImage: conversation.productImage,
    sellerId: conversation.sellerId,
    buyerId: conversation.buyerId,
    enabled: conversation.enabled,
    createdAt: admin.firestore.Timestamp.fromDate(conversation.createdAt),
    updatedAt: admin.firestore.Timestamp.fromDate(conversation.updatedAt),
    lastMessageAt: admin.firestore.Timestamp.fromDate(conversation.lastMessageAt),
  };

  if (conversation.disabledReason) {
    firebaseConversation.disabledReason = conversation.disabledReason;
  }

  return firebaseConversation;
}

export function firebaseMessageSchemaToMessage(
  firebaseMessage: FirebaseMessageSchema,
  content: string,
): Message {
  return {
    id: firebaseMessage.id,
    senderId: firebaseMessage.senderId,
    content,
    createdAt: firebaseMessage.createdAt.toDate(),
  };
}
