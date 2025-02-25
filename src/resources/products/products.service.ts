import * as admin from 'firebase-admin'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import firebase from 'src/firebase/firebase';
import { Product } from './entities/product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { ProductStatus } from './entities/produc-status.entity';
import { firebaseProductSchemaToProduct, productToFirebaseProductSchema } from './mapper/product.mapper';
import { FirebaseProductSchema } from 'src/firebase/schema/firebase-product.schema';

@Injectable()
export class ProductsService {

  limit = 10;

  constructor() { }

  async create(createProductDto: CreateProductDto, sellerId: string) {

    const productRef = firebase.firestore().collection('products').doc();

    const { title, desc, price, images } = createProductDto;

    // Ambas fechas serán iguales en la creación
    const createdAt = new Date();
    const updatedAt = createdAt;

    const newProduct: Product = {
      sellerId: sellerId,
      title: title,
      desc: desc,
      price: price,
      images: images,
      status: [],
      createdAt: createdAt,
      updatedAt: updatedAt,
    };

    const firebaseProduct = productToFirebaseProductSchema(newProduct);

    return productRef.set(firebaseProduct)
      .then(() => {
        // Obtenemos el id del documento (llamado id como en todos los documentos devueltos)
        newProduct.id = productRef.id;
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

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if (firebaseProduct.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const { title, desc, price, images, status } = updateProductDto;

    const firebaseUpdatedProduct: FirebaseProductSchema = {
      sellerId: sellerId,
      title: title ?? firebaseProduct.title,
      desc: desc ?? firebaseProduct.desc,
      price: price ?? firebaseProduct.price,
      images: images ?? firebaseProduct.images,
      status: status ?? firebaseProduct.status,
      createdAt: firebaseProduct.createdAt,
      updatedAt: admin.firestore.Timestamp.now(),
    }

    return productRef.update({...firebaseUpdatedProduct})
      .then(() => {
        firebaseUpdatedProduct.id = productRef.id;
        const updatedProduct: Product = firebaseProductSchemaToProduct(firebaseUpdatedProduct);
        return updatedProduct;
      })
      .catch(() => {
        throw new HttpException("can't-update-product", HttpStatus.INTERNAL_SERVER_ERROR)
      });
  }

  async delete(idProduct: string, sellerId: string) {
    const productRef = firebase.firestore().collection('products').doc(idProduct);
    const foundProduct = await productRef.get();

    if (!foundProduct.exists) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    const firebaseProduct = foundProduct.data() as FirebaseProductSchema;

    if (firebaseProduct.sellerId !== sellerId) {
      throw new HttpException('product-not-found', HttpStatus.NOT_FOUND);
    }

    firebaseProduct.status.push(ProductStatus.DELETED);
    firebaseProduct.updatedAt = admin.firestore.Timestamp.now();

    return productRef.update({...firebaseProduct})
      .then(() => {
        // Devolvemos el objeto encontrado con los cambios que hayamos especificado
        firebaseProduct.id = productRef.id;
        const deletedProduct: Product = firebaseProductSchemaToProduct(firebaseProduct);
        return deletedProduct;
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

    const products: Product[] = foundProducts.docs.map((firebaseProductDoc) => {
      const firebaseProduct = firebaseProductDoc.data() as FirebaseProductSchema;
      firebaseProduct.id = firebaseProductDoc.id;
      const product = firebaseProductSchemaToProduct(firebaseProduct);
      return product;
    });

    let filteredDocs = products.filter((product) => {
      const { title, price, status } = product;
      return this.removeAccents(title.toLocaleLowerCase()).includes(this.removeAccents(q.toLocaleLowerCase())) 
             && price >= price_min && price <= price_max
             && !(status.includes(ProductStatus.SOLD) || status.includes(ProductStatus.DELETED));
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
      throw new HttpException("product-not-found", HttpStatus.NOT_FOUND) 
    }

    const firebaseProduct = foundDoc.data() as FirebaseProductSchema;

    if(firebaseProduct.status.includes(ProductStatus.SOLD) || firebaseProduct.status.includes(ProductStatus.DELETED)) {
      throw new HttpException("product-not-found", HttpStatus.NOT_FOUND)
    }

    firebaseProduct.id = foundDoc.id;

    const product = firebaseProductSchemaToProduct(firebaseProduct);

    return product;
  }

  async findBySeller(sellerId: string) {
    const productsRef = firebase.firestore().collection('products')
      .where("sellerId", "==", sellerId);

    const foundProducts = await productsRef.get();

    if (foundProducts.empty) {
      return [];
    }

    const productsData: Product[] = foundProducts.docs.map((firebaseProductDoc) => {
      const firebaseProduct = firebaseProductDoc.data() as FirebaseProductSchema;
      firebaseProduct.id = firebaseProductDoc.id;
      const product = firebaseProductSchemaToProduct(firebaseProduct);
      return product;
    });

    return productsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Utils
  private removeAccents(word: string) {
    const removedAccents = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return removedAccents;
  }

}