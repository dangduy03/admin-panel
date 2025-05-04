import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../reponses/api.response';
import { Warehouse } from '../../../models/warehouse';
import { WarehouseService } from '../../../service/warehouse.service';
import { TokenService } from '../../../service/token.service';

@Component({
  selector: 'app-warehouse.admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './warehouse.admin.component.html',
  styleUrl: './warehouse.admin.component.scss'
})
export class WarehouseAdminComponent implements OnInit {
  warehouses: Warehouse[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];


  constructor(
    private warehouseService: WarehouseService,
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.getWarehouses(this.currentPage, this.itemsPerPage);
  }

  getWarehouses(page: number, limit: number) {
    this.warehouseService.getWarehouses(page, limit).subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);

        // Xử lý nhiều định dạng response có thể có
        if (Array.isArray(response)) {
          this.warehouses = response;
          this.totalPages = 1;
        } else if (response?.data) {
          this.warehouses = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        } else {
          this.warehouses = [];
          console.error('Unexpected response format:', response);
        }

        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
        alert('Error loading data. Please check console for details.');
      }
    });
  }

  searchWarehouses() {
    this.currentPage = 0;
    this.getWarehouses(this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getWarehouses(this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 0);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 0);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i + 1);
  }

  insertWarehouse() {
    this.router.navigate(['/admin/warehouses/insert']);
  }

  updateWarehouse(warehouseId: number) {
    this.router.navigate(['/admin/warehouses/update', warehouseId]);
  }

  deleteWarehouse(warehouse: Warehouse) {
    if (confirm(`Are you sure you want to delete warehouse ${warehouse.name}?`)) {
      this.warehouseService.deleteWarehouse(warehouse.id).subscribe({
        next: () => {
          this.warehouses = this.warehouses.filter(w => w.id !== warehouse.id);
          // Adjust pagination if needed
          if (this.warehouses.length === 0 && this.currentPage > 0) {
            this.currentPage--;
            this.getWarehouses(this.currentPage, this.itemsPerPage);
          }
        },
        error: (error) => {
          console.error('Error deleting warehouse:', error);
          alert(`Failed to delete warehouse: ${error.error?.message || 'Unknown error'}`);
        }
      });
    }
  }
}