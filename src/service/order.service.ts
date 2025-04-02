import { ProductService } from './product.service';
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

  // placeOrder(orderData: OrderDTO): Observable<ApiResponse> {
  //   // Gửi yêu cầu đặt hàng
  //   return this.http.post<ApiResponse>(this.apiUrl, orderData);
  // }
  
  getOrderById(orderId: number): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.get<ApiResponse>(url);
  }

  getAllOrders(
    keyword: string,
    page: number,
    limit: number
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse>(this.apiGetAllOrders, { params });
  }

  updateOrder(orderId: number, orderData: OrderDTO): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.put<ApiResponse>(url, orderData);
  }

  deleteOrder(orderId: number): Observable<ApiResponse> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.delete<ApiResponse>(url);
  }

}
