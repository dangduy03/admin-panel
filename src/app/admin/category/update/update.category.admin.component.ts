import { Component, OnInit } from '@angular/core';
import { Category } from '../../../../models/category';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateCategoryDTO } from '../../../../dtos/category/update.category.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../../service/category.service';
import { ApiResponse } from '../../../../reponses/api.response';

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
    // Implement your update logic here
    const updateCategoryDTO: UpdateCategoryDTO = {
      name: this.updatedCategory.name,      
    };
    this.categoryService.updateCategory(this.updatedCategory.id, updateCategoryDTO).subscribe({
      next: (response: any) => {  
                
      },
      complete: () => {
        ;
        this.router.navigate(['/admin/categories']);        
      },
      error: (error: HttpErrorResponse) => {
        ;
        console.error(error?.error?.message ?? '');
      } 
    });  
  }  
}
