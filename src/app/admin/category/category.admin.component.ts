import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../service/category.service';
import { ApiResponse } from '../../../reponses/api.response';


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
    const confirmation = window
      .confirm('Are you sure you want to delete this category?');
    if (confirmation) {

      this.categoryService.deleteCategory(category.id).subscribe({
        next: (apiResponse: ApiResponse) => {

          console.error('Xóa thành công')
          location.reload();
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
  }
}