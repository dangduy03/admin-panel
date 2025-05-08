import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../reponses/api.response';
import { InventoryTransaction } from '../../../models/inventory-transaction';
import { InventoryTransactionService } from '../../../service/inventory-transaction.service';
import { TokenService } from '../../../service/token.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-inventory-transaction.admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './inventory-transaction.admin.component.html',
  styleUrl: './inventory-transaction.admin.component.scss'
})
export class InventoryTransactionAdminComponent implements OnInit {
  transactions: InventoryTransaction[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];
  filterType: string = 'ALL';
  startDate?: Date;
  endDate?: Date;

  constructor(
    private transactionService: InventoryTransactionService,
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  getTransactions(page: number, limit: number) {
    const type = this.filterType === 'ALL' ? undefined : this.filterType;

    this.transactionService.getTransactions(
      type,
      this.startDate,
      this.endDate,
      page,
      limit
    ).subscribe({
      next: (response: any) => {
        let transactionData;
        if (Array.isArray(response)) {
          transactionData = response;
          this.totalPages = 1;
        } else if (response?.data) {
          transactionData = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        } else {
          transactionData = [];
          console.error('Unexpected response format:', response);
        }

        // Xử lý chuyển đổi ngày tháng từ mảng số sang Date object
        this.transactions = transactionData.map((item: any) => ({
          ...item,
          createdAt: this.arrayToDate(item.createdAt),
          updatedAt: this.arrayToDate(item.updatedAt)
        }));

        console.log('Processed transactions:', this.transactions);
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
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

  applyFilters() {
    this.currentPage = 1;
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getTransactions(this.currentPage, this.itemsPerPage);
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

  deleteTransaction(transactionId: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== transactionId);
          // Adjust pagination if needed
          if (this.transactions.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.getTransactions(this.currentPage, this.itemsPerPage);
          }
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          alert(`Failed to delete transaction: ${error.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  updateTransaction(transactionId: number) {
    this.router.navigate(['/admin/transactions/update', transactionId]);
  }

  insertTransaction() {
    this.router.navigate(['/admin/transactions/insert']);
  }

  searchTransaction() {
    this.currentPage = 0;
    this.getTransactions(this.currentPage, this.itemsPerPage);
  }

  exportToExcel(): void {
    // Chuẩn bị dữ liệu - SỬA LỖI BIẾN transactions thành transaction
    const data = this.transactions.map(transaction => ({
      'ID': transaction.id,
      'Date': transaction.createdAt ? this.formatDate(transaction.createdAt) : 'N/A',
      'Product': transaction.product?.name || '',
      'Warehouse': transaction.warehouse?.name || '',
      'Type': transaction.transactionType,
      'Quantity': transaction.quantityChange,
      'Note': transaction.note || ''
    }));

    // Tạo worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InventoryTransactions');

    // Xuất file
    XLSX.writeFile(wb, `Inventory_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }



  private formatDate(date: Date): string {
    return date.toLocaleString(); // hoặc định dạng khác tùy bạn
  }

  async exportToPDF(): Promise<void> {
    try {
      // 1. Lấy bảng cần export
      const table = document.getElementById('inventoryTransactionsTable');
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