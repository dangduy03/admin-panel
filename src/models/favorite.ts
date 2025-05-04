import { Product } from "./product";
import { User } from "./user";

export interface Favorite {
    id: number;
    product: Product;
    user: User;
}