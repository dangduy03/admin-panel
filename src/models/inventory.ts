import { Product } from "./product";
import { Warehouse } from "./warehouse";

export interface Inventory {
    id: number;
    product: Product;
    warehouse: Warehouse;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}