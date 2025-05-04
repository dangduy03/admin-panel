import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../reponses/api.response';
import { Inventory } from '../../../models/inventory';
import { Warehouse } from '../../../models/warehouse';
import { InventoryService } from '../../../service/inventory.service';

@Component({
  selector: 'app-inventory.admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.admin.component.html',
  styleUrl: './inventory.admin.component.scss'
})
export class InventoryAdminComponent implements OnInit {
  inventories: Inventory[] = [];
  warehouses: Warehouse[] = [];
  selectedWarehouseId: number = 0;
  productKeyword: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadInventories();
  }

  loadWarehouses() {
    this.inventoryService.getAllWarehouses().subscribe({
      next: (response: ApiResponse) => {
        this.warehouses = response.data;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
      }
    });
  }

  loadInventories() {
    const warehouseId = this.selectedWarehouseId === 0 ? undefined : this.selectedWarehouseId;
    this.inventoryService.getInventoryByWarehouse(
      warehouseId,
      this.productKeyword,
      this.currentPage,
      this.itemsPerPage
    ).subscribe({
      next: (response: ApiResponse) => {
        this.inventories = response.data;
      },
      error: (error) => {
        console.error('Error loading inventories:', error);
      }
    });
  }

  onWarehouseChange() {
    this.currentPage = 1;
    this.loadInventories();
  }

  searchInventory() {
    this.currentPage = 1;
    this.loadInventories();
  }

  adjustInventory() {
    // Implement adjust inventory logic here
  }

  updateInventory(inventoryId: number) {
    // Implement update inventory logic here
  }
}