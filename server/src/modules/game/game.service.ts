import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();

import { GameSession } from './entities/game-session.entity';
import { GameLog } from './entities/game-log.entity';
import { RoomManager } from './room/room-manager';
import { GameEngine } from './engine/game-engine';
import { ScriptService } from '../script/script.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameSession)
    private readonly sessionRepository: Repository<GameSession>,
    @InjectRepository(GameLog)
    private readonly logRepository: Repository<GameLog>,
    private readonly roomManager: RoomManager,
    private readonly gameEngine: GameEngine,
    private readonly scriptService: ScriptService,
  ) {}

  async createRoom(
    userId: number,
    body: { scriptId: number; maxPlayers?: number; withAi?: boolean },
  ) {
    const script = await this.scriptService.findById(body.scriptId);

    const code = this.generateRoomCode();

    // 创建房间
    const room = this.roomManager.createRoom({
      code,
      hostId: userId,
      scriptId: body.scriptId,
      maxPlayers: body.maxPlayers || script.playerCountMax,
      withAi: body.withAi || false,
      players: [{ userId, characterId: null, isHost: true, isReady: false }],
    });

    // 创建数据库记录
    const session = this.sessionRepository.create({
      roomCode: code,
      hostId: userId,
      scriptId: body.scriptId,
      maxPlayers: room.maxPlayers,
      status: 'waiting',
    });

    await this.sessionRepository.save(session);

    return {
      code,
      hostId: userId,
      script: {
        id: script.id,
        title: script.title,
        playerCountMin: script.playerCountMin,
        playerCountMax: script.playerCountMax,
      },
      maxPlayers: room.maxPlayers,
      players: room.players,
      withAi: room.withAi,
    };
  }

  async getRoom(code: string) {
    const room = this.roomManager.getRoom(code);
    if (!room) {
      throw new NotFoundException('房间不存在或已关闭');
    }
    return room;
  }

  async joinRoom(userId: number, code: string) {
    const room = this.roomManager.getRoom(code);
    if (!room) {
      throw new NotFoundException('房间不存在或已关闭');
    }

    if (room.status !== 'waiting') {
      throw new BadRequestException('游戏已开始，无法加入');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new BadRequestException('房间已满');
    }

    // 检查是否已在房间中
    const existingPlayer = room.players.find((p) => p.userId === userId);
    if (existingPlayer) {
      throw new BadRequestException('你已在房间中');
    }

    this.roomManager.addPlayer(code, {
      userId,
      characterId: null,
      isHost: false,
      isReady: false,
    });

    return this.roomManager.getRoom(code);
  }

  async startGame(userId: number, code: string) {
    const room = this.roomManager.getRoom(code);
    if (!room) {
      throw new NotFoundException('房间不存在');
    }

    if (room.hostId !== userId) {
      throw new ForbiddenException('只有房主可以开始游戏');
    }

    if (room.players.length < 2) {
      throw new BadRequestException('至少需要2名玩家');
    }

    // 获取剧本
    const script = await this.scriptService.findById(room.scriptId);

    // 分配角色
    this.gameEngine.assignCharacters(room, script);

    // 更新状态
    this.roomManager.updateRoomStatus(code, 'playing');

    // 更新数据库
    await this.sessionRepository.update(
      { roomCode: code },
      { status: 'playing' },
    );

    // 启动游戏引擎
    const initialState = this.gameEngine.initializeGame(room, script);

    return {
      message: '游戏已开始',
      room,
      initialState,
    };
  }

  async createSinglePlayerGame(userId: number, scriptId: number) {
    const script = await this.scriptService.findById(scriptId);

    const code = this.generateRoomCode();

    // 创建单人房间 (带 AI 玩家)
    const aiPlayers = this.generateAiPlayers(script);

    const room = this.roomManager.createRoom({
      code,
      hostId: userId,
      scriptId,
      maxPlayers: script.playerCountMax,
      withAi: true,
      players: [
        { userId, characterId: null, isHost: true, isReady: true },
        ...aiPlayers,
      ],
    });

    // 创建数据库记录
    const session = this.sessionRepository.create({
      roomCode: code,
      hostId: userId,
      scriptId,
      maxPlayers: room.maxPlayers,
      status: 'playing',
      isSinglePlayer: true,
    });

    await this.sessionRepository.save(session);

    // 分配角色并启动游戏
    this.gameEngine.assignCharacters(room, script);
    this.roomManager.updateRoomStatus(code, 'playing');

    const initialState = this.gameEngine.initializeGame(room, script);

    return {
      code,
      room,
      initialState,
    };
  }

  async getGameHistory(userId: number) {
    const sessions = await this.sessionRepository.find({
      where: { hostId: userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return sessions;
  }

  async addGameLog(
    sessionCode: string,
    log: { type: string; userId?: number; content: string; metadata?: any },
  ) {
    const gameLog = this.logRepository.create({
      sessionCode: sessionCode,
      type: log.type,
      userId: log.userId,
      content: log.content,
      metadata: log.metadata ? JSON.stringify(log.metadata) : undefined,
    });

    return this.logRepository.save(gameLog);
  }

  private generateRoomCode(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  private generateAiPlayers(script: any) {
    const aiNames = ['AI-侦探小助手', 'AI-神秘路人', 'AI-热心市民', 'AI-冷静分析师'];
    const aiCount = Math.max(2, script.playerCountMin - 1);

    return Array.from({ length: Math.min(aiCount, 4) }, (_, i) => ({
      userId: -(i + 1), // 负数 ID 表示 AI
      characterId: null,
      isHost: false,
      isReady: true,
      isAi: true,
      aiName: aiNames[i] || `AI-玩家${i + 1}`,
    }));
  }
}
