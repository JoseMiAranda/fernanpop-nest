import * as admin from 'firebase-admin';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import firebase from 'src/firebase/firebase';
import { Product } from '../products/entities/product.entity';
import { Transaction } from './entities/transaction.entity';
import { Filter } from 'firebase-admin/firestore';
import { TransactionStatus } from './entities/transaction-status';
import { FirebaseProductSchema } from 'src/firebase/schema/firebase-product.schema';
import { firebaseTransactionSchemaToTransaction, transactionToFirebaseTransactionSchema } from './mapper/transaction.mapper';
import { ProductStatus } from '../products/entities/produc-status.entity';

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
    
    const newTransaction: Transaction = {
      productId: productRef.id,
      sellerId: firebaseProduct.sellerId,
      buyerId: buyerId,
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

    const transactions = await transactionsRef.get();

    const transactionsData: Transaction[] = transactions.docs.map((transaction) => {
      const userTransaction = transaction.data() as Transaction;
      userTransaction.id = transaction.id;
      return userTransaction;
    });

    return transactionsData;
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    const transactionRef = firebase.firestore().collection('transactions').doc(id);
    const foundTransaction = await transactionRef.get();

    if(!foundTransaction.exists) {
      throw new HttpException('transaction-not-found', HttpStatus.NOT_FOUND);
    }

    const transaction = foundTransaction.data() as Transaction;

    // Encontramos el documento que coincida en el comprador o vendedor
    if (!(transaction.sellerId == userId  || transaction.buyerId === userId)) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const updatedTransaction: Transaction = {
      productId: transaction.productId,
      buyerId: transaction.buyerId,
      sellerId: transaction.sellerId,
      creationDate: transaction.creationDate,
      updateDate: new Date().getTime(),
      status: updateTransactionDto.status,
    }

    return transactionRef.update({updatedTransaction})
      .then(() => {
        updatedTransaction.id = transactionRef.id;
        return updatedTransaction;
      })
      .catch(() => {
        throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR)
      });
  }
}
