import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WarehouseDTO } from '../../../../dtos/inventory/warehouse.dto';
import { WarehouseService } from '../../../../service/warehouse.service';
import { TokenService } from '../../../../service/token.service';

@Component({
  selector: 'app-insert.warehouse.admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './insert.warehouse.admin.component.html',
  styleUrl: './insert.warehouse.admin.component.scss'
})
export class InsertWarehouseAdminComponent {
  warehouseDTO: WarehouseDTO = {
    name: '',
    location: ''
  };
  isSubmitting = false;

  constructor(
    private warehouseService: WarehouseService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  insertWarehouse() {
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
    this.warehouseService.createWarehouse(this.warehouseDTO).subscribe({
      next: (response) => {
        console.log('Create successful:', response);
        alert('Warehouse created successfully');
        this.router.navigate(['/admin/warehouses']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Full error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        
        let errorMessage = 'Failed to create warehouse';
        if (error.status === 500) {
          errorMessage += ': Server error';
          if (error.error && error.error.message) {
            errorMessage += ` - ${error.error.message}`;
          }
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized - Please login again';
          this.tokenService.removeToken();
          this.router.navigate(['/login']);
        }
        
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/warehouses']);
  }
}
