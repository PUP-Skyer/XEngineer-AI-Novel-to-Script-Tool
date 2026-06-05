import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱', example: 'player1' })
  @IsString()
  @IsNotEmpty({ message: '请输入账号' })
  account!: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '请输入密码' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password!: string;
}
