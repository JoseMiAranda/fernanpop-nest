import * as admin from 'firebase-admin';
import firebase from '../../src/firebase/firebase';
import { Product } from '../../src/resources/products/entities/product.entity';
import { ProductStatus } from '../../src/resources/products/entities/produc-status.entity';
import { productToFirebaseProductSchema } from '../../src/resources/products/mapper/product.mapper';
import { generateProductSlug } from '../../src/resources/products/utils/product-slug.util';
import { Transaction } from '../../src/resources/transactions/entities/transaction.entity';
import { transactionToFirebaseTransactionSchema } from '../../src/resources/transactions/mapper/transaction.mapper';
import { Favorite } from '../../src/resources/favorites/entities/favorite.entity';
import { favoriteToFirebaseFavoriteSchema } from '../../src/resources/favorites/mapper/favorite.mapper';
import { Review } from '../../src/resources/reviews/entities/review.entity';
import { reviewToFirebaseReviewSchema } from '../../src/resources/reviews/mapper/review.mapper';
import {
  SEED_FAVORITES,
  SEED_PASSWORD,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  SEED_TRANSACTIONS,
  SEED_USERS,
  SeedProduct,
  daysAgoToDate,
} from './seed-data';

const COLLECTIONS_TO_CLEAR = ['reviews', 'favorites', 'transactions', 'products'] as const;

function parseArgs(): { confirm: boolean } {
  return { confirm: process.argv.includes('--confirm') };
}

async function validateProductImages(): Promise<void> {
  console.log('Validando URLs de imágenes...');

  const failures: string[] = [];

  for (const product of SEED_PRODUCTS) {
    const response = await fetch(product.imageUrl, { method: 'HEAD' });

    if (!response.ok) {
      failures.push(`${product.title} → ${product.imageUrl} (${response.status})`);
      continue;
    }

    console.log(`  - ${product.title}: OK`);
  }

  if (failures.length > 0) {
    throw new Error(`Imágenes no disponibles:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  }
}

async function deleteCollection(collectionName: string): Promise<number> {
  const db = firebase.firestore();
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    return 0;
  }

  let deleted = 0;
  let batch = db.batch();
  let batchCount = 0;
  const commits: Promise<admin.firestore.WriteResult[]>[] = [];

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    batchCount++;
    deleted++;

    if (batchCount === 500) {
      commits.push(batch.commit());
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    commits.push(batch.commit());
  }

  await Promise.all(commits);
  return deleted;
}

async function clearFirestore(): Promise<void> {
  console.log('Limpiando colecciones de Firestore...');

  for (const collectionName of COLLECTIONS_TO_CLEAR) {
    const deleted = await deleteCollection(collectionName);
    console.log(`  - ${collectionName}: ${deleted} documentos eliminados`);
  }
}

async function clearSeedUsers(): Promise<void> {
  console.log('Eliminando usuarios de prueba en Firebase Auth...');

  for (const user of SEED_USERS) {
    try {
      await firebase.auth().deleteUser(user.uid);
      console.log(`  - ${user.email} eliminado`);
    } catch {
      console.log(`  - ${user.email} no existía`);
    }
  }
}

async function createSeedUsers(): Promise<Map<string, string>> {
  console.log('Creando usuarios en Firebase Auth...');

  const emails = new Map<string, string>();

  for (const user of SEED_USERS) {
    await firebase.auth().createUser({
      uid: user.uid,
      email: user.email,
      password: SEED_PASSWORD,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: true,
    });

    emails.set(user.uid, user.email);
    console.log(`  - ${user.displayName} <${user.email}>`);
  }

  return emails;
}

function resolveProductStatus(status: SeedProduct['status']): ProductStatus[] {
  if (status === 'available') {
    return [];
  }

  return status;
}

async function createSeedProducts(): Promise<Map<string, { id: string; slug: string; sellerId: string; title: string; price: number; image: string }>> {
  console.log('Creando productos...');

  const db = firebase.firestore();
  const products = new Map<string, { id: string; slug: string; sellerId: string; title: string; price: number; image: string }>();

  for (const seedProduct of SEED_PRODUCTS) {
    const createdAt = daysAgoToDate(seedProduct.daysAgo);
    const image = seedProduct.imageUrl;
    const slug = generateProductSlug(seedProduct.title, createdAt.getTime());

    const product: Product = {
      slug,
      sellerId: seedProduct.sellerUid,
      title: seedProduct.title,
      desc: seedProduct.desc,
      price: seedProduct.price,
      images: [image],
      categoryId: seedProduct.categoryId,
      condition: seedProduct.condition,
      status: resolveProductStatus(seedProduct.status),
      createdAt,
      updatedAt: createdAt,
    };

    const docRef = db.collection('products').doc();
    await docRef.set(productToFirebaseProductSchema(product));

    products.set(seedProduct.key, {
      id: docRef.id,
      slug,
      sellerId: seedProduct.sellerUid,
      title: seedProduct.title,
      price: seedProduct.price,
      image,
    });

    console.log(`  - ${seedProduct.title} → /product/${slug}`);
  }

  return products;
}

async function createSeedTransactions(
  products: Map<string, { id: string; slug: string; sellerId: string; title: string; price: number; image: string }>,
  emails: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('Creando transacciones...');

  const db = firebase.firestore();
  const transactions = new Map<string, string>();

  for (const seedTransaction of SEED_TRANSACTIONS) {
    const product = products.get(seedTransaction.productKey);

    if (!product) {
      throw new Error(`Producto no encontrado para transacción: ${seedTransaction.productKey}`);
    }

    const sellerEmail = emails.get(product.sellerId);

    if (!sellerEmail) {
      throw new Error(`Email no encontrado para vendedor: ${product.sellerId}`);
    }

    const createdAt = daysAgoToDate(seedTransaction.daysAgo);

    const transaction: Transaction = {
      productId: product.id,
      productSlug: product.slug,
      sellerId: product.sellerId,
      buyerId: seedTransaction.buyerUid,
      sellerEmail,
      title: product.title,
      price: product.price,
      image: product.image,
      status: seedTransaction.status,
      createdAt,
      updatedAt: createdAt,
    };

    const docRef = db.collection('transactions').doc();
    await docRef.set(transactionToFirebaseTransactionSchema(transaction));

    transactions.set(seedTransaction.key, docRef.id);
    console.log(`  - ${seedTransaction.key} (${seedTransaction.status})`);
  }

  return transactions;
}

async function createSeedFavorites(
  products: Map<string, { id: string; slug: string; sellerId: string; title: string; price: number; image: string }>,
): Promise<void> {
  console.log('Creando favoritos...');

  const db = firebase.firestore();

  for (const seedFavorite of SEED_FAVORITES) {
    const product = products.get(seedFavorite.productKey);

    if (!product) {
      throw new Error(`Producto no encontrado para favorito: ${seedFavorite.productKey}`);
    }

    const favorite: Favorite = {
      userId: seedFavorite.userUid,
      productId: product.id,
      createdAt: daysAgoToDate(seedFavorite.daysAgo),
    };

    const docRef = db.collection('favorites').doc();
    await docRef.set(favoriteToFirebaseFavoriteSchema(favorite));

    console.log(`  - ${seedFavorite.userUid} → ${seedFavorite.productKey}`);
  }
}

async function createSeedReviews(
  transactions: Map<string, string>,
  products: Map<string, { id: string; slug: string; sellerId: string; title: string; price: number; image: string }>,
): Promise<void> {
  console.log('Creando valoraciones...');

  const db = firebase.firestore();

  for (const seedReview of SEED_REVIEWS) {
    const transactionId = transactions.get(seedReview.transactionKey);

    if (!transactionId) {
      throw new Error(`Transacción no encontrada para review: ${seedReview.transactionKey}`);
    }

    const seedTransaction = SEED_TRANSACTIONS.find((tx) => tx.key === seedReview.transactionKey);
    const product = seedTransaction
      ? products.get(seedTransaction.productKey)
      : undefined;

    if (!seedTransaction || !product) {
      throw new Error(`Datos incompletos para review: ${seedReview.transactionKey}`);
    }

    const createdAt = daysAgoToDate(0);

    const review: Review = {
      transactionId,
      productId: product.id,
      buyerId: seedTransaction.buyerUid,
      sellerId: product.sellerId,
      score: seedReview.score,
      description: seedReview.description,
      createdAt,
      updatedAt: createdAt,
    };

    const docRef = db.collection('reviews').doc();
    await docRef.set(reviewToFirebaseReviewSchema(review));

    console.log(`  - ${seedReview.transactionKey} → ${seedReview.score}/5`);
  }
}

function printSummary(): void {
  console.log('\nSeed completado.\n');
  console.log('Usuarios de prueba (contraseña para todos: ' + SEED_PASSWORD + '):');
  for (const user of SEED_USERS) {
    console.log(`  - ${user.displayName}: ${user.email}`);
  }
  console.log('\nVendedores: maria@fernanpop.dev, carlos@fernanpop.dev');
  console.log('Compradores: ana@fernanpop.dev, pedro@fernanpop.dev');
}

async function run(): Promise<void> {
  const { confirm } = parseArgs();

  if (!confirm) {
    console.error('Este script borra datos de Firestore y usuarios de prueba en Firebase Auth.');
    console.error('Proyecto: ' + process.env.FIREBASE_PROJECT_ID);
    console.error('\nPara ejecutarlo añade el flag --confirm:');
    console.error('  npm run seed -- --confirm');
    process.exit(1);
  }

  console.log('Iniciando seed en proyecto: ' + process.env.FIREBASE_PROJECT_ID + '\n');

  await validateProductImages();
  await clearFirestore();
  await clearSeedUsers();
  const emails = await createSeedUsers();
  const products = await createSeedProducts();
  const transactions = await createSeedTransactions(products, emails);
  await createSeedFavorites(products);
  await createSeedReviews(transactions, products);

  printSummary();
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nError durante el seed:', error);
    process.exit(1);
  });
