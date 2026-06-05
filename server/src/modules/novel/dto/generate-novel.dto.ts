import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateNovelDto {
  @ApiProperty({ description: '创作提示词/主题', example: '一个少年在末日世界中寻找失踪妹妹的故事' })
  @IsString()
  @IsNotEmpty({ message: '请输入创作提示词' })
  prompt!: string;

  @ApiProperty({ description: '小说类型', example: 'scifi' })
  @IsString()
  @IsNotEmpty({ message: '请选择小说类型' })
  genre!: string;

  @ApiPropertyOptional({ description: '目标字数', example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(500, { message: '字数至少500字' })
  @Max(100000, { message: '字数不能超过10万字' })
  wordCountTarget?: number;

  @ApiPropertyOptional({ description: '章节数量', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '至少1章' })
  @Max(50, { message: '最多50章' })
  chapterCount?: number;
}
