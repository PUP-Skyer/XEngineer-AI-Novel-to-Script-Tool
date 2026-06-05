import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNovelDto {
  @ApiProperty({ description: '小说标题', example: '星辰大海' })
  @IsString()
  @IsNotEmpty({ message: '请输入小说标题' })
  @MaxLength(200, { message: '标题不能超过200字' })
  title!: string;

  @ApiPropertyOptional({ description: '小说简介' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: '简介不能超过2000字' })
  description?: string;

  @ApiPropertyOptional({ description: '小说内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '类型', example: 'fantasy', enum: ['fantasy', 'scifi', 'horror', 'romance', 'mystery', 'historical', 'other'] })
  @IsString()
  @IsNotEmpty()
  genre!: string;

  @ApiPropertyOptional({ description: '标签列表', example: ['冒险', '魔法'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}
