export class UpdateTransactionDTO {
    quantityChange?: number;
    note?: string;
    transactionType?: string; // 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'TRANSFER'
    constructor(data: any) {
        this.quantityChange = data.quantityChange;
        this.note = data.note;
        this.transactionType = data.transactionType;
    }
}