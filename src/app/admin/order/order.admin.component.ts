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

}