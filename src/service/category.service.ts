import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { ApiResponse } from '../reponses/api.response';
import { InsertCategoryDTO } from '../dtos/category/insert.category.dto';
import { UpdateCategoryDTO } from '../dtos/category/update.category.dto';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiBaseUrl = environment.apiBaseUrl;

  // private apiGetCategories = `${environment.apiBaseUrl}/categories`;

  constructor(private http: HttpClient) {}
  getCategories(page: number, limit: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    // return this.http.get<Category[]>(this.apiGetCategories, { params });
    return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/categories`, {
      params,
    });
  }

  getDetailCategory(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiBaseUrl}/categories/${id}`);
  }

  deleteCategory(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiBaseUrl}/categories/${id}`);
  }

  updateCategory(
    id: number,
    updatedCategory: UpdateCategoryDTO
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiBaseUrl}/categories/${id}`,
      updatedCategory
    );
  }

  insertCategory(
    insertCategoryDTO: InsertCategoryDTO
  ): Observable<ApiResponse> {
    // Add a new category
    return this.http.post<ApiResponse>(
      `${this.apiBaseUrl}/categories`,
      insertCategoryDTO
    );
  }
}
