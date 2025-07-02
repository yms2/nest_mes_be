import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class AdminLoginUserDto {
  @IsNotEmpty()
  @MaxLength(255)
  userId: string;

  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @IsOptional()
  token: string;
}
