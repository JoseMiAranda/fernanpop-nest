import { TransactionReview } from '../../transactions/entities/transaction-review.entity';

export class PurchasedItem {
  id?: string;
  productId: string;
  sellerId: string;
  sellerEmail: string;
  title: string;
  price: number;
  image: string;
  purchasedAt: Date;
  review?: TransactionReview;
}
