import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import firebase from 'src/firebase/firebase';
import { Transaction } from './entities/transaction.entity';
import { Filter } from 'firebase-admin/firestore';
import { TransactionStatus } from './entities/transaction-status';
import { FirebaseProductSchema } from 'src/firebase/schema/firebase-product.schema';
import { firebaseTransactionSchemaToTransaction, transactionToFirebaseTransactionSchema } from './mapper/transaction.mapper';
import { ProductStatus } from '../products/entities/produc-status.entity';
import { FirebaseTransactionSchema } from 'src/firebase/schema/firebase-transaction.schema';

@Injectable()
export class TransactionsService {
  async create(productId: string, buyerId: string) {
    //* Debe de cumplir lo siguiente:
    //* 1.- Crear una transacción
    //* 2.- Actualizar el producto

    const productRef = firebase.firestore().collection('products').doc(productId);

    const foundProduct = await productRef.get();

    if(!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if(firebaseProduct.sellerId == buyerId) {
      throw new HttpException("user-can't-buy-his-own-products", HttpStatus.FORBIDDEN);
    }

    const createdAt = new Date();

    // Creamos la transacción
    const transactionRef = firebase.firestore().collection('transactions').doc();
    const sellerEmail = (await admin.auth().getUser(firebaseProduct.sellerId)).email!;

    const newTransaction: Transaction = {
      productId: productRef.id,
      sellerId: firebaseProduct.sellerId,
      buyerId: buyerId,
      sellerEmail: sellerEmail,
      title: firebaseProduct.title,
      price: firebaseProduct.price,
      image: firebaseProduct.images[0],
      status: TransactionStatus.IN_PROCESS,
      createdAt: createdAt,
      updatedAt: createdAt,
    }

    const firebaseUpdatedProduct: FirebaseProductSchema = {
      ...firebaseProduct,
      status: [ProductStatus.RESERVED],
      updatedAt: admin.firestore.Timestamp.fromDate(createdAt),
    }

    const firebaseTransaction = transactionToFirebaseTransactionSchema(newTransaction);

    // Ejecutamos la creacion de la transaccion y la modificación del producto en una operación atómica
    const batch = firebase.firestore().batch();
    batch.create(transactionRef, firebaseTransaction);                            
    batch.update(productRef, {...firebaseUpdatedProduct});
    
    return batch.commit().then(() => {
      newTransaction.id = transactionRef.id;
      return newTransaction;
    })
    .catch(() => { throw new HttpException("can't-create-transaction", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  async findByUser(userId: string) {

    const transactionsRef = firebase.firestore().collection('transactions')
    .where(
      Filter.or(
        Filter.where('sellerId', '==', userId),
        Filter.where('buyerId', '==', userId)
      )
    );

    const transactionsDocs = (await transactionsRef.get()).docs;

    const transactions: Transaction[] = transactionsDocs.map((firebaseTransactionDoc) => {
      const firebaseTransaction = firebaseTransactionDoc.data() as FirebaseTransactionSchema;
      firebaseTransaction.id = firebaseTransactionDoc.id;
      const transaction = firebaseTransactionSchemaToTransaction(firebaseTransaction);
      return transaction;
    });

    return transactions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async accept(id: string, user: string) {
    //* Debe de cumplir lo siguiente:
    //* 1.- Actualizar la transacción
    //* 2.- Actualizar el producto

    const transactionRef = firebase.firestore().collection('transactions').doc(id);  

    const foundTransaction = await transactionRef.get();

    if(!foundTransaction.exists) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseTransaction = foundTransaction.data() as FirebaseTransactionSchema;

    if(firebaseTransaction.buyerId != user) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const productRef = firebase.firestore().collection('products').doc(firebaseTransaction.productId);

    const foundProduct = await productRef.get();

    if(!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if(firebaseProduct.status.includes(ProductStatus.SOLD) || firebaseProduct.status.includes(ProductStatus.DELETED)){
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const updatedAt = new Date();

    const firebaseSoldTransaction: FirebaseTransactionSchema = {
      ...firebaseTransaction,
      status: TransactionStatus.RECEIVED,
      updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
    }

    const firebaseUpdatedProduct: FirebaseProductSchema = {
      ...firebaseProduct,
      status: [...firebaseProduct.status, ProductStatus.RESERVED],
      updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
    }

    // Ejecutamos la actualización del producto y de la transacción
    const batch = firebase.firestore().batch();
    batch.update(transactionRef, {...firebaseSoldTransaction});                            
    batch.update(productRef, {...firebaseUpdatedProduct});
    
    return batch.commit().then(() => {
      const soldTransaction = firebaseTransactionSchemaToTransaction(firebaseSoldTransaction);
      soldTransaction.id = transactionRef.id;
      return soldTransaction;
    })
    .catch(() => { throw new HttpException("can'-update-transaction", HttpStatus.INTERNAL_SERVER_ERROR) });
    
  }

  async cancel(id: string, user: string) {
    //* Debe de cumplir lo siguiente:
    //* 1.- Actualizar la transacción
    //* 2.- Actualizar el producto

    const transactionRef = firebase.firestore().collection('transactions').doc(id);  

    const foundTransaction = await transactionRef.get();

    if(!foundTransaction.exists) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseTransaction = foundTransaction.data() as FirebaseTransactionSchema;

    if(firebaseTransaction.sellerId != user) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const productRef = firebase.firestore().collection('products').doc(firebaseTransaction.productId);

    const foundProduct = await productRef.get();

    if(!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if(firebaseProduct.status.includes(ProductStatus.SOLD) || firebaseProduct.status.includes(ProductStatus.DELETED)){
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const updatedAt = new Date();

    const firebaseCanceledTransaction: FirebaseTransactionSchema = {
      ...firebaseTransaction,
      status: TransactionStatus.CANCELED,
      updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
    }

    const status = firebaseProduct.status.filter((status) => status !== ProductStatus.RESERVED);

    const firebaseUpdatedProduct: FirebaseProductSchema = {
      ...firebaseProduct,
      status: status,
      updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
    }

    // Ejecutamos la actualización del producto y de la transacción
    const batch = firebase.firestore().batch();
    batch.update(transactionRef, {...firebaseCanceledTransaction});                            
    batch.update(productRef, {...firebaseUpdatedProduct});
    
    return batch.commit().then(() => {
      const canceledTransaction = firebaseTransactionSchemaToTransaction(firebaseCanceledTransaction);
      canceledTransaction.id = transactionRef.id;
      return canceledTransaction;
    })
    .catch(() => { throw new HttpException("can'-update-transaction", HttpStatus.INTERNAL_SERVER_ERROR) });
  }
}
