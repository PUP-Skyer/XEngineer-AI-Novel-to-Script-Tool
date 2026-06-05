import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AiModelConfig } from './entities/ai-model-config.entity';
import { AiModelService } from './ai-model.service';

@ApiTags('ai-model')
@Controller('ai-model')
export class AiModelConfigController {
  constructor(
    @InjectRepository(AiModelConfig)
    private readonly configRepository: Repository<AiModelConfig>,
    private readonly aiModelService: AiModelService,
  ) {}

  @Get('configs')
  @ApiOperation({ summary: '获取所有 AI 模型配置' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getConfigs() {
    return this.configRepository.find({
      order: { priority: 'ASC' },
    });
  }

  @Post('configs')
  @ApiOperation({ summary: '创建 AI 模型配置' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createConfig(@Body() body: Partial<AiModelConfig>) {
    const config = this.configRepository.create(body);
    return this.configRepository.save(config);
  }

  @Patch('configs/:id')
  @ApiOperation({ summary: '更新 AI 模型配置' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<AiModelConfig>,
  ) {
    await this.configRepository.update(id, body);
    return this.configRepository.findOne({ where: { id } });
  }

  @Get('health')
  @ApiOperation({ summary: '检查 AI 模型健康状态' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async healthCheck() {
    return this.aiModelService.healthCheck();
  }
}
