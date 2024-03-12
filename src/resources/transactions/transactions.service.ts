import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import firebase from 'src/firebase/firebase';
import { StatusTransaction } from './entities/status-transaction.entity';

@Injectable()
export class TransactionsService {
  async create(productId: string, sellerId: string, buyerId: string) {

    let docRef = firebase.firestore().collection('transactions').doc();

    // Ambas fechas serán iguales en la creación
    let creationDate = new Date().getTime();
    let updateDate = creationDate;

    let status = StatusTransaction.IN_PROCESS;

    // Creamos la transacción
    let transacion = { productId, sellerId, buyerId, creationDate, updateDate, status };

    return docRef.set(transacion)
      .then(() => {
        // Obtenemos el id del documento (llamado id como en todos los documentos devueltos)
        let id = docRef.id;
        return { ...transacion, id };
      })
      .catch(() => { throw new HttpException("can't-create-transaction", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  async findBySeller(sellerId: string) {
    let docsRef = firebase.firestore().collection('transactions');

    // Obtenemos el registro compras / ventas del usuario
    let userBuyer = await docsRef.where("sellerId", "==", sellerId).get();
    let userSeller = await docsRef.where("buyerId", "==", sellerId).get()
    // Obtenemos la data

    let transactionsTemp = [];

    userBuyer.docs.forEach((transaction) => {
      const id = transaction.id;
      transactionsTemp.push({ ...transaction.data(), id });
    });

    userSeller.docs.forEach((transaction) => {
      const id = transaction.id;
      transactionsTemp.push({ ...transaction.data(), id });
    });

    if (transactionsTemp.length == 0) {
      { throw new HttpException("", HttpStatus.NO_CONTENT) }
    }

    return transactionsTemp

  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    let docRef = firebase.firestore().collection('transactions').doc(id);
    let findedDoc = await docRef.get();

    // Encontramos el documento que coincida en el comprador o vendedor
    if (!findedDoc.exists && (findedDoc.data()["sellerId"] == userId  || findedDoc.data()["buyerId"] === userId)) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    return docRef.update({ ...updateTransactionDto })
      .then(() => {
        let id = findedDoc.id;
        // Actualizamos la hora de la transacción
        const updateDate = new Date().getTime()
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        return { ...findedDoc.data(), ...updateTransactionDto, id, updateDate }
      })
      .catch(() => {
        throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR)
      });
  }
}
