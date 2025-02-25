import { ProductStatus } from "./produc-status.entity";

export class Product {
    id?: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    status: ProductStatus[];
    createdAt: Date;
    updatedAt: Date;
}
