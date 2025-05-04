import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../reponses/api.response';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { WarehouseDTO } from '../dtos/inventory/warehouse.dto';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private apiBaseUrl = environment.apiBaseUrl;
    // private apiUrl = 'http://localhost:8088/api/v1/inventory/warehouse';


    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router,
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        if (!token) {
            this.router.navigate(['/login']); // Redirect if no token
            throw new Error('No token available');
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    getWarehouses(page: number, limit: number): Observable<ApiResponse> {
        return this.http.get(`${this.apiBaseUrl}/inventory/warehouses`, {
            params: new HttpParams()
                .set('page', page.toString())
                .set('limit', limit.toString()),
            headers: this.getHeaders(),
            observe: 'response'
        }).pipe(
            tap(response => console.log('Full response:', response)),
            map(response => {
                if (!response.body) {
                    throw new Error('Empty response body');
                }
                return response.body as ApiResponse;
            }),
            catchError(error => {
                console.error('API Error:', {
                    status: error.status,
                    message: error.message,
                    url: error.url,
                    headers: error.headers,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    getWarehouseById(id: number): Observable<ApiResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.get(`${environment.apiBaseUrl}/inventory/warehouses/${id}`, {
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

    createWarehouse(warehouseDTO: WarehouseDTO): Observable<ApiResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tokenService.getToken()}`
        });

        return this.http.post<ApiResponse>(
            `${environment.apiBaseUrl}/inventory/warehouses`,
            warehouseDTO,
            {
                headers: headers,
                observe: 'response' // Thêm để debug
            }
        ).pipe(
            tap(response => console.log('Create response:', response)),
            map(response => response.body as ApiResponse),
            catchError(error => {
                console.error('Create error:', {
                    status: error.status,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    updateWarehouse(id: number, warehouseDTO: WarehouseDTO): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(
            `${this.apiBaseUrl}/inventory/warehouses/${id}`,
            warehouseDTO,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(this.handleError)
        );
    }

    deleteWarehouse(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(
            `${this.apiBaseUrl}/inventory/warehouses/${id}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            // Xử lý khi token hết hạn
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
        }
        return throwError(() => error);
    }
}