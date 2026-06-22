import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import firebase from '../../firebase/firebase';
import { Favorite } from './entities/favorite.entity';
import { FirebaseProductSchema } from '../../firebase/schema/firebase-product.schema';
import { favoriteToFirebaseFavoriteSchema } from './mapper/favorite.mapper';
import { firebaseProductSchemaToProduct } from '../products/mapper/product.mapper';
import { Product } from '../products/entities/product.entity';
import { ProductStatus } from '../products/entities/produc-status.entity';

@Injectable()
export class FavoritesService {
  async create(productId: string, userId: string): Promise<Favorite> {
    const product = await this.getAvailableProduct(productId);

    if (product.sellerId === userId) {
      throw new HttpException('cant-favorite-own-product', HttpStatus.BAD_REQUEST);
    }

    const existingFavorite = await firebase.firestore().collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (!existingFavorite.empty) {
      throw new HttpException('favorite-already-exists', HttpStatus.CONFLICT);
    }

    const createdAt = new Date();
    const newFavorite: Favorite = {
      userId,
      productId,
      createdAt,
    };

    const favoriteRef = firebase.firestore().collection('favorites').doc();
    const firebaseFavorite = favoriteToFirebaseFavoriteSchema(newFavorite);

    return favoriteRef.set(firebaseFavorite).then(() => {
      newFavorite.id = favoriteRef.id;
      return newFavorite;
    }).catch(() => {
      throw new HttpException("can't-create-favorite", HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

  async remove(productId: string, userId: string): Promise<void> {
    const existingFavorite = await firebase.firestore().collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (existingFavorite.empty) {
      throw new HttpException('favorite-not-found', HttpStatus.NOT_FOUND);
    }

    const favoriteDoc = existingFavorite.docs[0];

    try {
      await favoriteDoc.ref.delete();
    } catch {
      throw new HttpException("can't-delete-favorite", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findProductIdsByUser(userId: string): Promise<string[]> {
    const favoritesDocs = await this.getFavoritesByUser(userId);
    return favoritesDocs.map((doc) => doc.data().productId);
  }

  async findProductsByUser(userId: string): Promise<Product[]> {
    const favoritesDocs = await this.getFavoritesByUser(userId);

    if (favoritesDocs.length === 0) {
      return [];
    }

    const productIds = favoritesDocs.map((doc) => doc.data().productId);
    const productsMap = await this.findProductsByIds(productIds);

    return favoritesDocs
      .map((doc) => productsMap.get(doc.data().productId))
      .filter((product): product is Product => product !== undefined);
  }

  private async getFavoritesByUser(userId: string) {
    const favoritesRef = firebase.firestore().collection('favorites')
      .where('userId', '==', userId);

    const favoritesSnapshot = await favoritesRef.get();

    return favoritesSnapshot.docs.sort((a, b) => {
      const aCreatedAt = a.data().createdAt?.toMillis?.() ?? 0;
      const bCreatedAt = b.data().createdAt?.toMillis?.() ?? 0;
      return bCreatedAt - aCreatedAt;
    });
  }

  private async getAvailableProduct(productId: string): Promise<Product> {
    const productRef = firebase.firestore().collection('products').doc(productId);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;
    firebaseProduct.id = foundProduct.id;
    const product = firebaseProductSchemaToProduct(firebaseProduct);

    if (product.status.includes(ProductStatus.SOLD) || product.status.includes(ProductStatus.DELETED)) {
      throw new HttpException('product-not-available', HttpStatus.BAD_REQUEST);
    }

    return product;
  }

  private async findProductsByIds(productIds: string[]): Promise<Map<string, Product>> {
    const productsMap = new Map<string, Product>();

    if (productIds.length === 0) {
      return productsMap;
    }

    const uniqueProductIds = [...new Set(productIds)];
    const chunks: string[][] = [];

    for (let i = 0; i < uniqueProductIds.length; i += 10) {
      chunks.push(uniqueProductIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const productsRef = firebase.firestore().collection('products')
        .where(admin.firestore.FieldPath.documentId(), 'in', chunk);

      const productsDocs = (await productsRef.get()).docs;

      productsDocs.forEach((productDoc) => {
        const firebaseProduct = productDoc.data() as FirebaseProductSchema;
        firebaseProduct.id = productDoc.id;
        const product = firebaseProductSchemaToProduct(firebaseProduct);

        if (!(product.status.includes(ProductStatus.SOLD) || product.status.includes(ProductStatus.DELETED))) {
          productsMap.set(product.id!, product);
        }
      });
    }

    return productsMap;
  }
}
