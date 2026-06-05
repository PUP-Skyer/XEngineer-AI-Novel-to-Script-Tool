import { Injectable, Logger } from '@nestjs/common';
import { GamePhase, GameEventType } from '../../../common/interfaces';

interface RoomData {
  code: string;
  hostId: number;
  scriptId: number;
  maxPlayers: number;
  withAi: boolean;
  status: string;
  players: PlayerData[];
}

interface PlayerData {
  userId: number;
  characterId: string | null;
  isHost: boolean;
  isReady: boolean;
  isAi?: boolean;
  aiName?: string;
}

interface ScriptData {
  id: number;
  characters: any[];
  scenes: any[];
}

interface GameState {
  currentPhase: GamePhase;
  currentSceneIndex: number;
  currentTurn: number;
  votes: Map<number, number>;
  choices: Map<number, any>;
  logs: any[];
}

@Injectable()
export class GameEngine {
  private readonly logger = new Logger(GameEngine.name);

  // 存储游戏状态 (生产环境应使用 Redis)
  private gameStates = new Map<string, GameState>();

  assignCharacters(room: RoomData, script: ScriptData): void {
    const characters = script.characters;

    // 随机打乱角色列表
    const shuffled = [...characters].sort(() => Math.random() - 0.5);

    // 为每个玩家分配角色
    const humanPlayers = room.players.filter((p) => !p.isAi);
    humanPlayers.forEach((player, index) => {
      if (index < shuffled.length) {
        player.characterId = shuffled[index].charId || shuffled[index].id;
      }
    });

    // 为 AI 玩家分配剩余角色
    const aiPlayers = room.players.filter((p) => p.isAi);
    aiPlayers.forEach((player, index) => {
      const remainingIndex = humanPlayers.length + index;
      if (remainingIndex < shuffled.length) {
        player.characterId = shuffled[remainingIndex].charId || shuffled[remainingIndex].id;
      }
    });
  }

  initializeGame(room: RoomData, script: ScriptData): any {
    const state: GameState = {
      currentPhase: GamePhase.INTRO,
      currentSceneIndex: 0,
      currentTurn: 0,
      votes: new Map(),
      choices: new Map(),
      logs: [],
    };

    this.gameStates.set(room.code, state);

    // 返回初始游戏状态
    return {
      phase: state.currentPhase,
      scene: script.scenes[0] || null,
      playerCharacters: room.players.map((p) => ({
        userId: p.userId,
        characterId: p.characterId,
        isAi: p.isAi,
      })),
      totalScenes: script.scenes.length,
    };
  }

  processChoice(
    room: RoomData,
    userId: number,
    choiceId: string,
    metadata?: any,
  ): any {
    const state = this.gameStates.get(room.code);
    if (!state) return null;

    state.choices.set(userId, { choiceId, metadata, timestamp: Date.now() });

    return {
      choiceId,
      accepted: true,
      playerChoices: Array.from(state.choices.entries()).map(([uid, choice]) => ({
        userId: uid,
        choiceId: choice.choiceId,
      })),
    };
  }

  moveToNextScene(room: RoomData): any | null {
    const state = this.gameStates.get(room.code);
    if (!state) return null;

    state.currentSceneIndex++;
    state.currentTurn++;

    // 这里应该从数据库或缓存中获取场景数据
    // 简化实现：返回索引
    return {
      sceneIndex: state.currentSceneIndex,
      turn: state.currentTurn,
    };
  }

  recordVote(room: RoomData, voterId: number, targetUserId: number): void {
    const state = this.gameStates.get(room.code);
    if (state) {
      state.votes.set(voterId, targetUserId);
    }
  }

  allVoted(room: RoomData): boolean {
    const state = this.gameStates.get(room.code);
    if (!state) return false;

    const humanPlayers = room.players.filter((p) => !p.isAi);
    return state.votes.size >= humanPlayers.length;
  }

  getVotedCount(room: RoomData): number {
    const state = this.gameStates.get(room.code);
    return state ? state.votes.size : 0;
  }

  countVotes(
    room: RoomData,
  ): { targetUserId: number; votes: number }[] {
    const state = this.gameStates.get(room.code);
    if (!state) return [];

    const voteCounts = new Map<number, number>();

    state.votes.forEach((targetId) => {
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    });

    return Array.from(voteCounts.entries())
      .map(([targetUserId, votes]) => ({ targetUserId, votes }))
      .sort((a, b) => b.votes - a.votes);
  }

  determineWinner(
    room: RoomData,
    voteResult: { targetUserId: number; votes: number }[],
  ): { winner: string; reason: string; revealedCharacters: any[] } {
    if (voteResult.length === 0) {
      return {
        winner: 'no_one',
        reason: '没有人被投票出局',
        revealedCharacters: [],
      };
    }

    const topVoted = voteResult[0];
    const targetPlayer = room.players.find((p) => p.userId === topVoted.targetUserId);

    if (!targetPlayer) {
      return {
        winner: 'unknown',
        reason: '目标玩家不存在',
        revealedCharacters: [],
      };
    }

    // 简化判定: 被投票最多的人如果是凶手，则好人赢，否则凶手赢
    const isKiller = this.isKillerPlayer(room, topVoted.targetUserId);

    if (isKiller) {
      return {
        winner: 'good',
        reason: `玩家被成功投票出局，好阵营获胜！`,
        revealedCharacters: room.players.map((p) => ({
          userId: p.userId,
          characterId: p.characterId,
          isKiller: this.isKillerPlayer(room, p.userId),
        })),
      };
    } else {
      return {
        winner: 'killer',
        reason: `投票出局的不是凶手，凶手阵营获胜！`,
        revealedCharacters: room.players.map((p) => ({
          userId: p.userId,
          characterId: p.characterId,
          isKiller: this.isKillerPlayer(room, p.userId),
        })),
      };
    }
  }

  private isKillerPlayer(room: RoomData, userId: number): boolean {
    const player = room.players.find((p) => p.userId === userId);
    // 实际实现需要从剧本数据中查找
    // 这里简化处理
    return false;
  }

  cleanupGame(roomCode: string): void {
    this.gameStates.delete(roomCode);
  }
}
