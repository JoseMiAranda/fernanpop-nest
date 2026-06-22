import { Injectable } from '@nestjs/common';
import firebase from '../../firebase/firebase';
import { Seller } from './entities/seller.entity';
import { SoldItem } from './entities/sold-item.entity';
import { PurchasedItem } from './entities/purchased-item.entity';
import { ProductsService } from '../products/products.service';
import { TransactionStatus } from '../transactions/entities/transaction-status';
import { FirebaseTransactionSchema } from '../../firebase/schema/firebase-transaction.schema';
import { firebaseTransactionSchemaToTransaction } from '../transactions/mapper/transaction.mapper';
import { UserProfileService } from '../../common/services/user-profile.service';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class SellersService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly userProfileService: UserProfileService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async findById(id: string): Promise<Seller> {
    return this.userProfileService.getSellerProfile(id);
  }

  async findProducts(sellerId: string) {
    return this.productsService.findBySeller(sellerId);
  }

  async findSold(sellerId: string): Promise<SoldItem[]> {
    const transactionsRef = firebase.firestore().collection('transactions')
      .where('sellerId', '==', sellerId)
      .where('status', '==', TransactionStatus.RECEIVED);

    const transactionsDocs = (await transactionsRef.get()).docs;

    const soldItems: SoldItem[] = transactionsDocs.map((doc) => {
      const firebaseTransaction = doc.data() as FirebaseTransactionSchema;
      firebaseTransaction.id = doc.id;
      const transaction = firebaseTransactionSchemaToTransaction(firebaseTransaction);

      return {
        id: transaction.id,
        productId: transaction.productId,
        title: transaction.title,
        price: transaction.price,
        image: transaction.image,
        soldAt: transaction.updatedAt,
      };
    });

    return soldItems.sort((a, b) => b.soldAt.getTime() - a.soldAt.getTime());
  }

  async findPurchased(buyerId: string): Promise<PurchasedItem[]> {
    const transactionsRef = firebase.firestore().collection('transactions')
      .where('buyerId', '==', buyerId)
      .where('status', '==', TransactionStatus.RECEIVED);

    const transactionsDocs = (await transactionsRef.get()).docs;

    const purchasedItems: PurchasedItem[] = transactionsDocs.map((doc) => {
      const firebaseTransaction = doc.data() as FirebaseTransactionSchema;
      firebaseTransaction.id = doc.id;
      const transaction = firebaseTransactionSchemaToTransaction(firebaseTransaction);

      return {
        id: transaction.id,
        productId: transaction.productId,
        sellerId: transaction.sellerId,
        sellerEmail: transaction.sellerEmail,
        title: transaction.title,
        price: transaction.price,
        image: transaction.image,
        purchasedAt: transaction.updatedAt,
      };
    }).sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());

    const transactionIds = purchasedItems
      .map((item) => item.id)
      .filter((id): id is string => !!id);

    const reviewsMap = await this.reviewsService.findByTransactionIds(transactionIds);

    for (const item of purchasedItems) {
      if (item.id && reviewsMap.has(item.id)) {
        const review = reviewsMap.get(item.id)!;
        item.review = {
          score: review.score,
          description: review.description,
          createdAt: review.createdAt,
        };
      }
    }

    return purchasedItems;
  }
}
