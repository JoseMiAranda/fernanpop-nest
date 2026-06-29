import { ConversationDisabledReason } from './conversation-disabled-reason.entity';

export class Conversation {
  id?: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  buyerId: string;
  sellerName?: string;
  buyerName?: string;
  enabled: boolean;
  disabledReason?: ConversationDisabledReason;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  lastMessageSenderId?: string;
}
