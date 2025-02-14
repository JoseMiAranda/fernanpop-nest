import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import firebase from 'src/firebase/firebase';
import { Product } from './entities/product.entity';
import { Filter } from './entities/filter.entity';

@Injectable()
export class ProductsService {
  
  limit = 10;

  constructor() { }
  
  async create(createProductDto: CreateProductDto, sellerId: string) {

    const productRef = firebase.firestore().collection('products').doc();

    const { title, desc, price, img } = createProductDto;

    // Ambas fechas serán iguales en la creación
    const creationDate = new Date().getTime();
    const updateDate = creationDate;

    const newProduct: Product = {
      sellerId: sellerId,
      title: title,
      desc: desc,
      price: price,
      img: img,
      status: [],
      createdAt: creationDate,
      updatedAt: updateDate,
    };

    return productRef.set(newProduct)
      .then(() => {
        // Obtenemos el id del documento (llamado id como en todos los documentos devueltos)
        const id = productRef.id;

        newProduct.id = id;

        return newProduct;
      })
      .catch(() => { throw new HttpException("can't-create-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  async update( id: string, sellerId: string, updateProductDto: UpdateProductDto) {
    const productRef = firebase.firestore().collection('products').doc(id);
    const foundProduct = await productRef.get();

    if(!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const productToUpdate = foundProduct.data() as Product;

    if(productToUpdate.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const { title, desc, price, img, status } = updateProductDto;

    const updatedProduct: Product = {
      id: id,
      sellerId: sellerId,
      title: title ?? productToUpdate.title,
      desc: desc ?? productToUpdate.desc,
      price: price ?? productToUpdate.price,
      img: img ?? productToUpdate.img,
      status: status ?? productToUpdate.status,
      createdAt: productToUpdate.createdAt,
      updatedAt: new Date().getTime(),
    };

    return productRef.update({updatedProduct})
      .then(() => {
        return updatedProduct;
      })
      .catch(() => {
        throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR)
      });
  }

  async remove(idProduct: string, sellerId: string) {
    let docRef = firebase.firestore().collection('products').doc(idProduct);
    let findedDoc = await docRef.get();

    if(!findedDoc.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const productToDelete = findedDoc.data() as Product;

    if(productToDelete.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    return docRef.delete()
      .then(() => {
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        return productToDelete;
      })
      .catch(() => { throw new HttpException("can't-delete-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  // async find(queryParams: Filter) {
    
  //! el filtro por query con TypeSense
  //   const docsRef = firebase.firestore().collection('products');

  //   // Obtenemos únicamente los documentos del vendedor
  //   const findedDocs = await docsRef.get();

  //   if (findedDocs.empty) {
  //     throw new HttpException([], HttpStatus.NO_CONTENT);
  //   }

  //   // Filtramos los documentos
  //   let filteredDocs = this.filterDocs(queryParams,findedDocs.docs);

  //   // Escogemos los pertenecientes a la página
  //   const {page = 1} = queryParams;
  //   let skip = (page - 1) * this.limit;

  //   const total = filteredDocs.length;

  //   filteredDocs = filteredDocs.slice(skip, skip + this.limit);

  //   // Devolvemos la lista o error si no tiene productos la pagina
  //   if(filteredDocs.length == 0) {
  //     throw new HttpException([], HttpStatus.NO_CONTENT);
  //   } else {
  //     return {
  //       "page": Number.parseInt(page),
  //       "limit": this.limit,
  //       "total": total,
  //       "products": filteredDocs
  //     }
  //   }
  // }

  async findById(id: string) {
    // Obtenemos únicamente el documento por el id
    const docsRef = firebase.firestore().collection('products').doc(id);

    const foundDoc = await docsRef.get();

    if(!foundDoc.exists) {
      { throw new HttpException("product-not-found", HttpStatus.NOT_FOUND) }
    }

    const product = foundDoc.data() as Product;

    product.id = foundDoc.id;
    
    return product;
  }

  // async findBySeller(queryParams: any, sellerId: string) {
  //   let docsRef = firebase.firestore().collection('products');

  //   // Obtenemos únicamente los documentos del vendedor
  //   let findedDocs = await docsRef.where("sellerId", "==", sellerId).get();

  //   if (findedDocs.empty) {
  //     { throw new HttpException("", HttpStatus.NO_CONTENT) }
  //   }

  //   // Filtramos los documentos
  //   let filteredDocs = this.filterDocs(queryParams,findedDocs.docs);

  //   // Escogemos los productos pertenecientes a la página
  //   const {page = 1} = queryParams;
  //   let skip = (page - 1) * this.limit;

  //   const total = filteredDocs.length;

  //   filteredDocs = filteredDocs.slice(skip, skip + this.limit);

  //   // Devolvemos la lista o error si no tiene productos la pagina
  //   if(filteredDocs.length == 0) {
  //     throw new HttpException([], HttpStatus.NO_CONTENT);
  //   } else {
  //     return {
  //       "page": Number.parseInt(page),
  //       "limit": this.limit,
  //       "total": total,
  //       "products": filteredDocs
  //     }
  //   }
    
  // }


  // UTILS
  // private filterDocs( queryParams: any, products: any) {
  //   // Obtenemos todos los parmaétros y si no están los inicializamos
  //   const {q = '', price_min = 0, prime_max = Number.MAX_SAFE_INTEGER} = queryParams;

  //   const removedQueryAccents = this.removeAccents(q).toLocaleLowerCase();

  //   // let skip = (page - 1) * this.limit;

  //   // Filtramos siguiendo el siguiente orden:
  //   //  - Término -> ambos sin tildes ni mayúsculas
  //   //  - Precio
  //   let productsTemp = [];

  //   products.forEach((product) => {
  //     // Obtenemos el id del producto para asignarlo a la lista
  //     let id = product.id;
  //     let dataProduct = product.data();
      
  //     const removedPorductAccents = this.removeAccents(dataProduct.title).toLocaleLowerCase();

  //     if (removedPorductAccents.includes(removedQueryAccents) && dataProduct.price >= price_min && dataProduct.price <= prime_max) {
  //       productsTemp.push({ ...product.data(), id });
  //     }
  //   });

  //   return productsTemp;
  // }

  private removeAccents(word: string) {
    const removedAccents = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return removedAccents; 
  }

}