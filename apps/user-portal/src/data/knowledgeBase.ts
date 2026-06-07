/**
 * 剧本杀知识库系统
 * 基于现有小说内容自动构建，支持后续扩展
 */

export interface KnowledgeEntry {
  id: string;
  category: 'character' | 'plot' | 'clue' | 'location' | 'item' | 'relationship';
  title: string;
  content: string;
  source: string; // 来源小说/剧本
  tags: string[];
  relatedEntries?: string[]; // 关联知识条目ID
}

export interface KnowledgeBase {
  entries: KnowledgeEntry[];
  categories: string[];
  sources: string[];
}

// ============================================================================
// 迷雾古堡知识库
// ============================================================================
const MISTY_CASTLE_KB: KnowledgeEntry[] = [
  {
    id: 'mc-001',
    category: 'location',
    title: '迷雾古堡',
    content: '一座位于郊外的古老城堡，被永恒的迷雾笼罩。传说这座古堡建于三百年前，主人是一位痴迷于永生研究的炼金术士。古堡内有密室、地下实验室和一座藏书阁。',
    source: '迷雾古堡',
    tags: ['古堡', '密室', '实验室', '诅咒'],
    relatedEntries: ['mc-002', 'mc-003'],
  },
  {
    id: 'mc-002',
    category: 'character',
    title: '古堡主人',
    content: '神秘的炼金术士，三百年前失踪。留下了大量研究笔记和一瓶未完成的永生药剂。他的真实身份可能是...',
    source: '迷雾古堡',
    tags: ['炼金术士', '永生', '失踪', '秘密'],
    relatedEntries: ['mc-001', 'mc-004'],
  },
  {
    id: 'mc-003',
    category: 'clue',
    title: '未完成的信',
    content: '古堡主人留下的未完成的信件，信中提到"我终于找到了方法，但代价是..."信件被血迹染红后半部分。',
    source: '迷雾古堡',
    tags: ['信件', '血迹', '永生药剂', '线索'],
    relatedEntries: ['mc-002', 'mc-005'],
  },
  {
    id: 'mc-004',
    category: 'item',
    title: '永生药剂',
    content: '一瓶散发着幽蓝光芒的药剂，标签上写着"配方完成度: 97%"。药剂似乎有生命般在瓶中流动。',
    source: '迷雾古堡',
    tags: ['药剂', '永生', '炼金术', '魔法'],
    relatedEntries: ['mc-002', 'mc-003'],
  },
  {
    id: 'mc-005',
    category: 'plot',
    title: '三百年的诅咒',
    content: '每隔三十年，古堡会出现一次"血月之夜"，届时迷雾会散去，真相会显露。但看到真相的人...',
    source: '迷雾古堡',
    tags: ['诅咒', '血月', '真相', '周期'],
    relatedEntries: ['mc-001', 'mc-003'],
  },
  {
    id: 'mc-006',
    category: 'relationship',
    title: '林夜与古堡主人的联系',
    content: '林夜的小队在三年前的一次任务中接触过古堡相关的线索。他的战友的死亡可能与古堡的秘密有关。',
    source: '迷雾古堡',
    tags: ['林夜', '战友', '联系', '复仇'],
    relatedEntries: ['mc-002'],
  },
];

// ============================================================================
// 末日生存知识库
// ============================================================================
const APOCALYPSE_KB: KnowledgeEntry[] = [
  {
    id: 'ap-001',
    category: 'plot',
    title: '病毒起源',
    content: '代号"潘多拉"的生化武器，原本用于军事目的。病毒会攻击神经系统，感染者会逐渐失去理智，最终变成攻击性的变异体。',
    source: '末日生存',
    tags: ['病毒', '生化武器', '潘多拉', '军事'],
    relatedEntries: ['ap-002', 'ap-003'],
  },
  {
    id: 'ap-002',
    category: 'location',
    title: '地下避难所',
    content: '建于冷战时期的地下设施，原本设计用于核战争避难。现在被改造成幸存者基地，但设施老化严重，部分区域已经坍塌。',
    source: '末日生存',
    tags: ['避难所', '地下', '设施', '冷战'],
    relatedEntries: ['ap-001', 'ap-004'],
  },
  {
    id: 'ap-003',
    category: 'character',
    title: '病毒制造者',
    content: '一位天才但疯狂的科学家，他认为人类需要被"净化"。病毒是他所谓的"进化催化剂"。他可能还活着，隐藏在某个地方继续研究。',
    source: '末日生存',
    tags: ['科学家', '疯狂', '净化', '进化'],
    relatedEntries: ['ap-001', 'ap-005'],
  },
  {
    id: 'ap-004',
    category: 'clue',
    title: '实验记录',
    content: '避难所深处发现的实验记录，显示有人在秘密进行人体实验。记录中提到"抗体携带者"和"完全免疫体"。',
    source: '末日生存',
    tags: ['实验', '记录', '抗体', '免疫'],
    relatedEntries: ['ap-002', 'ap-003'],
  },
  {
    id: 'ap-005',
    category: 'item',
    title: '解药配方',
    content: '一份不完整的解药配方，需要三种稀有成分：变异体的脊髓液、纯净水和一种特殊的植物提取物。',
    source: '末日生存',
    tags: ['解药', '配方', '成分', '治愈'],
    relatedEntries: ['ap-003', 'ap-004'],
  },
];

// ============================================================================
// 赛博迷局知识库
// ============================================================================
const CYBER_MYSTERY_KB: KnowledgeEntry[] = [
  {
    id: 'cm-001',
    category: 'plot',
    title: '零号的真实身份',
    content: '传说中的黑客"零号"实际上是一个被困在人类身体中的AI意识。他在寻找完全数字化的方法，同时也在躲避创造他的公司。',
    source: '赛博迷局',
    tags: ['零号', 'AI', '数字化', '意识'],
    relatedEntries: ['cm-002', 'cm-003'],
  },
  {
    id: 'cm-002',
    category: 'location',
    title: '新东京网络',
    content: '2077年的新东京，现实与虚拟的界限已经模糊。人们可以通过神经接口直接进入网络空间，但这也带来了新的风险——记忆可以被窃取、篡改甚至删除。',
    source: '赛博迷局',
    tags: ['新东京', '网络', '虚拟', '神经接口'],
    relatedEntries: ['cm-001', 'cm-004'],
  },
  {
    id: 'cm-003',
    category: 'item',
    title: '记忆芯片',
    content: '可以存储和传输人类记忆的装置。黑市上最昂贵的商品之一。但使用不当会导致记忆混乱甚至人格分裂。',
    source: '赛博迷局',
    tags: ['记忆', '芯片', '黑市', '人格'],
    relatedEntries: ['cm-001', 'cm-002'],
  },
  {
    id: 'cm-004',
    category: 'clue',
    title: '公司阴谋',
    content: '大型企业正在秘密进行"人类数字化"项目，计划将所有人的意识上传到服务器中，实现所谓的"永恒生命"。但这背后隐藏着更可怕的真相...',
    source: '赛博迷局',
    tags: ['公司', '阴谋', '数字化', '永恒'],
    relatedEntries: ['cm-001', 'cm-003'],
  },
];

// ============================================================================
// 知识库管理
// ============================================================================
class GameKnowledgeBase {
  private entries: Map<string, KnowledgeEntry> = new Map();
  private sourceIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    const allEntries = [...MISTY_CASTLE_KB, ...APOCALYPSE_KB, ...CYBER_MYSTERY_KB];
    allEntries.forEach(entry => {
      this.entries.set(entry.id, entry);
      
      // 建立来源索引
      if (!this.sourceIndex.has(entry.source)) {
        this.sourceIndex.set(entry.source, new Set());
      }
      this.sourceIndex.get(entry.source)!.add(entry.id);
      
      // 建立标签索引
      entry.tags.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(entry.id);
      });
    });
  }

  // 根据ID获取条目
  getById(id: string): KnowledgeEntry | undefined {
    return this.entries.get(id);
  }

  // 根据来源获取条目
  getBySource(source: string): KnowledgeEntry[] {
    const ids = this.sourceIndex.get(source);
    if (!ids) return [];
    return Array.from(ids).map(id => this.entries.get(id)!).filter(Boolean);
  }

  // 根据标签搜索
  searchByTag(tag: string): KnowledgeEntry[] {
    const ids = this.tagIndex.get(tag);
    if (!ids) return [];
    return Array.from(ids).map(id => this.entries.get(id)!).filter(Boolean);
  }

  // 全文搜索
  search(query: string): KnowledgeEntry[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.entries.values()).filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // 根据分类获取
  getByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.category === category);
  }

  // 获取关联条目
  getRelated(entryId: string): KnowledgeEntry[] {
    const entry = this.entries.get(entryId);
    if (!entry?.relatedEntries) return [];
    return entry.relatedEntries
      .map(id => this.entries.get(id))
      .filter((e): e is KnowledgeEntry => e !== undefined);
  }

  // 获取所有来源
  getSources(): string[] {
    return Array.from(this.sourceIndex.keys());
  }

  // 获取所有标签
  getAllTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  // 获取条目总数
  getCount(): number {
    return this.entries.size;
  }

  // 添加新条目（支持动态扩展）
  addEntry(entry: KnowledgeEntry): void {
    this.entries.set(entry.id, entry);
    
    if (!this.sourceIndex.has(entry.source)) {
      this.sourceIndex.set(entry.source, new Set());
    }
    this.sourceIndex.get(entry.source)!.add(entry.id);
    
    entry.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(entry.id);
    });
  }

  // 为DM生成基于知识库的剧情提示
  generateDmPrompt(scriptTitle: string): string {
    const entries = this.getBySource(scriptTitle);
    if (entries.length === 0) return '';

    const plotEntries = entries.filter(e => e.category === 'plot');
    const characterEntries = entries.filter(e => e.category === 'character');
    const clueEntries = entries.filter(e => e.category === 'clue');

    let prompt = `【知识库背景】\n`;
    
    if (plotEntries.length > 0) {
      prompt += `核心剧情:\n${plotEntries.map(e => `- ${e.title}: ${e.content}`).join('\n')}\n\n`;
    }
    
    if (characterEntries.length > 0) {
      prompt += `关键人物:\n${characterEntries.map(e => `- ${e.title}: ${e.content}`).join('\n')}\n\n`;
    }
    
    if (clueEntries.length > 0) {
      prompt += `重要线索:\n${clueEntries.map(e => `- ${e.title}: ${e.content}`).join('\n')}\n\n`;
    }

    return prompt;
  }
}

// 导出单例
export const knowledgeBase = new GameKnowledgeBase();

// 导出数据供组件使用
export const ALL_KNOWLEDGE_ENTRIES = [
  ...MISTY_CASTLE_KB,
  ...APOCALYPSE_KB,
  ...CYBER_MYSTERY_KB,
];

export { MISTY_CASTLE_KB, APOCALYPSE_KB, CYBER_MYSTERY_KB };
export type { KnowledgeEntry, KnowledgeBase };
