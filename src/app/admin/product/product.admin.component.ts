import { Component, Inject, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Product } from '../../../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../service/product.service';
import { ApiResponse } from '../../../reponses/api.response';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product.admin.component.html',
  styleUrls: ['./product.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProductAdminComponent implements OnInit {
  selectedCategoryId: number = 0; // Giá trị category được chọn
  products: Product[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  localStorage?: Storage;

  private productService = inject(ProductService);
  private router = inject(Router);
  private location = inject(Location);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }
  ngOnInit() {
    this.currentPage =
      Number(this.localStorage?.getItem('currentProductAdminPage')) || 0;
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage
    );
  }

  searchProducts() {
    this.currentPage = 0;
    this.itemsPerPage = 12;
    this.getProducts(
      this.keyword.trim(),
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage
    );
  }

  getProducts(
    keyword: string,
    selectedCategoryId: number,
    page: number,
    limit: number
  ) {
    
    this.productService
      .getProducts(keyword, selectedCategoryId, page, limit)
      .subscribe({
        next: (apiResponse: ApiResponse) => {
          // const products = apiResponse?.data as Product[];
          const response = apiResponse.data;
          response.products.forEach((product: Product) => {
            if (product) {
              product.url = `${environment.minioUrl}/${product.thumbnail}`;
            }
          });
          this.products = response.products;
          this.totalPages = apiResponse?.data.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        complete: () => { },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.localStorage?.setItem(
      'currentProductAdminPage',
      String(this.currentPage)
    );
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage
    );
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  // Hàm xử lý sự kiện khi thêm mới sản phẩm
  insertProduct() {
    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/admin/products/insert']);
  }

  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  updateProduct(productId: number) {
    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/admin/products/update', productId]);
  }

  deleteProduct(product: Product) {
    const confirmation = window.confirm(
      'Are you sure you want to delete this product?'
    );
    if (confirmation) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (apiResponse: ApiResponse) => {
          console.error('Xóa thành công');
          location.reload();
        },
        complete: () => { },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        },
      });
    }
  }
}
