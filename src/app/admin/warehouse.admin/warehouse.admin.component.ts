import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Warehouse } from '../../../models/warehouse';
import { WarehouseService } from '../../../service/warehouse.service';
import { TokenService } from '../../../service/token.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

        let warehouseData;
        if (Array.isArray(response)) {
          warehouseData = response;
          this.totalPages = 1;
        } else if (response?.data) {
          warehouseData = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        } else {
          warehouseData = [];
          console.error('Unexpected response format:', response);
        }

        // Xử lý chuyển đổi ngày tháng từ mảng số sang Date object
        this.warehouses = warehouseData.map((item: any) => ({
          ...item,
          createdAt: this.arrayToDate(item.createdAt),
          updatedAt: this.arrayToDate(item.updatedAt)
        }));

        console.log('Processed warehouses:', this.warehouses);
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
      }
    });
  }

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

  // Thêm các hàm export
  exportToExcel(): void {
    // Chuẩn bị dữ liệu
    const data = this.warehouses.map(warehouse => ({
      'ID': warehouse.id,
      'Name': warehouse.name,
      'Location': warehouse.location,
      'Created At': warehouse.createdAt ? this.formatDate(warehouse.createdAt) : '',
      'Updated At': warehouse.updatedAt ? this.formatDate(warehouse.updatedAt) : ''
    }));

    // Tạo worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Warehouses');

    // Xuất file
    XLSX.writeFile(wb, 'Warehouses_Report.xlsx');
  }
  private formatDate(date: Date): string {
    return date.toLocaleString();
  }
  async exportToPDF(): Promise<void> {
    try {
      // 1. Lấy bảng cần export
      const table = document.getElementById('warehouseTable');
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
        logging: true,
        useCORS: true,
        allowTaint: true,
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Warehouses_${new Date().toISOString().slice(0, 10)}.pdf`);
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
