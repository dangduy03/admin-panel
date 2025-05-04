import { Product } from "./product";
import { User } from "./user";

export interface Comment {
    id: number;
    product: Product;
    user: User;
    content: string;
}