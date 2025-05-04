import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../environments/environment';
import { HttpUtilService } from './http.util.service';
import { UserResponse } from '../reponses/user/user.response';
import { DOCUMENT } from '@angular/common';
import { ApiResponse } from '../reponses/api.response';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;

  private http = inject(HttpClient);
  private httpUtilService = inject(HttpUtilService);
  private tokenService = inject(TokenService);

  localStorage?: Storage;

  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  };

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }

  register(registerDTO: RegisterDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      this.apiRegister,
      registerDTO,
      this.apiConfig
    );
  }

  login(loginDTO: LoginDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiLogin, loginDTO, this.apiConfig);
  }

  getUserDetail(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUserDetail, null, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  updateUserDetail(
    token: string,
    updateUserDTO: UpdateUserDTO
  ): Observable<ApiResponse> {
    let userResponse = this.getUserResponseFromLocalStorage();
    return this.http.put<ApiResponse>(
      `${this.apiUserDetail}/${userResponse?.id}`,
      updateUserDTO,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      }
    );
  }

  saveUserResponseToLocalStorage(userResponse?: UserResponse) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }
      // Convert the userResponse object to a JSON string
      const userResponseJSON = JSON.stringify(userResponse);
      // Save the JSON string to local storage with a key (e.g., "userResponse")
      this.localStorage?.setItem('user', userResponseJSON);
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }

  getUserResponseFromLocalStorage(): UserResponse | null {
    try {
      const userResponseJSON = this.localStorage?.getItem('user');
      if (userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      const userResponse = JSON.parse(userResponseJSON!);
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error(
        'Error retrieving user response from local storage:',
        error
      );
      return null;
    }
  }

  removeUserFromLocalStorage(): void {
    try {
      this.localStorage?.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
    }
  }

  getUsers(params: {
    page: number;
    limit: number;
    keyword: string;
  }): Observable<ApiResponse> {
    const token = this.tokenService.getToken(); // Use TokenService to get token

    if (!token) {
      // Handle case when token is not available
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const url = `${environment.apiBaseUrl}/users`;
    return this.http.get<ApiResponse>(url, {
      headers: headers,
      params: params
    });
  }

  // resetPassword(userId: number): Observable<ApiResponse> {
  //   const url = `${environment.apiBaseUrl}/users/reset-password/${userId}`;
  //   return this.http.put<ApiResponse>(url, null, this.apiConfig);
  // }
  resetPassword(userId: number): Observable<ApiResponse> {
    const token = this.tokenService.getToken(); // Lấy token từ TokenService

    if (!token) {
      return throwError(() => new Error('Không tìm thấy token xác thực'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const url = `${environment.apiBaseUrl}/users/reset-password/${userId}`;
    return this.http.put<ApiResponse>(url, null, { headers });
  }

  // toggleUserStatus(params: {
  //   userId: number;
  //   enable: boolean;
  // }): Observable<ApiResponse> {
  //   const url = `${environment.apiBaseUrl}/users/block/${params.userId}/${params.enable ? '1' : '0'
  //     }`;
  //   return this.http.put<ApiResponse>(url, null, this.apiConfig);
  // }
  toggleUserStatus(params: {
    userId: number;
    enable: boolean;
  }): Observable<ApiResponse> {
    const token = this.tokenService.getToken(); // Lấy token từ TokenService

    if (!token) {
      return throwError(() => new Error('Không tìm thấy token xác thực'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Thêm header Authorization
    });

    const url = `${environment.apiBaseUrl}/users/block/${params.userId}/${params.enable ? '1' : '0'}`;
    return this.http.put<ApiResponse>(url, null, { headers });
  }
}
