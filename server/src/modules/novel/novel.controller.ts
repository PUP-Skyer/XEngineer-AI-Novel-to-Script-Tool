import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NovelService } from './novel.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { GenerateNovelDto } from './dto/generate-novel.dto';
import { QueryNovelDto } from './dto/query-novel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('novel')
@Controller('novel')
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @Get()
  @ApiOperation({ summary: '获取小说列表' })
  async findAll(@Query() query: QueryNovelDto) {
    return this.novelService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取小说详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const novel = await this.novelService.findById(id);
    if (!novel) {
      throw new NotFoundException('小说不存在');
    }
    return novel;
  }

  @Post()
  @ApiOperation({ summary: '创建小说' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateNovelDto,
  ) {
    return this.novelService.create(user.sub, dto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'AI 生成小说' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async generate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateNovelDto,
  ) {
    return this.novelService.generate(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新小说' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateNovelDto>,
  ) {
    return this.novelService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除小说' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.novelService.remove(user.sub, id);
  }
}
