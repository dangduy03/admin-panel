import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { InsertProductDTO } from '../../../../dtos/product/insert.product.dto';
import { Category } from '../../../../models/category';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../../service/category.service';
import { ProductService } from '../../../../service/product.service';
import { ApiResponse } from '../../../../reponses/api.response';

@Component({
  selector: 'app-insert.product.admin',
  templateUrl: './insert.product.admin.component.html',
  styleUrls: ['./insert.product.admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})

export class InsertProductAdminComponent implements OnInit {
  insertProductDTO: InsertProductDTO = {
    name: '',
    price: 0,
    description: '',
    category_id: 1,
    images: []
  };

  categories: Category[] = []; // Dữ liệu động từ categoryService
  isSubmitting = false;
  imageError: string | null = null;
  formSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private productService: ProductService,
    private location: Location,
  ) {

  }
  ngOnInit() {
    this.getCategories(1, 100)
  }

  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (apiResponse: ApiResponse) => {
        this.categories = apiResponse.data;
        if (this.categories.length > 0 && !this.insertProductDTO.category_id) {
          this.insertProductDTO.category_id = this.categories[0].id;
        }
      },
      error: (error: HttpErrorResponse) => {
        alert('Failed to load categories');
        console.error('Error loading categories:', error?.error?.message ?? '');
      }
    });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    this.imageError = null;

    if (!files || files.length === 0) {
      return;
    }

    if (files.length > 5) {
      this.imageError = 'Maximum 5 images allowed';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (let i = 0; i < files.length; i++) {
      if (!validTypes.includes(files[i].type)) {
        this.imageError = 'Only JPG, PNG, and WEBP images are allowed';
        return;
      }
      if (files[i].size > 5 * 1024 * 1024) { // 5MB
        this.imageError = `File "${files[i].name}" exceeds 5MB limit`;
        return;
      }
    }

    this.insertProductDTO.images = Array.from(files);
  }

  removeFile(index: number) {
    this.insertProductDTO.images.splice(index, 1);
  }

  // insertProduct() {
  //   this.formSubmitted = true;

  //   // Validate form
  //   if (!this.isFormValid()) {
  //     alert('Please fill all required fields correctly');
  //     return;
  //   }

  //   if (!this.insertProductDTO.images || this.insertProductDTO.images.length === 0) {
  //     this.imageError = 'Please upload at least one image';
  //     return;
  //   }

  //   this.isSubmitting = true;

  //   this.productService.insertProduct(this.insertProductDTO).subscribe({
  //     next: (apiResponse: ApiResponse) => {
  //       const productId = apiResponse.data.id;

  //       if (this.insertProductDTO.images.length > 0) {
  //         this.productService.uploadImages(productId, this.insertProductDTO.images).subscribe({
  //           next: () => {
  //             alert('Product created successfully');
  //             this.router.navigate(['/admin/products']);
  //           },
  //           error: (uploadError: HttpErrorResponse) => {
  //             this.isSubmitting = false;
  //             alert('Product created but image upload failed');
  //             console.error('Image upload error:', uploadError?.error?.message ?? '');
  //             this.router.navigate(['/admin/products']);
  //           }
  //         });
  //       } else {
  //         alert('Product created successfully');
  //         this.router.navigate(['/admin/products']);
  //       }
  //     },
  //     error: (error: HttpErrorResponse) => {
  //       this.isSubmitting = false;
  //       const errorMsg = error?.error?.message || 'Failed to create product';
  //       alert(errorMsg);
  //       console.error('Product creation error:', error);
  //     }
  //   });
  // }

  // insertProduct() {
  //   this.formSubmitted = true;

  //   if (!this.isFormValid()) {
  //     alert('Vui lòng điền đầy đủ thông tin bắt buộc');
  //     return;
  //   }

  //   if (!this.insertProductDTO.images || this.insertProductDTO.images.length === 0) {
  //     this.imageError = 'Vui lòng chọn ít nhất 1 ảnh';
  //     return;
  //   }

  //   this.isSubmitting = true;

  //   this.productService.insertProduct(this.insertProductDTO).subscribe({
  //     next: (apiResponse: ApiResponse) => {
  //       const productId = apiResponse.data.id;

  //       if (this.insertProductDTO.images.length > 0) {
  //         this.productService.uploadImages(productId, this.insertProductDTO.images).subscribe({
  //           next: (uploadResponse) => {
  //             alert('Thêm sản phẩm thành công');
  //             this.router.navigate(['/admin/products']);
  //           },
  //           error: (uploadError) => {
  //             this.isSubmitting = false;
  //             console.error('Lỗi upload ảnh:', uploadError);
  //             alert('Thêm sản phẩm thành công nhưng upload ảnh thất bại');
  //             this.router.navigate(['/admin/products']);
  //           }
  //         });
  //       } else {
  //         alert('Thêm sản phẩm thành công');
  //         this.router.navigate(['/admin/products']);
  //       }
  //     },
  //     error: (error) => {
  //       this.isSubmitting = false;
  //       console.error('Lỗi thêm sản phẩm:', error);
  //       alert(`Lỗi: ${error.error?.message || 'Không thể thêm sản phẩm'}`);
  //     }
  //   });
  // }

  insertProduct() {
    this.formSubmitted = true;

    if (!this.isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!this.insertProductDTO.images || this.insertProductDTO.images.length === 0) {
      this.imageError = 'Vui lòng chọn ít nhất 1 ảnh';
      return;
    }

    this.isSubmitting = true;

    this.productService.insertProduct(this.insertProductDTO).subscribe({
      next: (apiResponse: ApiResponse) => {
        const productId = apiResponse.data.id;

        this.productService.uploadImages(productId, this.insertProductDTO.images).subscribe({
          next: (uploadResponse) => {
            // Xử lý response sau khi upload ảnh thành công
            const uploadedImages = uploadResponse.data;
            console.log('Ảnh đã upload:', uploadedImages);

            alert('Thêm sản phẩm và ảnh thành công');
            this.router.navigate(['/admin/products']);
          },
          error: (uploadError) => {
            console.error('Lỗi upload ảnh:', uploadError);
            alert('Thêm sản phẩm thành công nhưng upload ảnh thất bại');
            this.router.navigate(['/admin/products']);
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Lỗi thêm sản phẩm:', error);
        alert(`Lỗi: ${error.error?.message || 'Không thể thêm sản phẩm'}`);
      }
    });
  }

  private isFormValid(): boolean {
    return this.insertProductDTO.name.trim() !== '' &&
      this.insertProductDTO.price > 0 &&
      this.insertProductDTO.description.trim() !== '' &&
      this.insertProductDTO.category_id > 0;
  }


  // onFileChange(event: any) {
  //   const files = event.target.files;
  //   if (files.length > 5) {
  //     console.error('Please select a maximum of 5 images.');
  //     return;
  //   }
  //   this.insertProductDTO.images = files;
  // }

  // insertProduct() {
  //   this.productService.insertProduct(this.insertProductDTO).subscribe({
  //     next: (apiResponse: ApiResponse) => {

  //       if (this.insertProductDTO.images.length > 0) {
  //         const productId = apiResponse.data.id;
  //         this.productService.uploadImages(productId, this.insertProductDTO.images).subscribe({
  //           next: (imageResponse: ApiResponse) => {
  //             console.log('Images uploaded successfully:', imageResponse.data);
  //             this.router.navigate(['../'], { relativeTo: this.route });
  //           },
  //           error: (error: HttpErrorResponse) => {
  //             ;
  //             console.error(error?.error?.message ?? '');
  //           }
  //         })
  //       }
  //     },
  //     error: (error: HttpErrorResponse) => {
  //       ;
  //       console.error(error?.error?.message ?? '');
  //     }
  //   });
  // }

  goBack(): void {
    this.location.back();
    // or this.router.navigate(['/admin/products']);
  }
}
