import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { OrderDTO } from '../dtos/order/order.dto';
import { ApiResponse } from '../reponses/api.response';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;
  private apiGetAllOrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;
  private tokenService = inject(TokenService);

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    if (!token) {
      console.warn('Token không tồn tại!');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  placeOrder(orderData: OrderDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, orderData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Lỗi khi đặt hàng:', error);
        return throwError(() => error);
      })
    );
  }


  // getOrderById(orderId: number): Observable<ApiResponse> {
  //   const url = `${environment.apiBaseUrl}/orders/${orderId}`;
  //   return this.http.get<ApiResponse>(url);
  // }

  getOrderById(orderId: number): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.get<ApiResponse>(url, {
      headers: this.getHeaders() // Thêm headers xác thực
    }).pipe(
      catchError(error => {
        console.error('Error fetching order:', error);
        return throwError(() => error);
      })
    );
  }


  getAllOrders(
    keyword: string,
    page: number,
    limit: number
  ): Observable<ApiResponse> {
    // Kiểm tra và chuẩn hóa các tham số đầu vào
    const validatedPage = Math.max(page, 0); // Đảm bảo page không âm
    const validatedLimit = Math.max(limit, 1); // Đảm bảo limit ít nhất là 1

    // Tạo params với giá trị đã được kiểm tra
    const params = new HttpParams()
      .set('keyword', keyword || '') // Xử lý khi keyword là null/undefined
      .set('page', validatedPage.toString())
      .set('limit', validatedLimit.toString());

    try {
      return this.http.get<ApiResponse>(this.apiGetAllOrders, {
        params,
        headers: this.getHeaders()
      }).pipe(
        catchError(error => {
          // Xử lý lỗi cụ thể
          if (error.status === 401) {
            console.error('Lỗi xác thực: Token không hợp lệ hoặc hết hạn');
            // Có thể thêm logic đăng xuất hoặc refresh token ở đây
          } else if (error.status === 404) {
            console.error('API endpoint không tồn tại');
          }

          // Trả về một Observable lỗi mới với thông báo thân thiện
          return throwError(() => new Error('Có lỗi xảy ra khi tải danh sách đơn hàng. Vui lòng thử lại sau.'));
        })
      );
    } catch (error) {
      // Bắt các lỗi có thể xảy ra khi tạo request
      console.error('Lỗi khi tạo request:', error);
      return throwError(() => new Error('Có lỗi khi chuẩn bị yêu cầu.'));
    }
  }

  updateOrder(orderId: number, orderData: OrderDTO): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.put<ApiResponse>(url, orderData, {
      headers: this.getHeaders() // Thêm headers xác thực
    });
  }

  deleteOrder(orderId: number): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.delete<ApiResponse>(url, {
      headers: this.getHeaders() // Thêm headers xác thực
    });
  }


  // getRevenueByMonth(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/orders/revenue-by-month?status=delivered`);
  // }

  // getOrderStatsByCategory(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/orders/stats-by-category?status=delivered`);
  // }

  // getStats(): Observable<{ totalOrders: number, totalRevenue: number }> {
  //   return this.http.get<{ totalOrders: number, totalRevenue: number }>(`${this.apiUrl}/orders/stats?status=delivered`);
  // }

  getRecentOrders(limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/recent?limit=${limit}`);
  }

  getOrderCountByCategory(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/stats/category-order-count`);
}
}

