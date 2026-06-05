import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryNovelDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '小说类型', enum: ['fantasy', 'scifi', 'horror', 'romance', 'mystery', 'historical', 'other'] })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: '小说状态', enum: ['draft', 'generated', 'editing', 'published', 'archived'] })
  @IsOptional()
  @IsString()
  status?: string;
}
