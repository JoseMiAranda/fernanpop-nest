import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import firebase from 'src/firebase/firebase';

@Injectable()
export class ProductsService {
  
  limit = 4;

  constructor() { }
  
  // CREATE
  async create(createProductDto: CreateProductDto, sellerId: string) {

    let docRef = firebase.firestore().collection('products').doc();

    return docRef.set({ ...createProductDto, sellerId })
      .then(() => {
        // Obtenemos el id del documento (llamado id como en todos los documentos devueltos)
        let id = docRef.id;
        return { ...createProductDto, id };
      })
      .catch(() => { throw new HttpException("can't-create-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  // UPDATE
  async update(updateProductDto: UpdateProductDto, sellerId: string) {
    let { id, ...rest } = updateProductDto;
    console.log(id);
    let docRef = firebase.firestore().collection('products').doc(id);
    let findedDoc = await docRef.get();

    if (!findedDoc.exists && findedDoc.data()["sellerId"] === sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    return docRef.update({ ...updateProductDto })
      .then(() => {
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        return { ...findedDoc.data(), ...updateProductDto }
      })
      .catch(() => { throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  // DELETE
  async remove(idProduct: string, sellerId: string) {
    let docRef = firebase.firestore().collection('products').doc(idProduct);
    let findedDoc = await docRef.get();
    if (!findedDoc.exists || findedDoc.data()["sellerId"] !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    return docRef.delete()
      .then(() => {
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        return { ...findedDoc.data() }
      })
      .catch(() => { throw new HttpException("can't-delete-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  // SELECT
  async find(queryParams: any) {
    
    let docsRef = firebase.firestore().collection('products');

    // Obtenemos únicamente los documentos del vendedor
    let findedDocs = await docsRef.get();

    if (findedDocs.empty) {
      throw new HttpException([], HttpStatus.NO_CONTENT);
    }

    // Filtramos los documentos
    let filteredDocs = this.filterDocs(queryParams,findedDocs.docs);

    // Escogemos los pertenecientes a la página
    const {page = 1} = queryParams;
    let skip = (page - 1) * this.limit;

    const total = filteredDocs.length;

    filteredDocs = filteredDocs.slice(skip, skip + this.limit);

    // Devolvemos la lista o error si no tiene productos la pagina
    if(filteredDocs.length == 0) {
      throw new HttpException([], HttpStatus.NO_CONTENT);
    } else {
      return {
        "page": Number.parseInt(page),
        "limit": this.limit,
        "total": total,
        "products": filteredDocs
      }
    }
  }

  async findById(id: string) {
    console.log(id);
    let docsRef = firebase.firestore().collection('products').doc(id);

    // Obtenemos únicamente el documento por el id
    let findedDoc = await docsRef.get();

    if(!findedDoc.exists) {
      { throw new HttpException("", HttpStatus.NO_CONTENT) }
    }
    
    return { ...findedDoc.data() }
  }

  async findBySeller(queryParams: any, sellerId: string) {
    let docsRef = firebase.firestore().collection('products');

    // Obtenemos únicamente los documentos del vendedor
    let findedDocs = await docsRef.where("sellerId", "==", sellerId).get();

    if (findedDocs.empty) {
      return [];
    }

    // Filtramos los documentos
    let filteredDocs = this.filterDocs(queryParams,findedDocs.docs);

    // Escogemos los productos pertenecientes a la página
    const {page = 1} = queryParams;
    let skip = (page - 1) * this.limit;

    const total = filteredDocs.length;

    filteredDocs = filteredDocs.slice(skip, skip + this.limit);

    // Devolvemos la lista o error si no tiene productos la pagina
    if(filteredDocs.length == 0) {
      throw new HttpException([], HttpStatus.NO_CONTENT);
    } else {
      return {
        "page": Number.parseInt(page),
        "limit": this.limit,
        "total": total,
        "products": filteredDocs
      }
    }
    
  }


  // UTILS
  private filterDocs( queryParams: any, products: any) {
    // Obtenemos todos los parmaétros y si no están los inicializamos
    const {q = '', price_min = 0, prime_max = Number.MAX_SAFE_INTEGER} = queryParams;

    // let skip = (page - 1) * this.limit;

    // Filtramos siguiendo el siguiente orden:
    //  - Término
    //  - Precio
    let productsTemp = [];

    products.forEach((product) => {
      // Obtenemos el id del producto para asignarlo a la lista
      let id = product.id;
      let dataProduct = product.data();
      if (dataProduct.title.toLowerCase().includes(q) && dataProduct.price >= price_min && dataProduct.price <= prime_max) {
        productsTemp.push({ ...product.data(), id });
      }
    });

    return productsTemp;
  }

}
