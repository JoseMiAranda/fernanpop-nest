import { ProductStatus } from "./produc-status.entity";

export class Product {
    id?: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    img: string;
    status: ProductStatus[];
    createdAt: number;
    updatedAt: number;
}
