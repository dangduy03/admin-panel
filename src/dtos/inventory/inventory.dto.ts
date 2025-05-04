export class InventoryDTO {
    product_id: number;
    warehouse_id: number;
    quantity: number;

    constructor(data: any) {
        this.product_id = data.product_id;
        this.warehouse_id = data.warehouse_id;
        this.quantity = data.quantity;

    }
}