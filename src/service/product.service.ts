import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { environment } from '../environments/environment';
import { ApiResponse } from '../reponses/api.response';
import { UpdateProductDTO } from '../dtos/product/update.product.dto';
import { InsertProductDTO } from '../dtos/product/insert.product.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // private apiGetProducts = `${environment.apiBaseUrl}/products`;
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}
  // Chuyển danh sách ID thành một chuỗi và truyền vào params

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
      `${this.apiBaseUrl}/products/${productId}`
    );
  }

  updateProduct(
    productId: number,
    updatedProduct: UpdateProductDTO
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiBaseUrl}/products/${productId}`,
      updatedProduct
    );
  }

  insertProduct(insertProductDTO: InsertProductDTO): Observable<ApiResponse> {
    // Add a new product
    return this.http.post<ApiResponse>(
      `${this.apiBaseUrl}/products`,
      insertProductDTO
    );
  }

  uploadImages(productId: number, files: File[]): Observable<ApiResponse> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    // Upload images for the specified product id
    // return this.http.post<ApiResponse>(`${this.apiBaseUrl}/products/uploads/${productId}`, formData);
    return this.http.post<ApiResponse>(
      `${environment.minioUrl}/products/${productId}`,
      formData
    );
  }

  deleteProductImage(id: number): Observable<any> {
    return this.http.delete<string>(`${this.apiBaseUrl}/product_images/${id}`);
  }
}
