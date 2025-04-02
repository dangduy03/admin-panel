import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../reponses/api.response';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiGetRoles = `${environment.apiBaseUrl}/roles`;

  constructor(private http: HttpClient) {}
  getRoles(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiGetRoles);
  }
}
