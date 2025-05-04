export class InventoryAdjustmentDTO {
    product_id: number;
    warehouse_id: number;
    adjustment: number;
    note?: string;
    adjustmentType: string; // 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'TRANSFER'

    constructor(data: any) {
        this.product_id = data.product_id;
        this.warehouse_id = data.warehouse_id;
        this.adjustment = data.adjustment;
        this.note = data.note;
        this.adjustmentType = data.adjustmentType;
    }
}