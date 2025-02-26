import * as admin from 'firebase-admin';
import { Transaction } from '../entities/transaction.entity';
import { FirebaseTransactionSchema } from 'src/firebase/schema/firebase-transaction.schema';
import { TransactionStatus } from '../entities/transaction-status';

const validTransactionStatuses: string[] = [TransactionStatus.IN_PROCESS, TransactionStatus.RECEIVED, TransactionStatus.CANCELED];

export function firebaseTransactionSchemaToTransaction(firebaseProductSchema: FirebaseTransactionSchema): Transaction {
    const transaction: Transaction = {
       productId: firebaseProductSchema.productId,
       sellerId: firebaseProductSchema.sellerId,
       buyerId: firebaseProductSchema.buyerId,
       title: firebaseProductSchema.title,
       price: firebaseProductSchema.price,
       image: firebaseProductSchema.image,
       status: validTransactionStatuses.includes(firebaseProductSchema.status) 
                ? firebaseProductSchema.status as TransactionStatus 
                : TransactionStatus.IN_PROCESS,
       createdAt: firebaseProductSchema.createdAt.toDate(),
       updatedAt: firebaseProductSchema.updatedAt.toDate(),
    }

    return transaction;
}

export function transactionToFirebaseTransactionSchema(transaction: Transaction): FirebaseTransactionSchema {
    const transactionSchema: FirebaseTransactionSchema = {
        productId: transaction.productId,
        sellerId: transaction.sellerId,
        buyerId: transaction.buyerId,
        title: transaction.title,
        price: transaction.price,
        image: transaction.image,
        status: transaction.status,
        createdAt: admin.firestore.Timestamp.fromDate(transaction.createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(transaction.updatedAt),
    }

    return transactionSchema;
}