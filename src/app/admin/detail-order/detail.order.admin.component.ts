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
            // const itemTotal = order_detail.total_money || (order_detail.price * order_detail.number_of_products);
            return {
              product: {
                id: order_detail.product_id,
                name: order_detail.product_name,
                thumbnail: `${environment.minioUrl}/products/${order_detail.thumbnail}`,
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
          // Handle the successful update
          //console.log('Order updated successfully:', response);
          // Navigate back to the previous page
          //this.router.navigate(['/admin/orders']);
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
}
