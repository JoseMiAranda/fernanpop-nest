import * as admin from 'firebase-admin';
import { Review } from '../entities/review.entity';
import { FirebaseReviewSchema } from '../../../firebase/schema/firebase-review.schema';

export function firebaseReviewSchemaToReview(firebaseReview: FirebaseReviewSchema): Review {
    return {
        id: firebaseReview.id,
        transactionId: firebaseReview.transactionId,
        productId: firebaseReview.productId,
        buyerId: firebaseReview.buyerId,
        sellerId: firebaseReview.sellerId,
        score: firebaseReview.score,
        description: firebaseReview.description,
        createdAt: firebaseReview.createdAt.toDate(),
        updatedAt: firebaseReview.updatedAt.toDate(),
    };
}

export function reviewToFirebaseReviewSchema(review: Review): FirebaseReviewSchema {
    return {
        transactionId: review.transactionId,
        productId: review.productId,
        buyerId: review.buyerId,
        sellerId: review.sellerId,
        score: review.score,
        description: review.description,
        createdAt: admin.firestore.Timestamp.fromDate(review.createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(review.updatedAt),
    };
}
