import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import firebase from 'src/firebase/firebase';
import { Product } from '../products/entities/product.entity';
import { Transaction } from './entities/transaction.entity';
import { Filter } from 'firebase-admin/firestore';
import { TransactionStatus } from './entities/transaction-status';

@Injectable()
export class TransactionsService {
  async create(productId: string, buyerId: string) {

    const productRef = firebase.firestore().collection('transactions').doc(productId);

    const foundProduct = await productRef.get();

    if(!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const product = foundProduct.data() as Product;

    if(product.sellerId == buyerId) {
      throw new HttpException("user-can't-buy-his-own-products", HttpStatus.FORBIDDEN);
    }

    // Ambas fechas serán iguales en la creación
    const creationDate = new Date().getTime();
    const updateDate = creationDate;

    // Creamos la transacción
    const newTransaction: Transaction = {
      productId: productId,
      sellerId: product.sellerId,
      buyerId: buyerId,
      creationDate: creationDate,
      updateDate: updateDate,
      status: TransactionStatus.IN_PROCESS,
    }

    return productRef.set(newTransaction)
      .then(() => {
        // Obtenemos el id del documento (llamado id como en todos los documentos devueltos)
        newTransaction.id = productRef.id;

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
