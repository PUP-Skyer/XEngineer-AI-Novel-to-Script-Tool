import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('rooms')
  @ApiOperation({ summary: '创建游戏房间' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createRoom(
    @CurrentUser() user: JwtPayload,
    @Body() body: { scriptId: number; maxPlayers?: number; withAi?: boolean },
  ) {
    return this.gameService.createRoom(user.sub, body);
  }

  @Get('rooms/:code')
  @ApiOperation({ summary: '获取房间信息' })
  async getRoom(@Param('code') code: string) {
    return this.gameService.getRoom(code);
  }

  @Post('rooms/:code/join')
  @ApiOperation({ summary: '加入房间' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.gameService.joinRoom(user.sub, code);
  }

  @Post('rooms/:code/start')
  @ApiOperation({ summary: '开始游戏' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async startGame(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.gameService.startGame(user.sub, code);
  }

  @Post('single/:scriptId')
  @ApiOperation({ summary: '创建单人游戏 (AI 对手)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createSinglePlayer(
    @CurrentUser() user: JwtPayload,
    @Param('scriptId', ParseIntPipe) scriptId: number,
  ) {
    return this.gameService.createSinglePlayerGame(user.sub, scriptId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取游戏历史记录' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.gameService.getGameHistory(user.sub);
  }
}
