import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WarehouseDTO } from '../../../../dtos/inventory/warehouse.dto';
import { WarehouseService } from '../../../../service/warehouse.service';
import { Warehouse } from '../../../../models/warehouse';
import { ApiResponse } from '../../../../reponses/api.response';
import { TokenService } from '../../../../service/token.service';

@Component({
  selector: 'app-update.warehouse.admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './update.warehouse.admin.component.html',
  styleUrl: './update.warehouse.admin.component.scss'
})
export class UpdateWarehouseAdminComponent implements OnInit {
  warehouseId!: number;
  warehouseDTO: WarehouseDTO = {
    name: '',
    location: ''
  };
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.warehouseId = Number(this.route.snapshot.paramMap.get('id'));
    this.getWarehouseDetails();
  }

  getWarehouseDetails() {
    if (this.tokenService.isTokenExpired()) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Fetching warehouse ID:', this.warehouseId); // Log ID trước khi gọi API

    this.warehouseService.getWarehouseById(this.warehouseId).subscribe({
      next: (response: any) => {
        console.log('API Response Data:', response);

        // Xử lý nhiều định dạng response
        if (response.data) {
          this.warehouseDTO = {
            name: response.data.name || '',
            location: response.data.location || ''
          };
        } else if (response.name) { // Nếu response trả về trực tiếp object warehouse
          this.warehouseDTO = {
            name: response.name,
            location: response.location
          };
        } else {
          console.error('Unexpected response format:', response);
          alert('Invalid data format received from server');
        }
      },
      error: (error) => {
        console.error('Full Error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        let errorMsg = 'Failed to load warehouse details';
        if (error.status === 404) {
          errorMsg = 'Warehouse not found';
        } else if (error.status === 401) {
          errorMsg = 'Unauthorized - Please login again';
          this.tokenService.removeToken();
          this.router.navigate(['/login']);
        }

        alert(errorMsg);
      }
    });
  }

  updateWarehouse() {
    if (!this.warehouseDTO.name || !this.warehouseDTO.location) {
      alert('Please fill all required fields');
      return;
    }

    if (this.tokenService.isTokenExpired()) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    this.warehouseService.updateWarehouse(this.warehouseId, this.warehouseDTO).subscribe({
      next: () => {
        alert('Warehouse updated successfully');
        this.router.navigate(['/admin/warehouses']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Update error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        let errorMessage = 'Failed to update warehouse';
        if (error.status === 400) {
          errorMessage = 'Invalid data - Please check your input';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized - Please login again';
          this.tokenService.removeToken();
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          errorMessage = 'Server error - Please try again later';
        }

        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/warehouses']);
  }
}