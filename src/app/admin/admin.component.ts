import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { UserResponse } from '../../reponses/user/user.response';
import { UserService } from '../../service/user.service';
import { TokenService } from '../../service/token.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [
    './admin.component.scss',
  ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
})

export class AdminComponent implements OnInit {
  //adminComponent: string = 'orders';
  userResponse?: UserResponse | null;
  private userService = inject(UserService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    // Thêm setTimeout để chắc chắn Router đã cập nhật URL
    setTimeout(() => {
      if (this.router.url === '/admin') {
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  logout() {
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    this.router.navigate(['/']);
  }

  showAdminComponent(componentName: string): void {
    if (componentName === 'orders') {
      this.router.navigate(['/admin/orders']);
    } else if (componentName === 'categories') {
      this.router.navigate(['/admin/categories']);
    } else if (componentName === 'products') {
      this.router.navigate(['/admin/products']);
    } else if (componentName === 'users') {
      this.router.navigate(['/admin/users']);
    } else if (componentName === 'comments') {
      this.router.navigate(['/admin/comments']);
    }else if (componentName === 'stats') {
      this.router.navigate(['/admin/stats']);
    }else if (componentName === 'warehouses') {
      this.router.navigate(['/admin/warehouses']);
    }else if (componentName === 'transactions') {
      this.router.navigate(['/admin/transactions']);
    }else if (componentName === 'inventories') {
      this.router.navigate(['/admin/inventories']);
    }
  }
}


/**
 npm install --save font-awesome
 angular.json:
 "styles": [   
    "node_modules/font-awesome/css/font-awesome.min.css"
],
 */