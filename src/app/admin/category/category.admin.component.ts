import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../service/category.service';
import { ApiResponse } from '../../../reponses/api.response';
import { TokenService } from '../../../service/token.service';


@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: [
    './category.admin.component.scss',
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})

export class CategoryAdminComponent implements OnInit {
  categories: Category[] = []; // Dữ liệu động từ categoryService
  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
    this.getCategories(0, 100);
  }

  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (apiResponse: ApiResponse) => {
        ;
        this.categories = apiResponse.data;
      },
      complete: () => {
        ;
      },
      error: (error: HttpErrorResponse) => {
        ;
        console.error(error?.error?.message ?? '');
      }
    });
  }

  insertCategory() {

    // Điều hướng đến trang detail-category với categoryId là tham số
    this.router.navigate(['/admin/categories/insert']);
  }

  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  updateCategory(categoryId: number) {

    this.router.navigate(['/admin/categories/update', categoryId]);
  }

  deleteCategory(category: Category) {
    if (this.tokenService.isTokenExpired() || !this.tokenService.getToken()) {
      alert('Vui lòng đăng nhập lại!');
      this.router.navigate(['/login']);
      return;
    }
    const confirmation = confirm('Bạn chắc chắn muốn xóa danh mục này?');
    if (confirmation) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.getCategories(0, 100); // Load lại danh sách
        },
        error: (error) => {
          console.error('Lỗi khi xóa:', error);
          if (error.status === 401) {
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }
}