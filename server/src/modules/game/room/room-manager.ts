import { Injectable, Logger } from '@nestjs/common';

interface PlayerSlot {
  userId: number;
  characterId: string | null;
  isHost: boolean;
  isReady: boolean;
  isAi?: boolean;
  aiName?: string;
  socketId?: string;
}

export interface Room {
  code: string;
  hostId: number;
  scriptId: number;
  maxPlayers: number;
  withAi: boolean;
  status: string;
  players: PlayerSlot[];
  createdAt: number;
}

@Injectable()
export class RoomManager {
  private readonly logger = new Logger(RoomManager.name);

  // 房间存储 (生产环境应使用 Redis)
  private rooms = new Map<string, Room>();

  // Socket 映射: socketId -> { userId, roomCode }
  private socketMap = new Map<string, { userId: number; roomCode: string }>();

  // 用户房间映射: userId -> roomCode
  private userRoomMap = new Map<number, string>();

  createRoom(data: Omit<Room, 'status' | 'createdAt'>): Room {
    const room: Room = {
      ...data,
      status: 'waiting',
      createdAt: Date.now(),
    };

    this.rooms.set(data.code, room);

    // 更新用户映射
    this.userRoomMap.set(data.hostId, data.code);

    this.logger.log(`Room created: ${data.code} by user ${data.hostId}`);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  addPlayer(code: string, player: PlayerSlot): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.players.push(player);
    this.userRoomMap.set(player.userId, code);

    this.logger.log(`Player ${player.userId} added to room ${code}`);
  }

  removePlayer(code: string, userId: number): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.players = room.players.filter((p) => p.userId !== userId);
    this.userRoomMap.delete(userId);

    // 如果房主离开，转移房主
    if (room.hostId === userId && room.players.length > 0) {
      const newHost = room.players.find((p) => !p.isAi) || room.players[0];
      room.hostId = newHost.userId;
      newHost.isHost = true;
    }

    this.logger.log(`Player ${userId} removed from room ${code}`);
  }

  removePlayerBySocket(socketId: string): void {
    const mapping = this.socketMap.get(socketId);
    if (mapping) {
      this.removePlayer(mapping.roomCode, mapping.userId);
      this.socketMap.delete(socketId);
    }
  }

  updateRoomStatus(code: string, status: string): void {
    const room = this.rooms.get(code);
    if (room) {
      room.status = status;
    }
  }

  setPlayerSocket(userId: number, socketId: string, roomCode: string): void {
    this.socketMap.set(socketId, { userId, roomCode });

    // 更新房间中的 socketId
    const room = this.rooms.get(roomCode);
    if (room) {
      const player = room.players.find((p) => p.userId === userId);
      if (player) {
        player.socketId = socketId;
      }
    }
  }

  getPlayerRoom(socketId: string): string | null {
    return this.socketMap.get(socketId)?.roomCode || null;
  }

  destroyRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      // 清除所有玩家映射
      room.players.forEach((p) => {
        this.userRoomMap.delete(p.userId);
      });

      this.rooms.delete(code);
      this.logger.log(`Room destroyed: ${code}`);
    }
  }

  // 获取房间列表
  listRooms(status?: string): Room[] {
    const allRooms = Array.from(this.rooms.values());
    if (status) {
      return allRooms.filter((r) => r.status === status);
    }
    return allRooms;
  }

  // 获取在线玩家数
  getOnlinePlayerCount(): number {
    return this.userRoomMap.size;
  }
}
