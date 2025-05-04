import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Product } from '../../../../models/product';
import { Category } from '../../../../models/category';
import { environment } from '../../../../environments/environment';
import { ProductImage } from '../../../../models/product.image';
import { UpdateProductDTO } from '../../../../dtos/product/update.product.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../../service/product.service';
import { CategoryService } from '../../../../service/category.service';
import { ApiResponse } from '../../../../reponses/api.response';
import { TokenService } from '../../../../service/token.service';

@Component({
  selector: 'app-detail.product.admin',
  templateUrl: './update.product.admin.component.html',
  styleUrls: ['./update.product.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class UpdateProductAdminComponent implements OnInit {
  productId: number;
  product: Product;
  updatedProduct: Product;
  categories: Category[] = []; // Dữ liệu động từ categoryService
  currentImageIndex: number = 0;
  images: File[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private location: Location,
    private tokenService: TokenService,
  ) {
    this.productId = 0;
    this.product = {} as Product;
    this.updatedProduct = {} as Product;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = Number(params.get('id'));
      this.getProductDetails();
    });
    this.getCategories(1, 100);
  }

  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (apiResponse: ApiResponse) => {
        this.categories = apiResponse.data;
      },
      complete: () => { },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? '');
      },
    });
  }

  // getProductDetails(): void {
  //   this.productService.getDetailProduct(this.productId).subscribe({
  //     next: (apiResponse: ApiResponse) => {
  //       this.product = apiResponse.data;
  //       this.updatedProduct = { ...apiResponse.data };
  //       this.updatedProduct.product_images.forEach(
  //         (product_image: ProductImage) => {
  //           product_image.image_url = `${environment.minioUrl}/${product_image.image_url}`;
  //         }
  //       );
  //     },
  //     complete: () => { },
  //     error: (error: HttpErrorResponse) => {
  //       console.error(error?.error?.message ?? '');
  //     },
  //   });
  // }
  getProductDetails(): void {
    this.productService.getDetailProduct(this.productId).subscribe({
      next: (apiResponse: ApiResponse) => {
        this.product = apiResponse.data;
        this.updatedProduct = { ...this.product };

        // Xử lý URL ảnh
        this.product.product_images.forEach((img: ProductImage) => {
          // Kiểm tra xem URL đã có domain chưa
          if (!img.image_url.startsWith('http')) {
            img.image_url = `${environment.minioUrl}/${img.image_url}`;
          }
        });
      },
      complete: () => { },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading product:', error);
      }
    });
  }

  updateProduct() {
    // Implement your update logic here
    const updateProductDTO: UpdateProductDTO = {
      name: this.updatedProduct.name,
      price: this.updatedProduct.price,
      description: this.updatedProduct.description,
      category_id: this.updatedProduct.category_id,
    };
    this.productService
      .updateProduct(this.product.id, updateProductDTO)
      .subscribe({
        next: (apiResponse: ApiResponse) => { },
        complete: () => {
          this.router.navigate(['/admin/products']);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        },
      });
  }

  showImage(index: number): void {
    if (
      this.product &&
      this.product.product_images &&
      this.product.product_images.length > 0
    ) {
      // Đảm bảo index nằm trong khoảng hợp lệ
      if (index < 0) {
        index = 0;
      } else if (index >= this.product.product_images.length) {
        index = this.product.product_images.length - 1;
      }
      // Gán index hiện tại và cập nhật ảnh hiển thị
      this.currentImageIndex = index;
    }
  }

  thumbnailClick(index: number) {
    // Gọi khi một thumbnail được bấm
    this.currentImageIndex = index; // Cập nhật currentImageIndex
  }

  nextImage(): void {
    this.showImage(this.currentImageIndex + 1);
  }

  previousImage(): void {
    this.showImage(this.currentImageIndex - 1);
  }

  // onFileChange(event: any) {
  //   const files = event.target.files;
  //   if (files.length > 5) {
  //     console.error('Please select a maximum of 5 images.');
  //     return;
  //   }
  //   this.images = files;
  //   this.productService.uploadImages(this.productId, this.images).subscribe({
  //     next: (apiResponse: ApiResponse) => {
  //       console.log('Images uploaded successfully:', apiResponse);
  //       this.images = [];
  //       this.getProductDetails();
  //     },
  //     error: (error: HttpErrorResponse) => {
  //       console.error(error?.error?.message ?? '');
  //     },
  //   });
  // }

  onFileChange(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    for (let i = 0; i < files.length; i++) {
      if (!validTypes.includes(files[i].type)) {
        alert('Only JPEG, PNG and GIF images are allowed');
        return;
      }
    }

    this.productService.uploadImages(this.productId, Array.from(files)).subscribe({
      next: (response) => {
        console.log('Upload successful', response);
        this.getProductDetails(); // Refresh danh sách ảnh
        event.target.value = ''; // Reset input file
      },
      error: (error) => {
        console.error('Upload failed', error);
        alert(`Upload failed: ${error.error?.message || error.message}`);
      }
    });
  }

  

  deleteImage(productImage: ProductImage) {
    if (!this.tokenService.getToken()) {
      alert('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    if (confirm('Are you sure you want to remove this image?')) {
      // Call the removeImage() method to remove the image
      this.productService.deleteProductImage(productImage.id).subscribe({
        // next: (productImage: ProductImage) => {
        //   location.reload();
        // },
        next: () => {
          this.getProductDetails(); // Load lại thay vì reload trang
        },
        error: (error) => {
          if (error.status === 401) {
            alert('Session expired. Please login again.');
            this.router.navigate(['/login']);
          } else {
            console.error('Error deleting image:', error);
          }
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
    // or this.router.navigate(['/admin/products']);
  }
}
