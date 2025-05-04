import { Component, OnInit } from '@angular/core';
import { CommentService } from '../../../service/comment.service';
import { ApiResponse } from '../../../reponses/api.response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  comments: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchKeyword: string = '';
  selectedComment: any = null;
  editContent: string = '';

  constructor(private commentService: CommentService) { }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.commentService.getAllComments(params).subscribe({
      next: (response: ApiResponse) => {
        // Xử lý response theo cấu trúc API
        this.comments = response.data?.content || response.data || [];
        this.totalItems = response.data?.totalElements || 0;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        alert('Lỗi khi tải bình luận: ' + (error.error?.message || error.message));
      }
    });
  }



  selectComment(comment: any): void {
    this.selectedComment = comment;
    this.editContent = comment.content;
  }

  updateComment(): void {
    console.log('Editing comment:', this.selectedComment);
    console.log('New content:', this.editContent);

    this.commentService.updateComment(this.selectedComment.id, this.editContent)
      .subscribe({
        next: (res) => {
          console.log('Update success:', res);
          alert('Updated successfully!');
          this.loadComments();
        },
        error: (err) => {
          console.error('Full error:', err);
          console.error('Error response body:', err.error);
          alert(`Error: ${err.status} - ${err.error?.message || 'Unknown error'}`);
        }
      });
  }



  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: (response: ApiResponse) => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
