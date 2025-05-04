import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../reponses/api.response';
import { TokenService } from './token.service';
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = `${environment.apiBaseUrl}/comments`;
    private apiGetAllComments = `${environment.apiBaseUrl}/comments/getallcomment`;

    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router,
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        if (!token) {
            this.router.navigate(['/login']); // Redirect if no token
            throw new Error('No token available');
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    getCommentsByProduct(productId: number): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.apiUrl}?product_id=${productId}`,
            {
                headers: this.getHeaders() // Thêm headers xác thực
            }
        );
    }

    addComment(productId: number, userId: number, content: string): Observable<ApiResponse> {
        const commentDTO = {
            product_id: productId,
            user_id: userId,
            content: content
        };
        return this.http.post<ApiResponse>(this.apiUrl, commentDTO, {
            headers: this.getHeaders() // Thêm headers xác thực
        });
    }

    getAllComments(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Observable<ApiResponse> {
        // Thiết lập params mặc định
        const defaultParams = {
            page: params?.page ?? 0,  // API của bạn bắt đầu từ page 0
            limit: params?.limit ?? 10
        };

        // Thêm search nếu có
        const requestParams = params?.search
            ? { ...defaultParams, search: params.search }
            : defaultParams;

        return this.http.get<ApiResponse>(this.apiGetAllComments, {
            headers: this.getHeaders(),
            params: requestParams
        }).pipe(
            catchError(error => {
                console.error('Error fetching comments:', error);
                return throwError(() => error);
            })
        );
    }

    // Xóa comment
    deleteComment(commentId: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(
            `${this.apiUrl}/${commentId}`,
            { headers: this.getHeaders() }
        );
    }

    // Cập nhật nội dung comment
    // updateComment(commentId: number, content: string): Observable<ApiResponse> {
    //     return this.http.put<ApiResponse>(
    //         `${this.apiUrl}/${commentId}`,
    //         { content },
    //         { headers: this.getHeaders() }
    //     );
    // }

    // updateComment(commentId: number, content: string): Observable<ApiResponse> {
    //     const updateData = {
    //         content: content
    //         // Thêm các trường khác nếu API yêu cầu
    //     };

    //     return this.http.put<ApiResponse>(
    //         `${this.apiUrl}/${commentId}`,
    //         updateData,
    //         {
    //             headers: this.getHeaders()
    //         }
    //     ).pipe(
    //         catchError(error => {
    //             console.error('Update comment error:', error);
    //             return throwError(() => error);
    //         })
    //     );
    // }

    updateComment(commentId: number, content: string): Observable<ApiResponse> {
        // Thử nghiệm với các format data khác nhau
        const testPayloads = [
            { content: content },
            { id: commentId, content: content },
            { commentId: commentId, commentContent: content }
        ];

        // Thử lần lượt các payload
        return this.http.put<ApiResponse>(
            `${this.apiUrl}/${commentId}`,
            testPayloads[0], // Thay đổi index để test
            {
                headers: this.getHeaders()
            }
        );
    }
}
