import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScriptService } from './script.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('script')
@Controller('script')
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) {}

  @Post('convert/:novelId')
  @ApiOperation({ summary: '将小说转换为剧本' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async convert(
    @CurrentUser() user: JwtPayload,
    @Param('novelId', ParseIntPipe) novelId: number,
  ) {
    return this.scriptService.convertFromNovel(user.sub, novelId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取剧本详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const script = await this.scriptService.findById(id);
    if (!script) {
      throw new NotFoundException('剧本不存在');
    }
    return script;
  }

  @Get(':id/yaml')
  @ApiOperation({ summary: '获取剧本 YAML 内容' })
  async getYaml(@Param('id', ParseIntPipe) id: number) {
    return this.scriptService.getYamlContent(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新剧本' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; yamlContent?: string },
  ) {
    return this.scriptService.update(user.sub, id, body);
  }

  @Get(':id/characters')
  @ApiOperation({ summary: '获取剧本角色列表' })
  async getCharacters(@Param('id', ParseIntPipe) id: number) {
    return this.scriptService.getCharacters(id);
  }

  @Get(':id/scenes')
  @ApiOperation({ summary: '获取剧本场景列表' })
  async getScenes(@Param('id', ParseIntPipe) id: number) {
    return this.scriptService.getScenes(id);
  }
}
