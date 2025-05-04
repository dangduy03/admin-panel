import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../reponses/api.response';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { InventoryAdjustmentDTO } from '../dtos/inventory/inventory-adjustment.dto';
import { UpdateTransactionDTO } from '../dtos/inventory/update-transaction.dto';

@Injectable({
    providedIn: 'root'
})
export class InventoryTransactionService {
    private apiUrl = `${environment.apiBaseUrl}/inventory/transactions`;

    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        if (!token) {
            this.router.navigate(['/login']);
            throw new Error('No token available');
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
        }
        return throwError(() => error);
    }

    getTransactions(
        type?: string,
        startDate?: Date,
        endDate?: Date,
        page: number = 1,
        limit: number = 10
    ): Observable<ApiResponse> {
        let params: any = {
            page: page.toString(),
            limit: limit.toString()
        };

        if (type) params.type = type;
        if (startDate) params.start_date = startDate.toISOString().split('T')[0];
        if (endDate) params.end_date = endDate.toISOString().split('T')[0];

        return this.http.get<ApiResponse>(this.apiUrl, {
            headers: this.getHeaders(),
            params
        }).pipe(
            catchError(this.handleError.bind(this))
        );
    }

    deleteTransaction(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError.bind(this))
        );
    }

    getTransactionById(id: number): Observable<ApiResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.get(`${environment.apiBaseUrl}/inventory/transactions/${id}`, {
            headers: headers,
            observe: 'response' // Giúp debug chi tiết
        }).pipe(
            map(response => {
                console.log('Raw API response:', response); // Log toàn bộ response
                if (!response.body) {
                    throw new Error('Empty response body');
                }
                return response.body as ApiResponse;
            }),
            catchError(error => {
                console.error('API Error Details:', {
                    status: error.status,
                    message: error.message,
                    url: error.url,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    createTransaction(inventoryAdjustmentDTO: InventoryAdjustmentDTO): Observable<ApiResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });
    
        // Chuyển đổi thành dữ liệu phù hợp với backend
        const requestBody = {
            productId: inventoryAdjustmentDTO.product_id,
            warehouseId: inventoryAdjustmentDTO.warehouse_id,
            adjustment: inventoryAdjustmentDTO.adjustment,
            note: inventoryAdjustmentDTO.note,
            adjustmentType: inventoryAdjustmentDTO.adjustmentType
        };
    
        console.log('Sending to server:', requestBody); // Kiểm tra dữ liệu cuối cùng
    
        return this.http.post<ApiResponse>(
            `${environment.apiBaseUrl}/inventory/transactions`,
            requestBody,
            { headers }
        ).pipe(
            catchError(error => {
                console.error('API Error:', {
                    status: error.status,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    updateTransaction(id: number, updateTransactionDTO: UpdateTransactionDTO): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(
            `${environment.apiBaseUrl}/inventory/transactions/${id}`,
            updateTransactionDTO,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(this.handleError)
        );
    }
}