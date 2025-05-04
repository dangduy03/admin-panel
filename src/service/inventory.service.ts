import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../reponses/api.response';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = 'http://localhost:8080/api/v1/inventory';

    constructor(private http: HttpClient) { }

    getInventoryByWarehouse(
        warehouseId?: number,
        keyword?: string,
        page: number = 1,
        limit: number = 10
    ): Observable<ApiResponse> {
        let url = `${this.apiUrl}/warehouses/${warehouseId}?page=${page}&limit=${limit}`;
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        return this.http.get<ApiResponse>(url);
    }

    getAllWarehouses(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.apiUrl}/warehouses`);
    }

    adjustInventory(adjustment: any): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/adjust`, adjustment);
    }

    updateInventory(id: number, inventoryData: any): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, inventoryData);
    }
}