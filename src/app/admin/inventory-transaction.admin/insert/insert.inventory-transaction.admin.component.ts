import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryTransactionService } from '../../../../service/inventory-transaction.service';
import { ProductService } from '../../../../service/product.service';
import { WarehouseService } from '../../../../service/warehouse.service';
import { InventoryAdjustmentDTO } from '../../../../dtos/inventory/inventory-adjustment.dto';


@Component({
    selector: 'app-insert.inventory-transaction.admin',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './insert.inventory-transaction.admin.component.html',
    styleUrls: ['./insert.inventory-transaction.admin.component.scss']
})
export class InsertInventoryTransactionAdminComponent implements OnInit {
    transactionForm: FormGroup;
    products: any[] = [];
    warehouses: any[] = [];
    transactionTypes = ['IMPORT', 'EXPORT', 'ADJUSTMENT', 'TRANSFER'];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private transactionService: InventoryTransactionService,
        private productService: ProductService,
        private warehouseService: WarehouseService
    ) {
        this.transactionForm = this.fb.group({
            productId: ['', Validators.required],
            warehouseId: ['', Validators.required],
            adjustmentType: ['', Validators.required],
            adjustment: ['', [Validators.required, Validators.min(1)]],
            note: ['']
        });
    }

    ngOnInit(): void {
        this.loadProducts();
        this.loadWarehouses();
    }

    loadProducts() {
        const keyword = ''; // empty string to get all products
        const categoryId = undefined; // no category filter
        const page = 0; // first page
        const limit = 100; // large number to get all products
        this.productService.getProducts(keyword, categoryId, page, limit).subscribe({
            next: (response: any) => {
                console.log('API Response:', response); // Log toàn bộ response để debug
                if (response?.data?.products && Array.isArray(response.data.products)) {
                    this.products = response.data.products;
                    console.log('Products loaded:', this.products);
                } else {
                    console.error('Invalid products data format:', response);
                    this.products = [];
                }
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.products = [];
            }
        });
    }

    loadWarehouses() {
        this.warehouseService.getWarehouses(1, 1000).subscribe({
            next: (response: any) => {
                this.warehouses = response.data;
            },
            error: (error) => {
                console.error('Error loading warehouses:', error);
            }
        });
    }

    onSubmit() {
        if (this.transactionForm.valid) {
            console.log('Form data before submit:', this.transactionForm.value); // Thêm dòng này để debug

            const transactionData = new InventoryAdjustmentDTO({
                product_id: this.transactionForm.value.productId,
                warehouse_id: this.transactionForm.value.warehouseId,
                adjustmentType: this.transactionForm.value.adjustmentType,
                adjustment: this.transactionForm.value.adjustment,
                note: this.transactionForm.value.note
            });

            console.log('Data to be sent:', transactionData); // Kiểm tra dữ liệu trước khi gửi

            this.transactionService.createTransaction(transactionData).subscribe({
                next: () => {
                    alert('Transaction created successfully');
                    this.router.navigate(['/admin/transactions']);
                },
                error: (error) => {
                    console.error('Error creating transaction:', error);
                    console.error('Error details:', error.error); // Log chi tiết lỗi từ server
                    alert(`Failed to create transaction: ${error.error?.message || 'Unknown error'}`);
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/admin/transactions']);
    }
}