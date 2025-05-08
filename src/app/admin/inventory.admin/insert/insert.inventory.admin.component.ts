import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../../service/inventory.service';
import { ProductService } from '../../../../service/product.service';
import { WarehouseService } from '../../../../service/warehouse.service';
import { InventoryDTO } from '../../../../dtos/inventory/inventory.dto';


@Component({
  selector: 'app-insert.inventory.admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './insert.inventory.admin.component.html',
  styleUrls: ['./insert.inventory.admin.component.scss']
})
export class InsertInventoryAdminComponent implements OnInit {
  inventoryForm: FormGroup;
  products: any[] = [];
  warehouses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {
    this.inventoryForm = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      // note: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
  }

  loadProducts() {
    const keyword = '';
    const categoryId = undefined;
    const page = 0;
    const limit = 100;
    this.productService.getProducts(keyword, categoryId, page, limit).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response?.data?.products && Array.isArray(response.data.products)) {
          this.products = response.data.products;
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
    if (this.inventoryForm.valid) {
      console.log('Form data before submit:', this.inventoryForm.value);

      const inventoryData = new InventoryDTO({
        product_id: this.inventoryForm.value.productId,
        warehouse_id: this.inventoryForm.value.warehouseId,
        quantity: this.inventoryForm.value.quantity,
      });

      console.log('Data to be sent:', inventoryData); // Kiểm tra dữ liệu trước khi gửi
      this.inventoryService.createInventory(inventoryData).subscribe({
        next: () => {
          alert('Inventory created successfully');
          this.router.navigate(['/admin/inventories']);
        },
        error: (error) => {
          console.error('Error creating inventory:', error);
          console.error('Error details:', error.error); // Log chi tiết lỗi từ server
          alert(`Failed to create inventory: ${error.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/inventories']);
  }
}