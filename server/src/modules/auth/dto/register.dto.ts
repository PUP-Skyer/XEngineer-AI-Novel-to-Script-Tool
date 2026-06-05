import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'player1' })
  @IsString()
  @IsNotEmpty({ message: '请输入用户名' })
  @MinLength(3, { message: '用户名长度不能少于3位' })
  @MaxLength(50, { message: '用户名长度不能超过50位' })
  username!: string;

  @ApiProperty({ description: '邮箱', example: 'player1@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '请输入邮箱' })
  email!: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '请输入密码' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password!: string;

  @ApiPropertyOptional({ description: '昵称', example: '小明' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称长度不能超过50位' })
  nickname?: string;
}
