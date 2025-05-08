import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
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

    getAllComments(page: number, limit: number): Observable<ApiResponse> {
        return this.http.get(this.apiGetAllComments, {
            params: new HttpParams()
                .set('page', page.toString())
                .set('limit', limit.toString()),
            headers: this.getHeaders(),
            observe: 'response'
        }).pipe(
            tap(response => console.log('Full response:', response)),
            map(response => {
                if (!response.body) {
                    throw new Error('Empty response body');
                }
                return response.body as ApiResponse;
            }),
            catchError(error => {
                console.error('API Error:', {
                    status: error.status,
                    message: error.message,
                    url: error.url,
                    headers: error.headers,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }


    deleteComment(commentId: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(
            `${this.apiUrl}/${commentId}`,
            { headers: this.getHeaders() }
        ).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            // Xử lý khi token hết hạn
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
        }
        return throwError(() => error);
    }


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
