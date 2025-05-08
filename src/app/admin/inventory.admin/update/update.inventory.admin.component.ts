import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../../service/inventory.service';
import { ApiResponse } from '../../../../reponses/api.response';
import { InventoryDTO } from '../../../../dtos/inventory/inventory.dto';
import { ProductService } from '../../../../service/product.service';
import { WarehouseService } from '../../../../service/warehouse.service';

@Component({
  selector: 'app-update.inventory.admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update.inventory.admin.component.html',
  styleUrls: ['./update.inventory.admin.component.scss']
})
export class UpdateInventoryAdminComponent implements OnInit {
  inventoryForm: FormGroup;
  inventoryId!: number;
  products: any[] = [];
  warehouses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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
    this.inventoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInventory();
    this.loadProducts();
    this.loadWarehouses();
  }

  loadInventory() {
    this.inventoryService.getInventoryById(this.inventoryId).subscribe({
      next: (response: ApiResponse) => {
        const inventory = response.data;
        this.inventoryForm.patchValue({
          productId: inventory.product_id,
          warehouseId: inventory.warehouse_id,
          quantity: inventory.quantity
          // note: inventory.note
        });
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
      }
    });
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
        if (response?.data && Array.isArray(response.data)) {
          this.warehouses = response.data;
        } else {
          console.error('Invalid warehouses data format:', response);
          this.warehouses = [];
        }
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.warehouses = [];
      }
    });
  }

  onSubmit() {
    if (this.inventoryForm.valid) {
      const updateData = new InventoryDTO({
        product_id: this.inventoryForm.value.productId,
        warehouse_id: this.inventoryForm.value.warehouseId,
        quantity: this.inventoryForm.value.quantity
        // note: this.inventoryForm.value.note
      });

      this.inventoryService.updateInventory(this.inventoryId, updateData).subscribe({
        next: () => {
          alert('Inventory updated successfully');
          this.router.navigate(['/admin/inventories']);
        },
        error: (error) => {
          console.error('Error updating inventory:', error);
          alert('Failed to update inventory');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/inventories']);
  }
}
