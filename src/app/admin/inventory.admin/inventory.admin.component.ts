import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../reponses/api.response';
import { Inventory } from '../../../models/inventory';
import { Warehouse } from '../../../models/warehouse';
import { InventoryService } from '../../../service/inventory.service';
import { WarehouseService } from '../../../service/warehouse.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  searchKeyword: string = '';


  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private warehouseService: WarehouseService
  ) { }

  ngOnInit(): void {
    this.getInventory(this.currentPage, this.itemsPerPage);
  }

  getInventory(page: number, limit: number) {
    this.inventoryService.getInventory(page, limit).subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);
  
        let inventoryData;
        if (Array.isArray(response)) {
          inventoryData = response;
          this.totalPages = 1;
        } else if (response?.data) {
          inventoryData = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        } else {
          inventoryData = [];
          console.error('Unexpected response format:', response);
        }
  
        // Xử lý chuyển đổi ngày tháng từ mảng số sang Date object
        this.inventories = inventoryData.map((item: any) => ({
          ...item,
          createdAt: this.arrayToDate(item.createdAt),
          updatedAt: this.arrayToDate(item.updatedAt)
        }));
  
        console.log('Processed inventories:', this.inventories);
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
      }
    });
  }
  
  // Hàm chuyển đổi mảng số thành Date object
  private arrayToDate(dateArray: number[]): Date | null {
    if (!dateArray || dateArray.length < 6) return null;
    
    // Lưu ý: Tháng trong JavaScript bắt đầu từ 0 (0-11)
    return new Date(
      dateArray[0],  // năm
      dateArray[1] - 1,  // tháng (trừ 1)
      dateArray[2],  // ngày
      dateArray[3],  // giờ
      dateArray[4],  // phút
      dateArray[5]   // giây
    );
  }

  searchInventories() {
    this.currentPage = 1;
    this.getInventory(this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getInventory(this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  insertInventory() {
    this.router.navigate(['/admin/inventories/insert']);
  }

  updateInventory(warehouseId: number) {
    this.router.navigate(['/admin/inventories/update', warehouseId]);
  }


  deleteInventory(inventory: Inventory) {
    if (confirm(`Delete inventory for ${inventory.product?.name}?`)) {
      this.isLoading = true;
      this.inventoryService.deleteInventory(inventory.id).subscribe({
        next: () => {
          this.inventories = this.inventories.filter(i => i.id !== inventory.id);
          alert('Inventory deleted successfully');
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete inventory';
          console.error('Error deleting inventory:', error);
          this.isLoading = false;
        }
      });
    }
  }

  exportToExcel(): void {
    // Chuẩn bị dữ liệu
    const data = this.inventories.map(inventory => ({
      'ID': inventory.id,
      'Product': inventory.product.name,
      'Warehouse': inventory.warehouse.name,
      'Quantity': inventory.quantity,
      'Created At': inventory.createdAt ? this.formatDate(inventory.createdAt) : '',
      'Updated At': inventory.updatedAt ? this.formatDate(inventory.updatedAt) : ''
    }));

    // Tạo worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Xuất file
    XLSX.writeFile(wb, 'Inventory_Report.xlsx');
  }

  private formatDate(date: Date): string {
    return date.toLocaleString(); // hoặc định dạng khác tùy bạn
  }

  async exportToPDF(): Promise<void> {
    try {
      // 1. Lấy bảng cần export
      const table = document.getElementById('inventoryTable');
      if (!table) {
        console.error('Table element not found');
        return;
      }
      // 2. Tạo bản sao và đặt style đơn giản
      const clone = table.cloneNode(true) as HTMLElement;
      // Áp dụng CSS đơn giản
      const style = document.createElement('style');
      style.textContent = `
        * {
          color: black !important;
          background: white !important;
          border-color: #ddd !important;
        }
        .btn { display: none !important; }
      `;
      clone.prepend(style);
      // 3. Tạo container ẩn
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-10000px';
      tempDiv.style.top = '0';
      tempDiv.appendChild(clone);
      document.body.appendChild(tempDiv);
      // 4. Thêm delay để đảm bảo DOM đã render
      await new Promise(resolve => setTimeout(resolve, 200));
      // 5. Tạo PDF với các tùy chọn tối ưu
      const canvas = await html2canvas(clone, {
        // scale: 1,
        logging: true, // Bật log để debug
        useCORS: true,
        allowTaint: true,
        // backgroundColor: '#ffffff',
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Inventory_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF generation failed. See console for details.');
    } finally {
      // 6. Dọn dẹp
      const tempDivs = document.querySelectorAll('div[style*="-10000px"]');
      tempDivs.forEach(div => div.remove());
    }
  }
}