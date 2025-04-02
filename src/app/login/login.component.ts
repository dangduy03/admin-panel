import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { LoginDTO } from '../../dtos/user/login.dto';
import { UserService } from '../../service/user.service';
import { TokenService } from '../../service/token.service';
import { UserResponse } from '../../reponses/user/user.response';
import { ApiResponse } from '../../reponses/api.response';
import { RoleService } from '../../service/role.service';
import { Role } from '../../models/role';
import { CartService } from '../../service/cart.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})

export class LoginComponent implements OnInit {
  roles: Role[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; // Role được chọn
  userResponse?: UserResponse
  localStorage?: Storage;

  loginForm = new FormGroup({
    phoneNumberOrEmail: new FormControl<string>('admin@gmail.com', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl<string>('111222333', [Validators.required]),
    role: new FormControl<string | null>(null, Validators.required), // Thêm role vào form
  });

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    // private toastService: ToastService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.roleService.getRoles().subscribe({     // Gọi API để lấy danh sách roles
      next: (apiResponse: ApiResponse) => {
        const roles = apiResponse.data
        this.roles = roles;
        this.selectedRole = this.roles.length > 0 ? this.roles[0] : undefined;
        this.loginForm.controls['role'].setValue(this.selectedRole?.id?.toString() ?? null); // Gán giá trị mặc định
      },
      error: (error: HttpErrorResponse) => {
        console.error(error?.error?.message ?? 'Error fetching roles');
      },
    });
  }

  onLoginFormSubmit() {
    if (this.loginForm.valid) {
      const loginDTO: LoginDTO = {
        phoneNumberOrEmail: this.loginForm.value.phoneNumberOrEmail!,
        password: this.loginForm.value.password!,
        role_id: this.selectedRole?.id ?? 1,
      };

      this.userService.login(loginDTO).subscribe({
        next: (apiResponse: ApiResponse) => {
          if (apiResponse.status == 'OK') {
            // debugger;
            const { token } = apiResponse.data;
            if (this.rememberMe) {
              this.tokenService.setToken(token);
              // debugger;
              this.userService.getUserDetail(token).subscribe({
                next: (apiResponse2: ApiResponse) => {
                  this.userResponse = {
                    ...apiResponse2.data,
                    date_of_birth: new Date(apiResponse2.data.date_of_birth),
                  };
                  this.userService.saveUserResponseToLocalStorage(this.userResponse);
                  if (this.userResponse?.role.name == 'admin') {
                    this.router.navigate(['/admin']);
                  // } else if(this.userResponse?.role.name == 'user') {
                  //   this.router.navigate(['/']);
                  }
                },
                complete: () => {
                  this.cartService.refreshCart();
                },
                error: (error: HttpErrorResponse) => {
                  console.error(error?.error?.message ?? 'Error fetching user details');
                },
              });
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          // this.toastService.showToastMessage(
          //   ToastSeverityEnum.ERROR,
          //   'Login error',
          //   'Email/PhoneNumber or password is incorrect'
          // );
          console.error(error?.error?.message ?? 'Login error');
        },
      });
    }
  }

}
