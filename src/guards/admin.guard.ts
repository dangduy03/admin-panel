import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router'; // Đảm bảo bạn đã import Router ở đây.
import { inject } from '@angular/core';
import { TokenService } from '../service/token.service';
import { UserService } from '../service/user.service';
import { UserResponse } from '../reponses/user/user.response';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  userResponse?: UserResponse | null;
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    const isAdmin = this.userResponse?.role.name == 'admin';

    if (!isTokenExpired && isUserIdValid && isAdmin) {
      return true;
    } else {
      // Nếu không authenticated, bạn có thể redirect hoặc trả về một UrlTree khác.
      // Ví dụ trả về trang login:
      this.router.navigate(['/login']);
      return false;
    }
  }
}

export const AdminGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {

  return inject(AdminGuard).canActivate(next, state);
}
