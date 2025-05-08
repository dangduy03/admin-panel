import { Component, OnInit } from '@angular/core';
import { CommentService } from '../../../service/comment.service';
import { ApiResponse } from '../../../reponses/api.response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Comment } from '../../../models/comment';

@Component({
  selector: 'app-comment-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './comment-admin.component.html',
  styleUrl: './comment-admin.component.scss'
})
export class CommentAdminComponent implements OnInit {
  comments: Comment[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  visiblePages: number[] = [];
  searchKeyword: string = '';
  selectedComment: Comment | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor
    (
      private commentService: CommentService,
      private router: Router,
    ) { }

  ngOnInit(): void {
    this.getAllComments(this.currentPage, this.itemsPerPage);
  }

  // getAllComments(page: number, limit: number) {
  //   this.commentService.getAllComments(page, limit).subscribe({
  //     next: (response: any) => {
  //       console.log('Raw API response:', response);

  //       // Xử lý nhiều định dạng response có thể có
  //       if (Array.isArray(response)) {
  //         this.comments = response;
  //         this.totalPages = 1;
  //       } else if (response?.data) {
  //         this.comments = response.data;
  //         this.totalPages = response.meta?.totalPages || 1;
  //       } else {
  //         this.comments = [];
  //         console.error('Unexpected response format:', response);
  //       }

  //       this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
  //     },
  //     error: (error) => {
  //       console.error('Error details:', {
  //         status: error.status,
  //         message: error.message,
  //         url: error.url,
  //         error: error.error
  //       });
  //       alert('Error loading data. Please check console for details.');
  //     }
  //   });
  // }


  getAllComments(page: number, limit: number) {
    this.isLoading = true;
    this.commentService.getAllComments(page, limit).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Xử lý dữ liệu an toàn hơn
        let commentsData = [];
        if (Array.isArray(response)) {
          commentsData = response;
          this.totalPages = 1;
        } else if (response?.data) {
          commentsData = response.data;
          this.totalPages = response.meta?.totalPages || 1;
        }
  
        // Đảm bảo mỗi comment có đủ thuộc tính cần thiết
        this.comments = commentsData.map((comment: any) => ({
          id: comment.id || 0,
          content: comment.content || '',
          user: comment.user || { fullname: 'Nguyễn Quảng' },
          product: comment.product || { name: 'Không xác định' }
        }));
  
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Lỗi:', error);
        alert('Có lỗi khi tải dữ liệu. Vui lòng kiểm tra console để biết chi tiết.');
      }
    });
  }
  deleteComment(comment: Comment) {
      if (confirm(`Delete inventory for ${comment.user?.fullname}?`)) {
        this.isLoading = true;
        this.commentService.deleteComment(comment.id).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== comment.id);
            alert('Inventory deleted successfully');
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete inventory';
            console.error('Error deleting inventory:', error);
            this.isLoading = false;
          }
        });
      }
    }

  selectComment(comment: Comment): void {
    this.selectedComment = comment;
  }

  closeModal(): void {
    this.selectedComment = null;
  }
  searchComments() {
    this.currentPage = 1;
    this.getAllComments(this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllComments(this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
