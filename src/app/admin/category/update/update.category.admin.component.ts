import { Component, OnInit } from '@angular/core';
import { Category } from '../../../../models/category';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateCategoryDTO } from '../../../../dtos/category/update.category.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../../service/category.service';
import { ApiResponse } from '../../../../reponses/api.response';
import { TokenService } from '../../../../service/token.service';

@Component({
  selector: 'app-detail.category.admin',
  templateUrl: './update.category.admin.component.html',
  styleUrls: ['./update.category.admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})

export class UpdateCategoryAdminComponent implements OnInit {
  categoryId: number;
  updatedCategory: Category;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
  ) {
    this.categoryId = 0;
    this.updatedCategory = {} as Category;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      this.categoryId = Number(params.get('id'));
      this.getCategoryDetails();
    });

  }

  getCategoryDetails(): void {
    this.categoryService.getDetailCategory(this.categoryId).subscribe({
      next: (apiResponse: ApiResponse) => {
        this.updatedCategory = { ...apiResponse.data };
      },
      complete: () => {

      },
      error: (error: HttpErrorResponse) => {
        ;
        console.error(error?.error?.message ?? '');
      }
    });
  }

  updateCategory() {
    // Kiểm tra token trước khi gọi API
    if (this.tokenService.isTokenExpired() || !this.tokenService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    const updateCategoryDTO: UpdateCategoryDTO = {
      name: this.updatedCategory.name
    };

    this.categoryService.updateCategory(this.categoryId, updateCategoryDTO).subscribe({
      next: () => {
        alert('Cập nhật thành công!');
        this.router.navigate(['/admin/categories']);
      },
      error: (error) => {
        if (error.status === 401) {
          alert('Phiên đăng nhập hết hạn!');
          this.router.navigate(['/login']);
        } else {
          console.error('Lỗi khi cập nhật:', error);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/categories']);
    // Hoặc sử dụng location.back() nếu muốn quay lại trang trước đó
  }
}
