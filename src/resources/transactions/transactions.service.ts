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
    let creationDate = Date();
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

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
