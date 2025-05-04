import { Inventory } from "./inventory";

export interface Warehouse {
    id: number;
    name: string;
    location: string;
    createdAt?: Date;
    updatedAt?: Date;
}