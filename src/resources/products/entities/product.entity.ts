import { ProductStatus } from "./produc-status.entity";
import { ProductCondition } from "./product-condition.entity";

export class Product {
    id?: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    categoryId?: string;
    condition?: ProductCondition;
    status: ProductStatus[];
    createdAt: Date;
    updatedAt: Date;
}
