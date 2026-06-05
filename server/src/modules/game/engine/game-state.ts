/**
 * 游戏状态机 (简化版 XState 实现)
 *
 * 使用简单的状态模式实现游戏状态流转
 * 不依赖外部 xstate 库，保持轻量
 */

import { GamePhase } from '../../../common/interfaces';

export interface StateConfig {
  name: GamePhase;
  on: Record<string, GamePhase>;
  entry?: () => void;
  exit?: () => void;
}

export class GameStateMachine {
  private currentState: GamePhase;
  private states: Map<GamePhase, StateConfig>;
  private history: { from: GamePhase; to: GamePhase; event: string; timestamp: number }[] = [];

  constructor(initialState: GamePhase = GamePhase.LOBBY) {
    this.states = new Map();
    this.currentState = initialState;
    this.setupStates();
  }

  private setupStates(): void {
    // 大厅状态
    this.states.set(GamePhase.LOBBY, {
      name: GamePhase.LOBBY,
      on: {
        START_GAME: GamePhase.INTRO,
        CLOSE_ROOM: GamePhase.ENDED,
      },
    });

    // 开场介绍
    this.states.set(GamePhase.INTRO, {
      name: GamePhase.INTRO,
      on: {
        INTRO_DONE: GamePhase.READING,
        SKIP: GamePhase.READING,
      },
      entry: () => console.log('[Game] 进入开场介绍阶段'),
    });

    // 剧本阅读
    this.states.set(GamePhase.READING, {
      name: GamePhase.READING,
      on: {
        READING_DONE: GamePhase.DISCUSSION,
        SKIP: GamePhase.DISCUSSION,
      },
      entry: () => console.log('[Game] 进入剧本阅读阶段'),
    });

    // 讨论阶段
    this.states.set(GamePhase.DISCUSSION, {
      name: GamePhase.DISCUSSION,
      on: {
        END_DISCUSSION: GamePhase.ACCUSATION,
        NEXT_SCENE: GamePhase.READING,
      },
      entry: () => console.log('[Game] 进入讨论阶段'),
    });

    // 指控阶段
    this.states.set(GamePhase.ACCUSATION, {
      name: GamePhase.ACCUSATION,
      on: {
        ACCUSATION_DONE: GamePhase.VOTING,
        SKIP: GamePhase.VOTING,
      },
      entry: () => console.log('[Game] 进入指控阶段'),
    });

    // 投票阶段
    this.states.set(GamePhase.VOTING, {
      name: GamePhase.VOTING,
      on: {
        VOTE_DONE: GamePhase.REVEAL,
      },
      entry: () => console.log('[Game] 进入投票阶段'),
    });

    // 揭晓阶段
    this.states.set(GamePhase.REVEAL, {
      name: GamePhase.REVEAL,
      on: {
        REVEAL_DONE: GamePhase.ENDED,
      },
      entry: () => console.log('[Game] 进入揭晓阶段'),
    });

    // 游戏结束
    this.states.set(GamePhase.ENDED, {
      name: GamePhase.ENDED,
      on: {},
      entry: () => console.log('[Game] 游戏结束'),
    });
  }

  transition(event: string): GamePhase | null {
    const stateConfig = this.states.get(this.currentState);
    if (!stateConfig) return null;

    const nextState = stateConfig.on[event];
    if (!nextState) {
      console.warn(`[Game] 无效的事件: ${event} 在状态: ${this.currentState}`);
      return null;
    }

    // 执行当前状态的 exit
    stateConfig.exit?.();

    const from = this.currentState;
    this.currentState = nextState;

    // 记录历史
    this.history.push({
      from,
      to: nextState,
      event,
      timestamp: Date.now(),
    });

    // 执行新状态的 entry
    const nextStateConfig = this.states.get(nextState);
    nextStateConfig?.entry?.();

    return nextState;
  }

  getState(): GamePhase {
    return this.currentState;
  }

  canTransition(event: string): boolean {
    const stateConfig = this.states.get(this.currentState);
    if (!stateConfig) return false;
    return event in stateConfig.on;
  }

  getHistory() {
    return this.history;
  }

  reset(initialState: GamePhase = GamePhase.LOBBY): void {
    this.currentState = initialState;
    this.history = [];
  }
}
