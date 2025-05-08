import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OrderResponse } from '../../../reponses/order/order.response';
import { OrderService } from '../../../service/order.service';
import { ApiResponse } from '../../../reponses/api.response';
import { TokenService } from '../../../service/token.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order.admin.component.html',
  styleUrls: ['./order.admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})

export class OrderAdminComponent implements OnInit {
  orders: OrderResponse[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  visiblePages: number[] = [];
  localStorage?: Storage;

  constructor(
    private tokenService: TokenService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    console.log('Initializing OrderAdminComponent');
    if (!this.tokenService.getToken()) {
      console.warn('No token found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.currentPage = Number(this.localStorage?.getItem('currentOrderAdminPage')) || 0;
    console.log('Current page from storage:', this.currentPage);

    this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage);
  }

  searchOrders() {
    this.currentPage = 0;
    this.itemsPerPage = 12;
    //Mediocre Iron Wallet

    this.getAllOrders(this.keyword.trim(), this.currentPage, this.itemsPerPage);
  }

  getAllOrders(keyword: string, page: number, limit: number) {
    // this.orders = undefined; // Bỏ comment để hiển thị trạng thái loading
    console.log('Fetching orders with:', { keyword, page, limit });

    this.orderService.getAllOrders(keyword, page, limit).subscribe({
      next: (apiResponse: any) => {
        console.log('API Data Structure:', apiResponse);

        // Xử lý dữ liệu - CHỌN 1 TRONG 2 CÁCH DƯỚI ĐÂY:

        // CÁCH 1: Nếu apiResponse.data là mảng các orders trực tiếp
        if (apiResponse && Array.isArray(apiResponse.data)) {
          this.orders = apiResponse.data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            fullname: item.fullname,
            phone_number: item.phone_number,
            email: item.email,
            address: item.address || 'Không có',
            note: item.note || 'Không có',
            order_date: item.order_date ? new Date(item.order_date) : null,
            status: item.status || 'Đang xử lý',
            total_money: item.total_money || 0
          }));
        }
        // CÁCH 2: Nếu apiResponse.data có cấu trúc { orders: [], totalPages: number }
        else if (apiResponse?.data?.orders && Array.isArray(apiResponse.data.orders)) {
          this.orders = apiResponse.data.orders.map((item: any) => ({
            // ... cùng mapping như trên
          }));
          this.totalPages = apiResponse.data.totalPages || 1;
        }
        else {
          this.orders = [];
        }

        this.currentPage = Math.min(page, this.totalPages - 1);
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);

        console.log('Processed data:', {
          orders: this.orders,
          totalPages: this.totalPages,
          currentPage: this.currentPage
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching orders:', error);
        this.orders = []; // Reset danh sách đơn hàng khi có lỗi
      }
    });
  }

  onPageChange(page: number) {
    ;
    this.currentPage = page < 0 ? 0 : page;
    this.localStorage?.setItem('currentOrderAdminPage', String(this.currentPage));
    this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 0) {
      return [];
    }

    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    const visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  }

  deleteOrder(id: number) {
    const confirmation = window.confirm('Are you sure you want to delete this order?');
    if (confirmation) {
      this.orderService.deleteOrder(id).subscribe({
        next: (response: ApiResponse) => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/admin/orders']);
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        }
      });
    }
  }

  viewDetails(order: OrderResponse) {
    this.router.navigate(['/admin/orders', order.id]);
  }

  // Thêm các hàm export
  exportToExcel(): void {
    // Chuẩn bị dữ liệu
    const data = this.orders.map(order => ({
      'ID': order.id || '-',
      'User ID': order.user_id || '-',
      'Full Name': order.fullname || '-',
      'Email': order.email || '-',
      'Phone': order.phone_number || '-',
      'Address': order.address || '-',
      'Note': order.note || '-',
      'Order Date': order.order_date ? this.formatDate(order.order_date) : '-',
      'Status': order.status || '-',
      'Total Money': order.total_money || 0
    }));
    // Tạo worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    // Xuất file
    XLSX.writeFile(wb, `Orders_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-'; // Kiểm tra Date hợp lệ
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  async exportToPDF(): Promise<void> {
    try {
      // 1. Lấy bảng cần export
      const table = document.getElementById('orderTable');
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
        .badge { 
          color: white !important;
          padding: 0.25em 0.4em;
          border-radius: 0.25rem;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
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
        // scale: 1.5 // Tăng scale để cải thiện chất lượng
      });
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape mode để phù hợp với bảng rộng
      const imgWidth = 280; // Tăng chiều rộng cho landscape
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Orders_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
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