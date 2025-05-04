import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../reponses/api.response';
import { UpdateProductDTO } from '../dtos/product/update.product.dto';
import { InsertProductDTO } from '../dtos/product/insert.product.dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private tokenService = inject(TokenService);
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }
  // Chuyển danh sách ID thành một chuỗi và truyền vào params

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

  getProducts(
    keyword?: string,
    categoryId?: number,
    page?: number,
    limit?: number
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('keyword', keyword || '')
      .set('category_id', categoryId || '')
      .set('page', page?.toString() || '')
      .set('limit', limit?.toString() || '');
    return this.http.get<ApiResponse>(`${this.apiBaseUrl}/products`, {
      params,
    });
    // product_image.image_url = `${environment.minioUrl}/${product_image.image_url}`;
  }

  getProductsForHomePage() {
    return this.http.get<ApiResponse>(
      `${this.apiBaseUrl}/products/getProductByHomePage`
    );
  }

  getDetailProduct(productId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.apiBaseUrl}/products/${productId}`
    );
  }

  getProductsByIds(productIds: number[]): Observable<ApiResponse> {
    const params = new HttpParams().set('ids', productIds.join(','));
    return this.http.get<ApiResponse>(`${this.apiBaseUrl}/products/by-ids`, {
      params,
    });
  }

  deleteProduct(productId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiBaseUrl}/products/${productId}`,
      { headers: this.getHeaders() }
    );
  }

  updateProduct(productId: number, updatedProduct: UpdateProductDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiBaseUrl}/products/${productId}`,
      updatedProduct,
      { headers: this.getHeaders() }
    );
  }

  insertProduct(insertProductDTO: InsertProductDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiBaseUrl}/products`,
      insertProductDTO,
      { headers: this.getHeaders() }
    );
  }

  // uploadImages(productId: number, files: File[]): Observable<ApiResponse> {
  //   const formData = new FormData();
  //   for (let i = 0; i < files.length; i++) {
  //     formData.append('images', files[i], files[i].name);
  //   }
  //   return this.http.post<ApiResponse>(
  //     `${this.apiBaseUrl}/products/upload-multiple/${productId}`,
  //     formData,
  //     {
  //       headers: {
  //         'Authorization': `Bearer ${this.tokenService.getToken()}`
  //       },
  //     }
  //   );
  // }

  uploadImages(productId: number, files: File[]): Observable<ApiResponse> {
    const formData = new FormData();
    // files.forEach((file, index) => {
    //   formData.append(`images`, file, file.name);
    // });
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i], files[i].name);
    }

    return this.http.post<ApiResponse>(
      `${this.apiBaseUrl}/products/upload-multiple/${productId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${this.tokenService.getToken()}`
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error // Log cả nội dung lỗi từ server
        });
        return throwError(() => error);
      })
    );
  }

  deleteProductImage(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiBaseUrl}/product_images/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getProductCountByCategory(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiBaseUrl}/stats/category-product-count`,
      { headers: this.getHeaders() }
    );
  }
}
