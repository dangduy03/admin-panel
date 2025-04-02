import {
    IsString,
    IsNotEmpty,
    IsPhoneNumber
} from 'class-validator'

export class LoginDTO {
  @IsString()
  phoneNumberOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  role_id: number;

  constructor(data: any) {
    this.phoneNumberOrEmail = data.phoneNumberOrEmail;
    this.password = data.password;
    this.role_id = data.role_id
  }
}

