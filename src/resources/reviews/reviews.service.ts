import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import firebase from '../../firebase/firebase';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { FirebaseReviewSchema } from '../../firebase/schema/firebase-review.schema';
import { FirebaseTransactionSchema } from '../../firebase/schema/firebase-transaction.schema';
import { TransactionStatus } from '../transactions/entities/transaction-status';
import { firebaseReviewSchemaToReview, reviewToFirebaseReviewSchema } from './mapper/review.mapper';
import { SellerReviewsSummary } from './entities/seller-reviews-summary.entity';

@Injectable()
export class ReviewsService {
  async create(transactionId: string, buyerId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const transactionRef = firebase.firestore().collection('transactions').doc(transactionId);
    const foundTransaction = await transactionRef.get();

    if (!foundTransaction.exists) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseTransaction = foundTransaction.data() as FirebaseTransactionSchema;

    if (firebaseTransaction.buyerId !== buyerId) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    if (firebaseTransaction.status !== TransactionStatus.RECEIVED) {
      throw new HttpException('transaction-not-completed', HttpStatus.BAD_REQUEST);
    }

    const existingReview = await firebase.firestore().collection('reviews')
      .where('transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      throw new HttpException('review-already-exists', HttpStatus.CONFLICT);
    }

    const createdAt = new Date();
    const newReview: Review = {
      transactionId,
      productId: firebaseTransaction.productId,
      buyerId,
      sellerId: firebaseTransaction.sellerId,
      score: createReviewDto.score,
      description: createReviewDto.description,
      createdAt,
      updatedAt: createdAt,
    };

    const reviewRef = firebase.firestore().collection('reviews').doc();
    const firebaseReview = reviewToFirebaseReviewSchema(newReview);

    return reviewRef.set(firebaseReview).then(() => {
      newReview.id = reviewRef.id;
      return newReview;
    }).catch(() => {
      throw new HttpException("can't-create-review", HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  async findByTransactionIds(transactionIds: string[]): Promise<Map<string, Review>> {
    const reviewsMap = new Map<string, Review>();

    if (transactionIds.length === 0) {
      return reviewsMap;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < transactionIds.length; i += 10) {
      chunks.push(transactionIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const reviewsRef = firebase.firestore().collection('reviews')
        .where('transactionId', 'in', chunk);

      const reviewsDocs = (await reviewsRef.get()).docs;

      for (const doc of reviewsDocs) {
        const firebaseReview = doc.data() as FirebaseReviewSchema;
        firebaseReview.id = doc.id;
        const review = firebaseReviewSchemaToReview(firebaseReview);
        reviewsMap.set(review.transactionId, review);
      }
    }

    return reviewsMap;
  }

  async findBySellerId(sellerId: string): Promise<SellerReviewsSummary> {
    const reviewsRef = firebase.firestore().collection('reviews')
      .where('sellerId', '==', sellerId);

    const reviewsDocs = (await reviewsRef.get()).docs;

    const reviews: Review[] = reviewsDocs.map((doc) => {
      const firebaseReview = doc.data() as FirebaseReviewSchema;
      firebaseReview.id = doc.id;
      return firebaseReviewSchemaToReview(firebaseReview);
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalReviews = reviews.length;
    const averageScore = totalReviews === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.score, 0) / totalReviews) * 10) / 10;

    return {
      averageScore,
      totalReviews,
      reviews,
    };
  }
}
