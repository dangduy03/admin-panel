import { Product } from "./product";
import { Warehouse } from "./warehouse";

export enum TransactionType {
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',
    WARNING = 'ADJUSTMENT',
    INFORMATION = 'TRANSFER',
}

export interface InventoryTransaction {
    id: number;
    product: Product;
    warehouse: Warehouse;
    quantity: number;
    transactionType : TransactionType
    quantityChange:number;
    note: string;
    createdAt?: Date;
    updatedAt?: Date;
}