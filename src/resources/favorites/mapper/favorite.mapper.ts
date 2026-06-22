import * as admin from 'firebase-admin';
import { Favorite } from '../entities/favorite.entity';
import { FirebaseFavoriteSchema } from '../../../firebase/schema/firebase-favorite.schema';

export function firebaseFavoriteSchemaToFavorite(firebaseFavorite: FirebaseFavoriteSchema): Favorite {
    return {
        id: firebaseFavorite.id,
        userId: firebaseFavorite.userId,
        productId: firebaseFavorite.productId,
        createdAt: firebaseFavorite.createdAt.toDate(),
    };
}

export function favoriteToFirebaseFavoriteSchema(favorite: Favorite): FirebaseFavoriteSchema {
    return {
        userId: favorite.userId,
        productId: favorite.productId,
        createdAt: admin.firestore.Timestamp.fromDate(favorite.createdAt),
    };
}
