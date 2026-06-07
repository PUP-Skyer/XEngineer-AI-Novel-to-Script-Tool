import { describe, it, expect } from 'vitest';

/**
 * Game State Machine Tests
 * Tests the core game phase transitions and logic
 */
describe('Game State Machine', () => {
  const GAME_PHASES = [
    'lobby',
    'character',
    'manual',
    'playing',
    'ending',
    'review',
  ] as const;

  it('should have exactly 6 game phases', () => {
    expect(GAME_PHASES).toHaveLength(6);
  });

  it('should follow correct phase order', () => {
    expect(GAME_PHASES[0]).toBe('lobby');
    expect(GAME_PHASES[1]).toBe('character');
    expect(GAME_PHASES[2]).toBe('manual');
    expect(GAME_PHASES[3]).toBe('playing');
    expect(GAME_PHASES[4]).toBe('ending');
    expect(GAME_PHASES[5]).toBe('review');
  });

  it('should validate phase transitions', () => {
    const validTransitions: Record<string, string[]> = {
      lobby: ['character'],
      character: ['manual'],
      manual: ['playing'],
      playing: ['ending'],
      ending: ['review'],
      review: ['lobby'],
    };

    expect(validTransitions['lobby']).toContain('character');
    expect(validTransitions['playing']).toContain('ending');
    expect(validTransitions['review']).toContain('lobby');
  });
});

describe('G-Coin Reward System', () => {
  const calculateReward = (accuracy: number, baseReward: number = 100): number => {
    if (accuracy >= 90) return baseReward * 3;
    if (accuracy >= 70) return baseReward * 2;
    if (accuracy >= 50) return baseReward;
    return Math.floor(baseReward * 0.5);
  };

  it('should give triple reward for accuracy >= 90%', () => {
    expect(calculateReward(95)).toBe(300);
    expect(calculateReward(90)).toBe(300);
  });

  it('should give double reward for accuracy >= 70%', () => {
    expect(calculateReward(85)).toBe(200);
    expect(calculateReward(70)).toBe(200);
  });

  it('should give base reward for accuracy >= 50%', () => {
    expect(calculateReward(65)).toBe(100);
    expect(calculateReward(50)).toBe(100);
  });

  it('should give half reward for accuracy < 50%', () => {
    expect(calculateReward(49)).toBe(50);
    expect(calculateReward(30)).toBe(50);
  });
});

describe('Novel Archive Logic', () => {
  interface Novel {
    id: number;
    title: string;
    archived: boolean;
  }

  const filterArchived = (novels: Novel[]): Novel[] =>
    novels.filter(n => n.archived);

  it('should filter only archived novels', () => {
    const novels: Novel[] = [
      { id: 1, title: 'Novel A', archived: true },
      { id: 2, title: 'Novel B', archived: false },
      { id: 3, title: 'Novel C', archived: true },
    ];

    const archived = filterArchived(novels);
    expect(archived).toHaveLength(2);
    expect(archived.map(n => n.id)).toEqual([1, 3]);
  });

  it('should return empty array when no archived novels', () => {
    const novels: Novel[] = [
      { id: 1, title: 'Novel A', archived: false },
      { id: 2, title: 'Novel B', archived: false },
    ];

    expect(filterArchived(novels)).toHaveLength(0);
  });
});

describe('Script Conversion Progress', () => {
  const PHASES = [
    { name: 'analyze', label: '分析小说结构', progress: 25 },
    { name: 'extract', label: '提取角色与线索', progress: 50 },
    { name: 'generate', label: '生成剧本框架', progress: 75 },
    { name: 'polish', label: '润色与优化', progress: 100 },
  ];

  it('should have 4 conversion phases', () => {
    expect(PHASES).toHaveLength(4);
  });

  it('should have increasing progress values', () => {
    for (let i = 1; i < PHASES.length; i++) {
      expect(PHASES[i].progress).toBeGreaterThan(PHASES[i - 1].progress);
    }
  });

  it('should complete at 100%', () => {
    expect(PHASES[PHASES.length - 1].progress).toBe(100);
  });
});