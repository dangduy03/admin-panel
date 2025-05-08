import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrderDTO } from '../../../dtos/order/order.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderResponse } from '../../../reponses/order/order.response';
import { OrderService } from '../../../service/order.service';
import { ApiResponse } from '../../../reponses/api.response';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-detail-order-admin',
  templateUrl: './detail.order.admin.component.html',
  styleUrls: ['./detail.order.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DetailOrderAdminComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;
  orderId: number = 0;
  orderResponse: OrderResponse = {
    id: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    user_id: 0,
    fullname: '',
    phone_number: '',
    email: '',
    address: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0,
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [],
  };

  private orderService = inject(OrderService);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getOrderDetails();
  }

  getOrderDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (apiResponse: ApiResponse) => {
        const response = apiResponse.data;
        this.orderResponse.id = response.id;
        this.orderResponse.user_id = response.user_id;
        this.orderResponse.fullname = response.fullname;
        this.orderResponse.email = response.email;
        this.orderResponse.phone_number = response.phone_number;
        this.orderResponse.address = response.address;
        this.orderResponse.note = response.note;
        this.orderResponse.total_money = response.total_money;
        this.orderResponse.order_date = response.order_date;
        this.cd.detectChanges();
        this.orderResponse.order_details = response.order_details.map(
          (order_detail: any) => {
            return {
              product: {
                id: order_detail.product_id,
                name: order_detail.product_name,
                thumbnail: `${environment.minioUrl}/${order_detail.thumbnail}`,

                price: order_detail.price
              },
              number_of_products: order_detail.number_of_products,
              total_money: order_detail.total_money || order_detail.price * order_detail.number_of_products
            };
          }
        );
        this.orderResponse.payment_method = response.payment_method;
        if (response.shipping_date) {
          this.orderResponse.shipping_date = new Date(
            response.shipping_date[0],
            response.shipping_date[1] - 1,
            response.shipping_date[2]
          );
        }
        this.orderResponse.shipping_method = response.shipping_method;
        this.orderResponse.status = response.status;
        this.isLoading = false;
      },
      complete: () => { },
      error: (error: HttpErrorResponse) => {
        console.error('Error:', error);
        this.isLoading = false;
        this.errorMessage = 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.';
        if (error.status === 401) {
          this.errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          this.router.navigate(['/login']);
        }
      }
    });
  }


  saveOrder(): void {
    this.orderService
      .updateOrder(this.orderId, new OrderDTO(this.orderResponse))
      .subscribe({
        next: (response: ApiResponse) => {
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        complete: () => { },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  exportToExcel(): void {
    // Chuẩn bị dữ liệu cho thông tin đơn hàng
    const orderInfo = [
      ['Mã đơn hàng', this.orderResponse.id],
      ['Khách hàng', this.orderResponse.fullname],
      ['Số điện thoại', this.orderResponse.phone_number],
      ['Email', this.orderResponse.email],
      ['Địa chỉ', this.orderResponse.address],
      ['Ngày đặt', this.formatDate(this.orderResponse.order_date)],
      ['Ghi chú', this.orderResponse.note || 'Không có'],
      ['Trạng thái', this.orderResponse.status],
      ['Tổng tiền', this.orderResponse.total_money],
      ['Phương thức thanh toán', this.orderResponse.payment_method || 'Chưa xác định']
    ];

    // Chuẩn bị dữ liệu cho sản phẩm
    const productsData = (this.orderResponse.order_details || []).map(item => ({
      'Tên sản phẩm': item.product?.name || '',
      'SKU': item.product?.id || '',
      'Đơn giá': item.product?.price || 0,
      'Số lượng': item.number_of_products || 0,
      'Thành tiền': item.total_money || 0
    }));

    // Tạo workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Thêm sheet thông tin đơn hàng
    const wsOrderInfo: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(orderInfo);
    XLSX.utils.book_append_sheet(wb, wsOrderInfo, 'Thông tin đơn hàng');

    // Thêm sheet sản phẩm
    const wsProducts: XLSX.WorkSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Sản phẩm');

    // Xuất file
    XLSX.writeFile(wb, `Chi_tiet_don_hang_${this.orderResponse.id}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private formatDate(date: string | Date | undefined | null): string {
    // Xử lý các trường hợp không có giá trị
    if (!date) return '';

    // Chuyển đổi string thành Date nếu cần
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Kiểm tra Date hợp lệ
    if (isNaN(dateObj.getTime())) return '';

    // Định dạng ngày tháng
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async exportToPDF(): Promise<void> {
    try {
      // 1. Lấy bảng cần export
      const table = document.getElementById('orderExportContainer');
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
        border-color: #000 !important;
      }
      .btn, .form-select { display: none !important; }
      .card { 
        border: 1px solid #000 !important; 
        margin-bottom: 15px !important;
      }
      .card-header { 
        border-bottom: 1px solid #000 !important;
        padding: 10px !important;
      }
      table { 
        width: 100% !important; 
        border-collapse: collapse !important; 
        margin-bottom: 15px !important;
      }
      th, td { 
        border: 1px solid #000 !important; 
        padding: 8px !important;
      }
      th { 
        font-weight: bold !important;
      }
      img { 
        max-width: 60px !important; 
        max-height: 60px !important;
      }
    `;
      clone.prepend(style);

      // Ẩn tất cả hình ảnh để tránh lỗi
      const images = clone.querySelectorAll('img');
      images.forEach(img => img.style.display = 'none');

      // 3. Tạo container ẩn
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-10000px';
      tempDiv.style.top = '0';
      tempDiv.appendChild(clone);
      document.body.appendChild(tempDiv);

      // 4. Thêm delay để đảm bảo DOM đã render
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. Tạo PDF với các tùy chọn tối ưu
      const canvas = await html2canvas(clone, {
        // scale: 1,
        logging: false,
        useCORS: false,
        allowTaint: false
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Order_${this.orderResponse.id}_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      // 6. Dọn dẹp
      const tempDivs = document.querySelectorAll('div[style*="-10000px"]');
      tempDivs.forEach(div => div.remove());
    }
  }
}