import * as admin from 'firebase-admin';
import { Product } from "../../../resources/products/entities/product.entity";
import { FirebaseProductSchema } from "../../../firebase/schema/firebase-product.schema";
import { ProductStatus } from "../../../resources/products/entities/produc-status.entity";
import { ProductCondition } from "../../../resources/products/entities/product-condition.entity";
import { isValidConditionId } from "../../../resources/products/product-conditions.constants";
import { generateProductSlug } from "../utils/product-slug.util";

const validProductStatuses: string[] = [ProductStatus.RESERVED, ProductStatus.SOLD, ProductStatus.DELETED];

export function firebaseProductSchemaToProduct(firebaseProductSchema: FirebaseProductSchema): Product {
    const product: Product = {
        id: firebaseProductSchema.id,
        slug: firebaseProductSchema.slug ?? generateProductSlug(
            firebaseProductSchema.title,
            firebaseProductSchema.createdAt.toDate().getTime(),
        ),
        sellerId: firebaseProductSchema.sellerId,
        title: firebaseProductSchema.title,
        desc: firebaseProductSchema.desc,
        price: firebaseProductSchema.price,
        images: firebaseProductSchema.images,
        categoryId: firebaseProductSchema.categoryId,
        condition: firebaseProductSchema.condition && isValidConditionId(firebaseProductSchema.condition)
            ? firebaseProductSchema.condition as ProductCondition
            : undefined,
        status: firebaseProductSchema.status.filter(s => validProductStatuses.includes(s)) as ProductStatus[],
        createdAt: firebaseProductSchema.createdAt.toDate(),
        updatedAt: firebaseProductSchema.updatedAt.toDate(),
    }

    return product;
}

export function productToFirebaseProductSchema(product: Product): FirebaseProductSchema {
    const productSchema: FirebaseProductSchema = {
        slug: product.slug,
        sellerId: product.sellerId,
        title: product.title,
        desc: product.desc,
        price: product.price,
        images: product.images,
        categoryId: product.categoryId,
        condition: product.condition,
        status: product.status,
        createdAt: admin.firestore.Timestamp.fromDate(product.createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(product.updatedAt),
    }

    return productSchema;
}