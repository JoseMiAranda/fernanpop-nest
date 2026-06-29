import * as admin from 'firebase-admin';
import { Filter } from 'firebase-admin/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import firebase from '../../firebase/firebase';
import { FirebaseConversationSchema } from '../../firebase/schema/firebase-conversation.schema';
import { FirebaseMessageSchema } from '../../firebase/schema/firebase-message.schema';
import { MessageEncryptionService } from '../../common/services/message-encryption.service';
import { UserProfileService } from '../../common/services/user-profile.service';
import { FirebaseProductSchema } from '../../firebase/schema/firebase-product.schema';
import { ProductStatus } from '../products/entities/produc-status.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationDisabledReason } from './entities/conversation-disabled-reason.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import {
  conversationToFirebaseConversationSchema,
  firebaseConversationSchemaToConversation,
  firebaseMessageSchemaToMessage,
} from './mapper/conversation.mapper';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly messageEncryptionService: MessageEncryptionService,
    private readonly userProfileService: UserProfileService,
  ) {}

  async createOrGetByProduct(productId: string, buyerId: string) {
    const productRef = firebase.firestore().collection('products').doc(productId);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if (firebaseProduct.sellerId === buyerId) {
      throw new HttpException("user-can't-create-conversation-with-his-own-product", HttpStatus.FORBIDDEN);
    }

    if (this.isProductUnavailable(firebaseProduct.status)) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const conversationId = this.buildConversationId(productId, buyerId);
    const conversationRef = firebase.firestore().collection('conversations').doc(conversationId);
    const foundConversation = await conversationRef.get();

    if (foundConversation.exists) {
      const firebaseConversation = foundConversation.data() as FirebaseConversationSchema;
      firebaseConversation.id = foundConversation.id;
      return this.populateConversationNames(firebaseConversationSchemaToConversation(firebaseConversation));
    }

    const createdAt = new Date();
    const conversation: Conversation = {
      id: conversationId,
      productId,
      productSlug: firebaseProduct.slug,
      productTitle: firebaseProduct.title,
      productImage: firebaseProduct.images[0] ?? '',
      sellerId: firebaseProduct.sellerId,
      buyerId,
      enabled: true,
      createdAt,
      updatedAt: createdAt,
      lastMessageAt: createdAt,
    };

    const firebaseConversation = conversationToFirebaseConversationSchema(conversation);

    return conversationRef
      .set(firebaseConversation)
      .then(() => this.populateConversationNames(conversation))
      .catch(() => {
        throw new HttpException("can't-create-conversation", HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  async findByUser(userId: string) {
    const conversationsRef = firebase.firestore().collection('conversations').where(
      Filter.or(
        Filter.where('sellerId', '==', userId),
        Filter.where('buyerId', '==', userId),
      ),
    );

    const foundConversations = await conversationsRef.get();

    const conversations = foundConversations.docs.map((doc) => {
      const firebaseConversation = doc.data() as FirebaseConversationSchema;
      firebaseConversation.id = doc.id;
      return firebaseConversationSchemaToConversation(firebaseConversation);
    });

    const hydrated = await this.populateConversationNames(conversations) as Conversation[];
    return hydrated.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.getConversationForUser(id, userId);
    return this.populateConversationNames(conversation);
  }

  async findMessages(id: string, userId: string, since?: string) {
    await this.getConversationForUser(id, userId);

    let messagesQuery: FirebaseFirestore.Query = firebase.firestore()
      .collection('conversations')
      .doc(id)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    if (since) {
      const parsedSince = new Date(since);
      if (Number.isNaN(parsedSince.getTime())) {
        throw new HttpException('invalid-since-date', HttpStatus.BAD_REQUEST);
      }

      messagesQuery = messagesQuery.where(
        'createdAt',
        '>',
        admin.firestore.Timestamp.fromDate(parsedSince),
      );
    }

    const foundMessages = await messagesQuery.get();

    return foundMessages.docs.map((doc) => {
      const firebaseMessage = doc.data() as FirebaseMessageSchema;
      firebaseMessage.id = doc.id;

      const content = this.messageEncryptionService.decrypt({
        ciphertext: firebaseMessage.ciphertext,
        iv: firebaseMessage.iv,
        authTag: firebaseMessage.authTag,
      });

      return firebaseMessageSchemaToMessage(firebaseMessage, content);
    });
  }

  async createMessage(id: string, userId: string, createMessageDto: CreateMessageDto) {
    const conversation = await this.getConversationForUser(id, userId);

    if (!conversation.enabled) {
      throw new HttpException('conversation-disabled', HttpStatus.CONFLICT);
    }

    const productRef = firebase.firestore().collection('products').doc(conversation.productId);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      await this.disableConversation(id, ConversationDisabledReason.DELETED);
      throw new HttpException('conversation-disabled', HttpStatus.CONFLICT);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;
    const disabledReason = this.getDisabledReason(firebaseProduct.status);

    if (disabledReason) {
      await this.disableConversation(id, disabledReason);
      throw new HttpException('conversation-disabled', HttpStatus.CONFLICT);
    }

    const createdAt = new Date();
    const encryptedPayload = this.messageEncryptionService.encrypt(createMessageDto.content.trim());

    const messageRef = firebase.firestore()
      .collection('conversations')
      .doc(id)
      .collection('messages')
      .doc();

    const firebaseMessage: FirebaseMessageSchema = {
      senderId: userId,
      ciphertext: encryptedPayload.ciphertext,
      iv: encryptedPayload.iv,
      authTag: encryptedPayload.authTag,
      createdAt: admin.firestore.Timestamp.fromDate(createdAt),
    };

    const conversationRef = firebase.firestore().collection('conversations').doc(id);
    const batch = firebase.firestore().batch();
    batch.create(messageRef, firebaseMessage);
    batch.update(conversationRef, {
      updatedAt: admin.firestore.Timestamp.fromDate(createdAt),
      lastMessageAt: admin.firestore.Timestamp.fromDate(createdAt),
      lastMessageSenderId: userId,
    });

    return batch.commit().then(() => {
      const message: Message = {
        id: messageRef.id,
        senderId: userId,
        content: createMessageDto.content.trim(),
        createdAt,
      };

      return message;
    }).catch(() => {
      throw new HttpException("can't-create-message", HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  async disableByProductId(productId: string, reason: ConversationDisabledReason) {
    const foundConversations = await firebase.firestore()
      .collection('conversations')
      .where('productId', '==', productId)
      .get();

    if (foundConversations.empty) {
      return;
    }

    const updatedAt = admin.firestore.Timestamp.now();
    const batch = firebase.firestore().batch();

    foundConversations.docs.forEach((doc) => {
      batch.update(doc.ref, {
        enabled: false,
        disabledReason: reason,
        updatedAt,
      });
    });

    await batch.commit();
  }

  private async getConversationForUser(id: string, userId: string) {
    const foundConversation = await firebase.firestore().collection('conversations').doc(id).get();

    if (!foundConversation.exists) {
      throw new HttpException('conversation-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseConversation = foundConversation.data() as FirebaseConversationSchema;

    if (firebaseConversation.buyerId !== userId && firebaseConversation.sellerId !== userId) {
      throw new HttpException('conversation-not-found', HttpStatus.NOT_FOUND);
    }

    firebaseConversation.id = foundConversation.id;
    return firebaseConversationSchemaToConversation(firebaseConversation);
  }

  private async populateConversationNames(
    conversations: Conversation | Conversation[],
  ): Promise<Conversation | Conversation[]> {
    const collection = Array.isArray(conversations) ? conversations : [conversations];
    const userIds = collection.flatMap((conversation) => [conversation.sellerId, conversation.buyerId]);
    const displayNames = await this.userProfileService.getDisplayNamesByIds(userIds);

    const hydrated = collection.map((conversation) => ({
      ...conversation,
      sellerName: displayNames.get(conversation.sellerId) ?? 'Vendedor',
      buyerName: displayNames.get(conversation.buyerId) ?? 'Comprador',
    }));

    return Array.isArray(conversations) ? hydrated : hydrated[0];
  }

  private buildConversationId(productId: string, buyerId: string) {
    return `${productId}_${buyerId}`;
  }

  private isProductUnavailable(status: string[]) {
    return status.includes(ProductStatus.SOLD) || status.includes(ProductStatus.DELETED);
  }

  private getDisabledReason(status: string[]) {
    if (status.includes(ProductStatus.SOLD)) {
      return ConversationDisabledReason.SOLD;
    }

    if (status.includes(ProductStatus.DELETED)) {
      return ConversationDisabledReason.DELETED;
    }

    return undefined;
  }

  private async disableConversation(id: string, reason: ConversationDisabledReason) {
    await firebase.firestore().collection('conversations').doc(id).update({
      enabled: false,
      disabledReason: reason,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
}
