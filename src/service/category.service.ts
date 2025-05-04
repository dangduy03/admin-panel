import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../reponses/api.response';
import { InsertCategoryDTO } from '../dtos/category/insert.category.dto';
import { UpdateCategoryDTO } from '../dtos/category/update.category.dto';
import { TokenService } from './token.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiBaseUrl = environment.apiBaseUrl;

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

  getCategories(page: number, limit: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse>(`${environment.apiBaseUrl}/categories`, {
      params,
      headers: this.getHeaders(),
    });
  }

  getDetailCategory(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiBaseUrl}/categories/${id}`);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.apiBaseUrl}/categories/${id}`, {
      headers: this.getHeaders() // Thêm header Authorization
    });
  }

  updateCategory(id: number, updatedCategory: UpdateCategoryDTO): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.tokenService.getToken()}` // Thêm Authorization header
    });

    return this.http.put<ApiResponse>(
      `${this.apiBaseUrl}/categories/${id}`,
      updatedCategory,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.getHeaders();
        }
        return throwError(() => error);
      })
    );
  }

  insertCategory(dto: InsertCategoryDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiBaseUrl}/categories`,
      dto,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.tokenService.removeToken();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

}
