import * as admin from 'firebase-admin';
import { Product } from "src/resources/products/entities/product.entity";
import { FirebaseProductSchema } from "../../../firebase/schema/firebase-product.schema";
import { ProductStatus } from "src/resources/products/entities/produc-status.entity";

const validProductStatuses: string[] = [ProductStatus.RESERVED, ProductStatus.SOLD];

export function firebaseProductSchemaToProduct(firebaseProductSchema: FirebaseProductSchema): Product {
    console.log(firebaseProductSchema);
    const product: Product = {
        id: firebaseProductSchema.id,
        sellerId: firebaseProductSchema.sellerId,
        title: firebaseProductSchema.title,
        desc: firebaseProductSchema.desc,
        price: firebaseProductSchema.price,
        images: firebaseProductSchema.images,
        status: firebaseProductSchema.status.filter(s => validProductStatuses.includes(s)) as ProductStatus[],
        createdAt: firebaseProductSchema.createdAt.toDate(),
        updatedAt: firebaseProductSchema.updatedAt.toDate(),
    }

    return product;
}

export function productToFirebaseProductSchema(product: Product): FirebaseProductSchema {
    const productSchema: FirebaseProductSchema = {
        sellerId: product.sellerId,
        title: product.title,
        desc: product.desc,
        price: product.price,
        images: product.images,
        status: product.status,
        createdAt: admin.firestore.Timestamp.fromDate(product.createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(product.updatedAt),
    }

    return productSchema;
}