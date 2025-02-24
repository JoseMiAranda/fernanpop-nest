import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import firebase from 'src/firebase/firebase';
import { Product } from './entities/product.entity';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {

  limit = 10;

  constructor() { }

  async create(createProductDto: CreateProductDto, sellerId: string) {

    const productRef = firebase.firestore().collection('products').doc();

    const { title, desc, price, images } = createProductDto;

    // Ambas fechas serán iguales en la creación
    const creationDate = new Date().getTime();
    const updateDate = creationDate;

    const newProduct: Product = {
      sellerId: sellerId,
      title: title,
      desc: desc,
      price: price,
      images: images,
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

  async update(id: string, sellerId: string, updateProductDto: UpdateProductDto) {
    const productRef = firebase.firestore().collection('products').doc(id);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const productToUpdate = foundProduct.data() as Product;

    if (productToUpdate.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const { title, desc, price, images, status } = updateProductDto;

    const updatedProduct: Product = {
      sellerId: sellerId,
      title: title ?? productToUpdate.title,
      desc: desc ?? productToUpdate.desc,
      price: price ?? productToUpdate.price,
      images: images ?? productToUpdate.images,
      status: status ?? productToUpdate.status,
      createdAt: productToUpdate.createdAt,
      updatedAt: new Date().getTime(),
    };

    return productRef.update({...updatedProduct})
      .then(() => {
        updatedProduct.id = id;
        return updatedProduct;
      })
      .catch(() => {
        throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR)
      });
  }

  async remove(idProduct: string, sellerId: string) {
    const productRef = firebase.firestore().collection('products').doc(idProduct);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const productToDelete = foundProduct.data() as Product;

    if (productToDelete.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    return productRef.delete()
      .then(() => {
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        return productToDelete;
      })
      .catch(() => { throw new HttpException("can't-delete-product", HttpStatus.INTERNAL_SERVER_ERROR) });
  }

  async find(queryParams: FilterProductDto) {
    //* Hay extensiones de Firebase para hacer búsquedas complejas por nombre. Son de pago
    //* https://firebase.google.com/docs/firestore/solutions/search?hl=es-419

    const { q, page, price_min, price_max } = queryParams;

    const productsRef = firebase.firestore().collection('products')
      .where('price', '>=', price_min)
      .where('price', '<=', price_max);

    const foundProducts = await productsRef.get();

    if (foundProducts.empty) {
      const response = {
        page: page,
        limit: this.limit,
        total: 0,
        products: []
      }

      return response;
    }

    const productsData: Product[] = foundProducts.docs.map((product) => {
      const userProduct = product.data() as Product;
      userProduct.id = product.id;
      return userProduct;
    });

    let filteredDocs = productsData.filter((product) => {
      const { title, price } = product;
      return this.removeAccents(title.toLocaleLowerCase()).includes(this.removeAccents(q.toLocaleLowerCase())) && price >= price_min && price <= price_max;
    });

    // Escogemos los pertenecientes a la página
    const offset = (page - 1) * this.limit;

    const total = filteredDocs.length;

    filteredDocs = filteredDocs.slice(offset, offset + this.limit);

    const response = {
      page: page,
      limit: this.limit,
      total: total,
      products: filteredDocs
    }

    return response;
  }

  async findById(id: string) {
    const docsRef = firebase.firestore().collection('products').doc(id);

    const foundDoc = await docsRef.get();

    if (!foundDoc.exists) {
      { throw new HttpException("product-not-found", HttpStatus.NOT_FOUND) }
    }

    const product = foundDoc.data() as Product;

    product.id = foundDoc.id;

    return product;
  }

  async findBySeller(sellerId: string) {
    const productsRef = firebase.firestore().collection('products')
      .where("sellerId", "==", sellerId);

    const foundProducts = await productsRef.get();

    if (foundProducts.empty) {
      return [];
    }

    const productsData: Product[] = foundProducts.docs.map((product) => {
      const userProduct = product.data() as Product;
      userProduct.id = product.id;
      return userProduct;
    });

    return productsData;
  }

  // Utils
  private removeAccents(word: string) {
    const removedAccents = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return removedAccents;
  }

}