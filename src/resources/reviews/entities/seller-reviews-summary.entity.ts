import { Review } from './review.entity';

export class SellerReviewsSummary {
    averageScore: number;
    totalReviews: number;
    reviews: Review[];
}
