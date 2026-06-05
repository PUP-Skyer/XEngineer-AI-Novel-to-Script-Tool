import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
// @ts-ignore - socket.io types provided by @nestjs/platform-socket.io
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { RoomManager } from './room/room-manager';
import { GameEngine } from './engine/game-engine';
import { GameEventType } from '../../common/interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly roomManager: RoomManager,
    private readonly gameEngine: GameEngine,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // 处理玩家离线
    const roomCode = this.roomManager.getPlayerRoom(client.id);
    if (roomCode) {
      this.roomManager.removePlayerBySocket(client.id);
      this.server.to(roomCode).emit(GameEventType.LEAVE_ROOM, {
        message: '玩家已离开',
        socketId: client.id,
      });
    }
  }

  @SubscribeMessage(GameEventType.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; userId: number },
  ) {
    const { roomCode, userId } = data;

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      client.emit(GameEventType.ERROR, { message: '房间不存在' });
      return;
    }

    // 加入 Socket.IO 房间
    client.join(roomCode);

    // 记录 socket 和房间的映射
    this.roomManager.setPlayerSocket(userId, client.id, roomCode);

    // 广播加入事件
    this.server.to(roomCode).emit(GameEventType.JOIN_ROOM, {
      message: '玩家已加入',
      userId,
      playerCount: room.players.length,
      players: room.players,
    });

    this.logger.log(`Player ${userId} joined room ${roomCode}`);
  }

  @SubscribeMessage(GameEventType.PLAYER_SPEAK)
  handlePlayerSpeak(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      userId: number;
      content: string;
      characterId?: string;
    },
  ) {
    const { roomCode, userId, content, characterId } = data;

    const room = this.roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') {
      client.emit(GameEventType.ERROR, { message: '游戏未进行中' });
      return;
    }

    // 广播玩家发言
    this.server.to(roomCode).emit(GameEventType.PLAYER_SPEAK, {
      userId,
      characterId,
      content,
      timestamp: Date.now(),
    });

    // 记录游戏日志
    this.gameService.addGameLog(roomCode, {
      type: 'speak',
      userId,
      content,
      metadata: { characterId },
    });
  }

  @SubscribeMessage(GameEventType.PLAYER_CHOOSE)
  handlePlayerChoose(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      userId: number;
      choiceId: string;
      metadata?: any;
    },
  ) {
    const { roomCode, userId, choiceId, metadata } = data;

    const room = this.roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') {
      client.emit(GameEventType.ERROR, { message: '游戏未进行中' });
      return;
    }

    // 处理玩家选择
    const result = this.gameEngine.processChoice(room, userId, choiceId, metadata);

    // 广播选择结果
    this.server.to(roomCode).emit(GameEventType.PLAYER_CHOOSE, {
      userId,
      choiceId,
      result,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage(GameEventType.ACCUSATION)
  handleAccusation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      userId: number;
      targetUserId: number;
      reason: string;
    },
  ) {
    const { roomCode, userId, targetUserId, reason } = data;

    // 广播指控
    this.server.to(roomCode).emit(GameEventType.ACCUSATION, {
      userId,
      targetUserId,
      reason,
      timestamp: Date.now(),
    });

    this.gameService.addGameLog(roomCode, {
      type: 'accusation',
      userId,
      content: `指控了另一名玩家: ${reason}`,
      metadata: { targetUserId, reason },
    });
  }

  @SubscribeMessage(GameEventType.VOTE)
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      userId: number;
      targetUserId: number;
    },
  ) {
    const { roomCode, userId, targetUserId } = data;

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      client.emit(GameEventType.ERROR, { message: '房间不存在' });
      return;
    }

    // 记录投票
    this.gameEngine.recordVote(room, userId, targetUserId);

    // 检查是否所有人都已投票
    if (this.gameEngine.allVoted(room)) {
      const voteResult = this.gameEngine.countVotes(room);

      // 广播投票结果
      this.server.to(roomCode).emit(GameEventType.VOTE, {
        voteResult,
        timestamp: Date.now(),
      });

      // 判断游戏结果
      const gameResult = this.gameEngine.determineWinner(room, voteResult);

      this.server.to(roomCode).emit(GameEventType.GAME_END, {
        result: gameResult,
        timestamp: Date.now(),
      });

      this.roomManager.updateRoomStatus(roomCode, 'ended');
    } else {
      // 广播投票进度
      this.server.to(roomCode).emit(GameEventType.VOTE, {
        message: '有玩家投出了选票',
        votedCount: this.gameEngine.getVotedCount(room),
        totalPlayers: room.players.length,
        timestamp: Date.now(),
      });
    }
  }

  // 房主切换场景
  @SubscribeMessage('next_scene')
  handleNextScene(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; userId: number },
  ) {
    const { roomCode, userId } = data;

    const room = this.roomManager.getRoom(roomCode);
    if (!room || room.hostId !== userId) {
      client.emit(GameEventType.ERROR, { message: '只有房主可以切换场景' });
      return;
    }

    const nextScene = this.gameEngine.moveToNextScene(room);

    if (nextScene) {
      this.server.to(roomCode).emit(GameEventType.SCENE_CHANGE, {
        scene: nextScene,
        timestamp: Date.now(),
      });
    } else {
      // 所有场景已结束，进入投票阶段
      this.server.to(roomCode).emit(GameEventType.PHASE_CHANGE, {
        phase: 'voting',
        timestamp: Date.now(),
      });
    }
  }

  // 推送事件到指定房间
  emitToRoom(roomCode: string, event: string, data: any) {
    this.server.to(roomCode).emit(event, data);
  }
}
