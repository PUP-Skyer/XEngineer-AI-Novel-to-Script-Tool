import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  User,
  BookOpen,
  MessageSquare,
  Star,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Send,
  Play,
  Info,
  AlertCircle,
  Clock,
  Sword,
  Shield,
  Wand2,
  Heart,
  Trophy,
  Coins,
  BarChart3,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Home,
  Vote,
  Sparkles,
  TrendingUp,
  Activity,
  Eye,
  Skull,
  BrainCircuit,
  Flame,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/services/apiClient';
import { gameService } from '@/services/gameService';
import { useGameStore } from '@/stores/gameStore';

/* ------------------------------------------------------------------ */
/*  类型定义                                                            */
/* ------------------------------------------------------------------ */

/** 游戏阶段状态机 */
type GamePhase = 'lobby' | 'character' | 'manual' | 'playing' | 'voting' | 'ending' | 'review';

/** 剧本类型 */
type ScriptGenre = 'suspense' | 'scifi' | 'romance' | 'action' | 'fantasy' | 'horror' | 'other';

interface RoomData {
  code: string;
  title: string;
  scriptName: string;
  scriptId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  host: string;
  status: 'waiting' | 'playing' | 'finished';
  players: PlayerData[];
  maxPlayers: number;
}

interface PlayerData {
  userId: number;
  username: string;
  characterName: string | null;
  isHost: boolean;
  avatar?: string;
  isOnline?: boolean;
}

interface Character {
  id: number;
  name: string;
  gender: string;
  age: string;
  voicePreset: string;
  personality: string;
  background: string;
  secret: string;
  motivation: string;
  avatarUrl?: string;
  roleType?: string;
}

/** 角色任务 */
interface CharacterTask {
  id: string;
  characterId: number;
  title: string;
  description: string;
  genre: ScriptGenre;
  isCompleted: boolean;
  isHidden: boolean;
  rewardGCoin: number;
}

interface ScriptManual {
  title: string;
  overview: string;
  rules: string[];
  roles: ScriptRole[];
  tips: string[];
  genreName?: string;
  genreTheme?: string;
  winCondition?: string;
  loseCondition?: string;
  genre?: ScriptGenre;
}

interface ScriptRole {
  name: string;
  description: string;
  responsibilities: string;
}

interface DmChoice {
  id: number;
  text: string;
  consequence?: string;
  taskHint?: string;
}

interface DmMessage {
  narrative: string;
  emotion: string;
  choices: DmChoice[];
  taskUpdate?: CharacterTask;
}

interface DmChatEntry {
  id: number;
  role: 'dm' | 'player' | 'system';
  speaker: string;
  content: string;
  emotion?: string;
  timestamp: string;
  choices?: DmChoice[];
  taskUpdate?: CharacterTask;
}

/** 复盘聊天消息 */
interface ReviewMessage {
  id: number;
  sender: string;
  characterName?: string;
  content: string;
  timestamp: string;
  type: 'chat' | 'system' | 'highlight';
}

/** 游戏结果 */
interface GameResult {
  isWin: boolean;
  title: string;
  narrative: string;
  genre: ScriptGenre;
  gCoinReward: number;
  totalGCoin: number;
  rankings: PlayerRanking[];
  keyChoices: KeyChoice[];
  characterPerformance: CharacterPerformance[];
}

interface PlayerRanking {
  playerId: number;
  characterName: string;
  username: string;
  score: number;
  gCoinEarned: number;
  tasksCompleted: number;
  isWinner: boolean;
}

interface KeyChoice {
  round: number;
  choice: string;
  consequence: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface CharacterPerformance {
  characterName: string;
  tasksCompleted: number;
  totalTasks: number;
  highlights: string[];
}

/** 实时统计 */
interface GameStats {
  playerActivity: { name: string; messages: number; choices: number }[];
  scriptCompletion: { phase: string; percentage: number }[];
  gCoinLeaderboard: { name: string; gCoin: number }[];
  genreDistribution: { genre: string; count: number }[];
}

/* ------------------------------------------------------------------ */
/*  常量                                                               */
/* ------------------------------------------------------------------ */

const PHASE_LABELS: Record<GamePhase, { label: string; icon: React.ElementType; color: string }> = {
  lobby: { label: '等待大厅', icon: Users, color: 'text-neon-blue' },
  character: { label: '角色选择', icon: User, color: 'text-neon-purple' },
  manual: { label: '游戏说明', icon: BookOpen, color: 'text-neon-cyan' },
  playing: { label: '游戏进行中', icon: MessageSquare, color: 'text-neon-green' },
  voting: { label: '投票指认', icon: Vote, color: 'text-neon-pink' },
  ending: { label: '结局展示', icon: Trophy, color: 'text-neon-yellow' },
  review: { label: '复盘聊天', icon: Sparkles, color: 'text-neon-purple' },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: 'text-neon-green' },
  medium: { label: '中等', color: 'text-neon-cyan' },
  hard: { label: '困难', color: 'text-neon-pink' },
};

const GENRE_MAP: Record<ScriptGenre, { label: string; color: string; icon: React.ElementType }> = {
  suspense: { label: '悬疑', color: 'text-neon-purple', icon: Eye },
  scifi: { label: '科幻', color: 'text-neon-cyan', icon: BrainCircuit },
  romance: { label: '言情', color: 'text-neon-pink', icon: Heart },
  action: { label: '动作', color: 'text-neon-red', icon: Flame },
  fantasy: { label: '奇幻', color: 'text-neon-blue', icon: Sparkles },
  horror: { label: '恐怖', color: 'text-neon-red', icon: Skull },
  other: { label: '其他', color: 'text-text-muted', icon: BookOpen },
};

/* ------------------------------------------------------------------ */
/*  Mock 数据（API 失败时的降级方案）                                    */
/* ------------------------------------------------------------------ */

const MOCK_CHARACTERS: Character[] = [
  {
    id: 1,
    name: '林夜',
    gender: '男',
    age: '28',
    voicePreset: '沉稳男声',
    personality: '冷静沉着，善于观察，在危机中总能保持理智',
    background: '前特种部队成员，退役后在一家私人安保公司工作。三年前接受了一项神秘委托，从此卷入了一场跨越黑暗世界的阴谋。',
    secret: '他其实一直在寻找当年导致小队全军覆没的真凶，而那个真凶可能就在这栋宅邸之中。',
    motivation: '查明真相，为死去的战友复仇',
    roleType: '守护者',
  },
  {
    id: 2,
    name: '苏晚晴',
    gender: '女',
    age: '25',
    voicePreset: '清冷女声',
    personality: '聪慧敏锐，言辞犀利，擅长心理博弈',
    background: '知名心理学博士，专攻犯罪心理学。被警方聘为特别顾问，此次以心理咨询师的身份进入宅邸调查。',
    secret: '她与宅邸主人有着不为人知的过去，曾经是对方的学生，也是唯一知道主人真正研究项目的人。',
    motivation: '阻止一项危险的心理学实验被滥用',
    roleType: '智囊',
  },
  {
    id: 3,
    name: '陈默',
    gender: '男',
    age: '32',
    voicePreset: '深沉大叔音',
    personality: '沉默寡言，行事果断，隐藏着极强的武力',
    background: '表面上是古董商人，实际上是情报贩子。游走于灰色地带，掌握着大量不为人知的秘密信息。',
    secret: '他手中掌握着一份足以颠覆整个权力格局的证据文件，而这正是各方势力都在寻找的东西。',
    motivation: '在各方势力之间周旋，寻找最有利的出手时机',
    roleType: '交涉者',
  },
  {
    id: 4,
    name: '白露',
    gender: '女',
    age: '23',
    voicePreset: '甜美少女音',
    personality: '外表天真无邪，内心却有着超越年龄的成熟与算计',
    background: '天才黑客少女，18岁就攻破了五角大楼的防御系统。后被某神秘组织招募，成为一名网络间谍。',
    secret: '她的真实身份是双重间谍，同时在为至少三个不同的组织工作，而她的最终目的至今无人知晓。',
    motivation: '完成自己的计划，摆脱所有组织的控制',
    roleType: '探查者',
  },
  {
    id: 5,
    name: '赵铁柱',
    gender: '男',
    age: '45',
    voicePreset: '粗犷大汉音',
    personality: '看似粗鲁直率，实则心思缜密，大智若愚',
    background: '曾经是地下拳场的冠军，后来转行做了私家侦探。因为一桩离奇的失踪案被卷入了这场风波。',
    secret: '他认识宅邸中的某个人，那段往事是他始终不愿提起的伤疤。',
    motivation: '找到失踪的委托人，还清一笔旧债',
    roleType: '探查者',
  },
  {
    id: 6,
    name: '花想容',
    gender: '女',
    age: '29',
    voicePreset: '妩媚御姐音',
    personality: '风情万种，八面玲珑，善于利用魅力获取情报',
    background: '知名夜总会的老板，同时也是地下情报网的核心人物。她的情报网络遍布整个城市，黑白两道都有她的眼线。',
    secret: '她与宅邸主人之间有一份秘密契约，但如果契约内容曝光，将会毁掉所有人。',
    motivation: '保护自己的情报帝国，同时寻找足以制衡所有势力的底牌',
    roleType: '交涉者',
  },
];

const MOCK_ROOM: RoomData = {
  code: '',
  title: '',
  scriptName: '暗夜迷局',
  scriptId: 1,
  difficulty: 'medium',
  host: '',
  status: 'waiting',
  players: [],
  maxPlayers: 6,
};

const MOCK_MANUAL: ScriptManual = {
  title: '暗夜迷局',
  overview:
    '在一个风雨交加的夜晚，六位身份各异的陌生人被一封神秘请柬聚集到郊外的古宅"夜影山庄"。\n\n宅邸的主人——著名心理学家叶秋白教授，在邀请函中声称有一项足以改变人类认知的重大发现要公布。然而，当众人抵达时，却发现叶教授已经失踪，只留下一间紧锁的书房和一封未写完的信。\n\n更诡异的是，暴风雨切断了山庄与外界的联系，电话无法接通，山路也被泥石流阻断。众人被困在这座阴森的古宅中，黑暗中似乎有什么东西在窥视着他们……\n\n每个人都有自己的秘密，每个人都有自己的目的。谎言与真相交织，信任与背叛并存。在这座与世隔绝的古宅中，究竟隐藏着怎样的真相？',
  rules: [
    '每位玩家选择或分配一个角色，整个游戏过程中不得透露自己的秘密信息',
    '游戏由DM（主持人）推进剧情，玩家通过输入对话或选择选项进行互动',
    '玩家可以自由探索场景、与其他角色交流、搜集线索',
    '部分关键线索需要通过特定角色的技能或背景才能获取',
    '玩家之间存在隐藏任务，完成个人任务可获得额外G币奖励',
    '游戏时长约 60-90 分钟，请确保全程参与',
    '请尊重其他玩家的游戏体验，避免恶意破坏剧情',
  ],
  roles: [
    { name: '探查者', description: '擅长搜寻线索和分析推理，可以发现隐藏的细节', responsibilities: '主动探索场景，搜集物证，还原事件经过' },
    { name: '交涉者', description: '善于与他人沟通，可以从对话中套取情报', responsibilities: '与其他角色交流，收集口供，拆穿谎言' },
    { name: '守护者', description: '保护他人安全，拥有一定的武力值', responsibilities: '在危险时刻保护同伴，处理突发状况' },
    { name: '智囊', description: '知识渊博，可以解读复杂的线索和密码', responsibilities: '分析复杂信息，破解谜题，提供决策建议' },
  ],
  tips: [
    '仔细阅读你的角色背景和秘密，充分代入角色',
    '不要轻易相信其他玩家说的话——他们可能在撒谎',
    '注意观察其他玩家的言行举止，寻找矛盾之处',
    '合理利用你角色的特殊能力和背景设定',
    '即使发现了重要线索，也不要急于公开，选择合适的时机摊牌',
    '享受过程，不要过于在意胜负——一个好的故事比赢更重要',
  ],
  genreName: '悬疑',
  genreTheme: '找出真相',
  winCondition: '正确指认凶手并找出关键证据',
  loseCondition: '未能找出真凶或关键证据不足',
  genre: 'suspense',
};

/** 根据剧本类型生成角色任务 */
function generateTasksForCharacter(character: Character, genre: ScriptGenre): CharacterTask[] {
  const tasks: CharacterTask[] = [];
  switch (genre) {
    case 'suspense':
      tasks.push(
        { id: 't1', characterId: character.id, title: '找出真凶', description: '通过线索推理，正确指认案件的真凶', genre, isCompleted: false, isHidden: false, rewardGCoin: 100 },
        { id: 't2', characterId: character.id, title: '保护证人', description: '确保关键证人安全活到游戏结束', genre, isCompleted: false, isHidden: true, rewardGCoin: 50 },
        { id: 't3', characterId: character.id, title: '隐藏身份', description: '不让其他玩家发现你的真实目的', genre, isCompleted: false, isHidden: true, rewardGCoin: 30 },
      );
      break;
    case 'scifi':
      tasks.push(
        { id: 't1', characterId: character.id, title: '完成科技任务', description: '成功修复或启动关键科技装置', genre, isCompleted: false, isHidden: false, rewardGCoin: 100 },
        { id: 't2', characterId: character.id, title: '阻止AI失控', description: '在AI造成不可逆破坏前阻止它', genre, isCompleted: false, isHidden: false, rewardGCoin: 80 },
        { id: 't3', characterId: character.id, title: '收集数据核心', description: '找到并保护实验数据不被销毁', genre, isCompleted: false, isHidden: true, rewardGCoin: 50 },
      );
      break;
    case 'romance':
      tasks.push(
        { id: 't1', characterId: character.id, title: '达成情感目标', description: '与目标角色建立深厚情感联系', genre, isCompleted: false, isHidden: false, rewardGCoin: 100 },
        { id: 't2', characterId: character.id, title: '解开误会', description: '消除与关键角色之间的误会', genre, isCompleted: false, isHidden: false, rewardGCoin: 60 },
        { id: 't3', characterId: character.id, title: '守护爱情', description: '阻止外部势力破坏你的感情', genre, isCompleted: false, isHidden: true, rewardGCoin: 40 },
      );
      break;
    case 'action':
      tasks.push(
        { id: 't1', characterId: character.id, title: '完成任务目标', description: '成功执行并完成核心任务', genre, isCompleted: false, isHidden: false, rewardGCoin: 100 },
        { id: 't2', characterId: character.id, title: '保护队友', description: '确保至少一名队友安全撤离', genre, isCompleted: false, isHidden: false, rewardGCoin: 70 },
        { id: 't3', characterId: character.id, title: '击败对手', description: '在正面对决中战胜敌对势力', genre, isCompleted: false, isHidden: true, rewardGCoin: 50 },
      );
      break;
    default:
      tasks.push(
        { id: 't1', characterId: character.id, title: '完成主线任务', description: '达成剧本核心目标', genre, isCompleted: false, isHidden: false, rewardGCoin: 100 },
        { id: 't2', characterId: character.id, title: '探索秘密', description: '发现剧本中的隐藏秘密', genre, isCompleted: false, isHidden: true, rewardGCoin: 50 },
      );
  }
  return tasks;
}

/* ------------------------------------------------------------------ */
/*  子组件：阶段指示器                                                  */
/* ------------------------------------------------------------------ */

function PhaseIndicator({ currentPhase, onPhaseChange, isHost }: {
  currentPhase: GamePhase;
  onPhaseChange?: (phase: GamePhase) => void;
  isHost: boolean;
}) {
  const phases: GamePhase[] = ['lobby', 'character', 'manual', 'playing', 'voting', 'ending', 'review'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-bg-secondary/60 border-b border-white/5 overflow-x-auto">
      {phases.map((phase, idx) => {
        const info = PHASE_LABELS[phase];
        const Icon = info.icon;
        const isActive = idx === currentIndex;
        const isPast = idx < currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <div key={phase} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => isHost && onPhaseChange?.(phase)}
              disabled={!isHost || isFuture}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20'
                  : isPast
                    ? 'text-neon-green/70 bg-neon-green/5'
                    : 'text-text-muted bg-bg-tertiary/30'
              } ${isHost && !isFuture ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{info.label}</span>
              {isPast && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
            </button>
            {idx < phases.length - 1 && (
              <ChevronRight className={`w-3 h-3 ${isPast ? 'text-neon-green/40' : 'text-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  子组件：角色卡片                                                    */
/* ------------------------------------------------------------------ */

function CharacterCard({
  character,
  selected,
  onSelect,
  disabled,
  tasks,
}: {
  character: Character;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  tasks?: CharacterTask[];
}) {
  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-full text-left rounded-xl border transition-all overflow-hidden ${
        selected
          ? 'border-neon-purple/50 bg-neon-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
          : 'border-white/5 bg-bg-secondary/80 hover:border-white/20 hover:bg-bg-secondary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={disabled ? {} : { y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                selected
                  ? 'bg-gradient-to-br from-neon-purple to-neon-blue text-white'
                  : 'bg-bg-tertiary text-text-secondary border border-white/10'
              }`}
            >
              {character.name[0]}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{character.name}</h4>
              <p className="text-xs text-text-muted">{character.gender} · {character.age}岁</p>
            </div>
          </div>
          {selected && (
            <div className="w-5 h-5 rounded-full bg-neon-purple flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-xs text-neon-purple">
            <Volume2 className="w-3 h-3" />
            {character.voicePreset}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-xs text-neon-cyan">
            <Star className="w-3 h-3" />
            {character.personality.slice(0, 16)}...
          </span>
          {character.roleType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-xs text-neon-green">
              <Sword className="w-3 h-3" />
              {character.roleType}
            </span>
          )}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-2">
          {character.background}
        </p>

        <div className="flex items-start gap-1.5 text-xs text-neon-pink/80 bg-neon-pink/5 rounded-lg p-2 border border-neon-pink/10">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{character.secret}</span>
        </div>

        {tasks && tasks.length > 0 && selected && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">角色任务</p>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border ${
                    task.isCompleted
                      ? 'bg-neon-green/5 border-neon-green/20 text-neon-green'
                      : 'bg-bg-tertiary/40 border-white/5 text-text-secondary'
                  }`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                  ) : (
                    <Target className="w-3 h-3 shrink-0 text-text-muted" />
                  )}
                  <span className="flex-1">{task.title}</span>
                  <span className="text-[10px] text-neon-yellow flex items-center gap-0.5">
                    <Coins className="w-2.5 h-2.5" />
                    {task.rewardGCoin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  子组件：玩家徽章                                                    */
/* ------------------------------------------------------------------ */

function PlayerBadge({ player, isCurrent }: { player: PlayerData; isCurrent?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-tertiary/60 border border-white/5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-xs font-bold text-white">
        {(player.characterName?.[0] || player.username[0]).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">
          {player.characterName || '等待选择...'}
        </p>
        <p className="text-[10px] text-text-muted truncate">{isCurrent ? '你' : player.username}</p>
      </div>
      {player.isHost && <Star className="w-3 h-3 text-neon-cyan fill-neon-cyan/30" />}
      {player.isOnline !== false && (
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green" title="在线" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  子组件：G币显示                                                     */
/* ------------------------------------------------------------------ */

function GCoinBadge({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-yellow/10 border border-neon-yellow/20 text-neon-yellow">
      <Coins className="w-3.5 h-3.5" />
      <span className="text-xs font-bold">{amount.toLocaleString()}</span>
      <span className="text-[10px] text-neon-yellow/70">G币</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  子组件：简单柱状图（替代 ECharts，避免额外依赖）                     */
/* ------------------------------------------------------------------ */

function SimpleBarChart({ data, maxValue, color = 'bg-neon-purple' }: {
  data: { label: string; value: number; color?: string }[];
  maxValue: number;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xs text-text-muted w-16 truncate text-right shrink-0">{item.label}</span>
          <div className="flex-1 h-5 bg-bg-tertiary/40 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.color || color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            />
          </div>
          <span className="text-xs text-text-primary w-10 text-right shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
        {data.map((item, idx) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          const endAngle = currentAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={idx}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill="#0a0a0f" />
      </svg>
      <div className="space-y-1.5">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-text-muted">{item.label}</span>
            <span className="text-text-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  主组件                                                             */
/* ------------------------------------------------------------------ */

export default function GameRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  /* ---- 游戏阶段状态机 ---- */
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');

  /* ---- 房间与角色数据 ---- */
  const [room, setRoom] = useState<RoomData | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scriptManual, setScriptManual] = useState<ScriptManual | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  /* ---- 角色任务系统 ---- */
  const [characterTasks, setCharacterTasks] = useState<CharacterTask[]>([]);

  /* ---- 加载与错误状态 ---- */
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- DM 游戏状态 ---- */
  const [dmMessages, setDmMessages] = useState<DmChatEntry[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [currentChoices, setCurrentChoices] = useState<DmChoice[]>([]);
  const [sendingAction, setSendingAction] = useState(false);
  const [chatLogOpen, setChatLogOpen] = useState(true);
  const [charPanelOpen, setCharPanelOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---- 回合与剧情分支 ---- */
  const [roundCount, setRoundCount] = useState(0);
  const [playerChoices, setPlayerChoices] = useState<{ round: number; choice: string }[]>([]);

  /* ---- 投票阶段 ---- */
  const [votingOptions, setVotingOptions] = useState<{ id: number; name: string; votes: number }[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResult, setVoteResult] = useState<{ targetName: string; isCorrect: boolean } | null>(null);

  /* ---- 结局与复盘 ---- */
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  /* ---- 复盘聊天室 ---- */
  const [reviewMessages, setReviewMessages] = useState<ReviewMessage[]>([]);
  const [reviewInput, setReviewInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  /* ---- G币系统 ---- */
  const [gCoinBalance, setGCoinBalance] = useState(0);

  /* ---- 实时统计 ---- */
  const [gameStats, setGameStats] = useState<GameStats>({
    playerActivity: [],
    scriptCompletion: [],
    gCoinLeaderboard: [],
    genreDistribution: [],
  });

  /* ---- 自动滚动 DM 消息 ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  /* ---- 获取房间与剧本数据 ---- */
  useEffect(() => {
    if (!code) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const roomRes = await apiClient.get(`/game/rooms/${code}`);
        const roomData: RoomData = roomRes.data?.data ?? { ...MOCK_ROOM, code };
        setRoom(roomData);
        setPlayers(roomData.players || []);

        // 根据房间状态设置初始阶段
        if (roomData.status === 'playing') {
          setGamePhase('playing');
        } else if (roomData.status === 'finished') {
          setGamePhase('review');
        } else {
          setGamePhase('lobby');
        }

        const scriptId = roomData.scriptId;
        try {
          const charRes = await apiClient.get(`/game/novels/${scriptId}/characters`);
          setCharacters(charRes.data?.data ?? MOCK_CHARACTERS);
        } catch {
          setCharacters(MOCK_CHARACTERS);
        }

        const scriptTitle = roomData.scriptName || roomData.title || '';
        try {
          const manualRes = await apiClient.get(`/game/dm/script/${scriptId}`, { params: { title: scriptTitle } });
          setScriptManual(manualRes.data?.data ?? MOCK_MANUAL);
        } catch {
          setScriptManual(MOCK_MANUAL);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || '加载房间失败');
        setRoom({ ...MOCK_ROOM, code: code ?? '' });
        setCharacters(MOCK_CHARACTERS);
        setScriptManual(MOCK_MANUAL);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);

  /* ---- Socket.IO 连接（复盘聊天室） ---- */
  useEffect(() => {
    if (!code) return;

    const socket = gameService.connect(code);

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('game:log', (log: any) => {
      if (log.actionType === 'chat') {
        setReviewMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: log.sender || '未知玩家',
            characterName: log.characterName,
            content: log.content,
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            type: 'chat',
          },
        ]);
      }
    });

    socket.on('game:players', (updatedPlayers: any[]) => {
      setPlayers((prev) =>
        prev.map((p) => {
          const updated = updatedPlayers.find((up) => up.userId === p.userId);
          return updated ? { ...p, ...updated } : p;
        })
      );
    });

    return () => {
      gameService.disconnect();
    };
  }, [code]);

  /* ---- 初始化角色任务 ---- */
  useEffect(() => {
    if (selectedCharacter && scriptManual?.genre) {
      const tasks = generateTasksForCharacter(selectedCharacter, scriptManual.genre);
      setCharacterTasks(tasks);
    }
  }, [selectedCharacter, scriptManual]);

  /* ---- 更新实时统计 ---- */
  useEffect(() => {
    const stats: GameStats = {
      playerActivity: players.map((p) => ({
        name: p.characterName || p.username,
        messages: Math.floor(Math.random() * 50) + 10,
        choices: Math.floor(Math.random() * 20) + 5,
      })),
      scriptCompletion: [
        { phase: '角色选择', percentage: 100 },
        { phase: '阅读剧本', percentage: 100 },
        { phase: '剧情推进', percentage: Math.min((roundCount / 10) * 100, 100) },
        { phase: '投票指认', percentage: gamePhase === 'voting' || gamePhase === 'ending' || gamePhase === 'review' ? 100 : 0 },
        { phase: '结局复盘', percentage: gamePhase === 'review' ? 100 : 0 },
      ],
      gCoinLeaderboard: players.map((p, i) => ({
        name: p.characterName || p.username,
        gCoin: (players.length - i) * 150 + Math.floor(Math.random() * 100),
      })),
      genreDistribution: [
        { genre: '悬疑', count: 45 },
        { genre: '科幻', count: 32 },
        { genre: '言情', count: 28 },
        { genre: '动作', count: 20 },
        { genre: '其他', count: 15 },
      ],
    };
    setGameStats(stats);
  }, [players, roundCount, gamePhase]);

  /* ---- 加入房间（选择角色） ---- */
  const handleJoin = async () => {
    if (!code || !selectedCharacter) return;
    setJoining(true);
    try {
      await apiClient.post(`/game/rooms/${code}/join`, { character: selectedCharacter.name });
    } catch {
      // API 调用失败也继续，可能是 mock 环境
    }
    // 无论 API 成功与否，都进入游戏
    setIsJoined(true);
    setPlayers((prev) => [
      ...prev,
      {
        userId: Date.now(),
        username: selectedCharacter.name,
        characterName: selectedCharacter.name,
        isHost: prev.length === 0,
        isOnline: true,
      },
    ]);
    // 进入说明书阶段
    setGamePhase('manual');
    setJoining(false);
  };

  /* ---- 开始游戏 ---- */
  const handleStartGame = async () => {
    if (!code) return;
    setStarting(true);
    try {
      await apiClient.post(`/game/rooms/${code}/start`);
      const welcomeMsg: DmChatEntry = {
        id: Date.now(),
        role: 'dm',
        speaker: 'DM',
        content:
          '欢迎来到"暗夜迷局"。你们六位被一封神秘请柬聚集到这座郊外的古宅——夜影山庄。宅邸的主人叶秋白教授不知所踪，而暴风雨已经切断了你们与外界的联系。\n\n黑暗之中，有什么在等待着你们……',
        emotion: '神秘',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        choices: [
          { id: 1, text: '探索一楼大厅，寻找线索', consequence: '发现可能的入口', taskHint: '探查者任务：寻找隐藏线索' },
          { id: 2, text: '尝试检查所有门窗', consequence: '确认是否真的被困' },
          { id: 3, text: '前往书房调查', consequence: '可能发现教授的笔记', taskHint: '智囊任务：解读复杂信息' },
          { id: 4, text: '与其他人交谈，交换信息', consequence: '了解其他人的来意', taskHint: '交涉者任务：套取情报' },
        ],
      };
      setDmMessages([welcomeMsg]);
      setCurrentChoices(welcomeMsg.choices || []);
      setGamePhase('playing');
    } catch {
      setGamePhase('playing');
    } finally {
      setStarting(false);
    }
  };

  /* ---- 发送玩家行动到 DM ---- */
  const handleSendAction = async () => {
    if (!playerInput.trim() || !code || !room || sendingAction) return;
    setSendingAction(true);
    const playerEntry: DmChatEntry = {
      id: Date.now(),
      role: 'player',
      speaker: selectedCharacter?.name || '玩家',
      content: playerInput.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setDmMessages((prev) => [...prev, playerEntry]);
    setPlayerInput('');

    try {
      const res = await apiClient.post('/game/dm/action', {
        code,
        action: playerEntry.content,
        characterName: selectedCharacter?.name || '',
        scriptTitle: room.scriptName,
      });
      const dmData: DmMessage = res.data?.data ?? getMockDmResponse();
      const dmEntry: DmChatEntry = {
        id: Date.now() + 1,
        role: 'dm',
        speaker: 'DM',
        content: dmData.narrative,
        emotion: dmData.emotion,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        choices: dmData.choices,
        taskUpdate: dmData.taskUpdate,
      };
      setDmMessages((prev) => [...prev, dmEntry]);
      setCurrentChoices(dmData.choices || []);

      // 更新任务状态
      if (dmData.taskUpdate) {
        setCharacterTasks((prev) =>
          prev.map((t) => (t.id === dmData.taskUpdate!.id ? { ...t, isCompleted: true } : t))
        );
      }
    } catch {
      const dmEntry = getMockDmEntry();
      setDmMessages((prev) => [...prev, dmEntry]);
      setCurrentChoices(dmEntry.choices || []);
    } finally {
      setSendingAction(false);
    }
  };

  /* ---- 处理选择 ---- */
  const handleChoice = async (choiceId: number) => {
    const choice = currentChoices.find((c) => c.id === choiceId);
    if (!choice || !code || !room) return;

    const playerEntry: DmChatEntry = {
      id: Date.now(),
      role: 'player',
      speaker: selectedCharacter?.name || '玩家',
      content: `选择了: ${choice.text}`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setDmMessages((prev) => [...prev, playerEntry]);
    setCurrentChoices([]);
    setPlayerChoices((prev) => [...prev, { round: roundCount + 1, choice: choice.text }]);

    try {
      const res = await apiClient.post('/game/dm/action', {
        code,
        action: choice.text,
        characterName: selectedCharacter?.name || '',
        scriptTitle: room.scriptName,
      });
      const dmData: DmMessage = res.data?.data ?? getMockDmResponse();
      const dmEntry: DmChatEntry = {
        id: Date.now() + 1,
        role: 'dm',
        speaker: 'DM',
        content: dmData.narrative,
        emotion: dmData.emotion,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        choices: dmData.choices,
        taskUpdate: dmData.taskUpdate,
      };
      setDmMessages((prev) => [...prev, dmEntry]);
      setCurrentChoices(dmData.choices || []);
      const newRound = roundCount + 1;
      setRoundCount(newRound);

      // 更新任务
      if (dmData.taskUpdate) {
        setCharacterTasks((prev) =>
          prev.map((t) => (t.id === dmData.taskUpdate!.id ? { ...t, isCompleted: true } : t))
        );
      }

      // 8 回合后自动进入投票阶段
      if (newRound >= 8) {
        setTimeout(() => enterVotingPhase(), 2000);
      }
    } catch {
      const dmEntry = getMockDmEntry();
      setDmMessages((prev) => [...prev, dmEntry]);
      setCurrentChoices(dmEntry.choices || []);
      const newRound = roundCount + 1;
      setRoundCount(newRound);
      if (newRound >= 8) {
        setTimeout(() => enterVotingPhase(), 2000);
      }
    }
  };

  /* ---- 进入投票阶段 ---- */
  const enterVotingPhase = () => {
    setGamePhase('voting');
    // 生成投票选项（其他角色）
    const options = characters
      .filter((c) => c.id !== selectedCharacter?.id)
      .map((c) => ({ id: c.id, name: c.name, votes: Math.floor(Math.random() * 3) }));
    setVotingOptions(options);
    setHasVoted(false);
    setVoteResult(null);
  };

  /* ---- 投票 ---- */
  const handleVote = async (targetId: number) => {
    if (hasVoted) return;
    setHasVoted(true);

    const target = votingOptions.find((v) => v.id === targetId);
    if (!target) return;

    try {
      await apiClient.post(`/game/rooms/${code}/vote`, { targetId, characterName: selectedCharacter?.name });
    } catch {
      // 静默处理
    }

    // 模拟投票结果（悬疑剧本：假设凶手是 ID 为 3 的陈默）
    const isCorrect = targetId === 3;
    setVoteResult({ targetName: target.name, isCorrect });

    // 延迟进入结局
    setTimeout(() => {
      handleEndGame(isCorrect);
    }, 3000);
  };

  /* ---- 结局结算 ---- */
  const handleEndGame = async (isWin: boolean) => {
    if (!code) return;
    setGamePhase('ending');

    // 计算 G币奖励
    const completedTasks = characterTasks.filter((t) => t.isCompleted);
    const taskReward = completedTasks.reduce((sum, t) => sum + t.rewardGCoin, 0);
    const winReward = isWin ? 200 : 50;
    const totalReward = taskReward + winReward;
    setGCoinBalance((prev) => prev + totalReward);

    const result: GameResult = {
      isWin,
      title: isWin ? '完美结局' : '遗憾收场',
      narrative: isWin
        ? '恭喜！你们成功达成了目标。所有的线索都串联到了一起，真相终于浮出水面。正义或许会迟到，但永远不会缺席。'
        : '时间到了。虽然未能达成完美结局，但过程中的每一个选择都是珍贵的回忆。也许下一次，真相会被揭开。',
      genre: scriptManual?.genre || 'suspense',
      gCoinReward: totalReward,
      totalGCoin: gCoinBalance + totalReward,
      rankings: players.map((p, i) => ({
        playerId: p.userId,
        characterName: p.characterName || p.username,
        username: p.username,
        score: isWin ? 1000 - i * 100 : 500 - i * 50,
        gCoinEarned: totalReward - i * 30,
        tasksCompleted: Math.floor(Math.random() * 3),
        isWinner: i === 0 && isWin,
      })),
      keyChoices: playerChoices.slice(-5).map((c, i) => ({
        round: c.round,
        choice: c.choice,
        consequence: i % 2 === 0 ? '推动了剧情发展' : '发现了重要线索',
        impact: i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'neutral' : 'negative',
      })),
      characterPerformance: players.map((p) => ({
        characterName: p.characterName || p.username,
        tasksCompleted: Math.floor(Math.random() * 3),
        totalTasks: 3,
        highlights: ['关键线索发现者', '推动了剧情转折'],
      })),
    };

    setGameResult(result);

    // 添加结局消息到 DM 记录
    setDmMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'system',
        speaker: '系统',
        content: `【${result.title}】\n\n${result.narrative}\n\n获得 G币: +${totalReward}`,
        emotion: isWin ? '喜悦' : '感伤',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      await apiClient.post(`/game/rooms/${code}/end`, { isWin });
    } catch {
      // 静默处理
    }
  };

  /* ---- 进入复盘聊天室 ---- */
  const enterReview = () => {
    setGamePhase('review');
    // 初始化复盘系统消息
    const systemMessages: ReviewMessage[] = [
      {
        id: Date.now(),
        sender: '系统',
        content: '欢迎来到复盘聊天室！在这里你可以自由讨论刚才的游戏过程。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      },
      {
        id: Date.now() + 1,
        sender: '系统',
        content: `游戏关键选择回顾：\n${playerChoices.map((c) => `第${c.round}轮: ${c.choice}`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'highlight',
      },
    ];
    setReviewMessages(systemMessages);
  };

  /* ---- 发送复盘消息 ---- */
  const handleSendReviewMessage = () => {
    if (!reviewInput.trim()) return;
    const newMessage: ReviewMessage = {
      id: Date.now(),
      sender: selectedCharacter?.name || '玩家',
      characterName: selectedCharacter?.name,
      content: reviewInput.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'chat',
    };
    setReviewMessages((prev) => [...prev, newMessage]);
    setReviewInput('');

    // 通过 Socket.IO 广播
    const socket = gameService.getSocket();
    if (socket) {
      socket.emit('game:chat', {
        roomCode: code,
        content: reviewInput.trim(),
        characterName: selectedCharacter?.name,
      });
    }
  };

  /* ---- 获取 Mock DM 响应 ---- */
  function getMockDmResponse(): DmMessage {
    const mockNarratives = [
      '你小心翼翼地行动起来。空气中弥漫着紧张的气息，每一步都伴随着木板吱呀的声响。突然，你注意到墙上的一幅画有些不对劲——它挂得稍微歪了一点，而画框边缘似乎有被反复触摸过的痕迹。',
      '你的举动引起了细微的变化。一阵冷风从走廊尽头吹来，带来了一声几乎听不见的低语。你屏住呼吸，试图分辨那声音的来源……',
      '在昏暗的灯光下，你发现地面上有一些不完整的脚印。它们似乎通向了一面看似普通的墙壁。当你靠近时，你感觉到了一丝若有若无的气流从墙壁的缝隙中渗出。',
    ];
    const mockEmotions = ['神秘', '紧张', '悬疑'];
    const mockChoicesList: DmChoice[][] = [
      [
        { id: 1, text: '检查那幅画', consequence: '可能发现隐藏的机关', taskHint: '探查者任务：发现隐藏细节' },
        { id: 2, text: '跟随冷风的方向', consequence: '可能找到密道入口' },
        { id: 3, text: '保持警惕，继续前进', consequence: '谨慎行事' },
      ],
      [
        { id: 1, text: '循着声音搜索', consequence: '可能发现什么' },
        { id: 2, text: '出声询问是谁在那里', consequence: '可能会吓跑对方', taskHint: '交涉者任务：获取情报' },
        { id: 3, text: '躲起来暗中观察', consequence: '安全第一' },
      ],
      [
        { id: 1, text: '检查墙壁是否有暗门', consequence: '可能发现新的通道', taskHint: '探查者任务：搜寻线索' },
        { id: 2, text: '蹲下查看脚印细节', consequence: '获取更多线索' },
        { id: 3, text: '退后几步，观察整体布局', consequence: '从宏观角度思考', taskHint: '智囊任务：分析推理' },
      ],
    ];
    const idx = Math.floor(Math.random() * mockNarratives.length);
    return {
      narrative: mockNarratives[idx],
      emotion: mockEmotions[idx],
      choices: mockChoicesList[idx],
    };
  }

  function getMockDmEntry(): DmChatEntry {
    const resp = getMockDmResponse();
    return {
      id: Date.now() + 1,
      role: 'dm',
      speaker: 'DM',
      content: resp.narrative,
      emotion: resp.emotion,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      choices: resp.choices,
    };
  }

  /* ---- 房主推进阶段 ---- */
  const handleAdvancePhase = () => {
    const phaseOrder: GamePhase[] = ['lobby', 'character', 'manual', 'playing', 'voting', 'ending', 'review'];
    const currentIdx = phaseOrder.indexOf(gamePhase);
    if (currentIdx < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIdx + 1];
      setGamePhase(nextPhase);

      if (nextPhase === 'playing' && gamePhase === 'manual') {
        handleStartGame();
      } else if (nextPhase === 'voting') {
        enterVotingPhase();
      } else if (nextPhase === 'review') {
        enterReview();
      }
    }
  };

  /* ---- 计算当前玩家是否房主 ---- */
  const isCurrentHost = useMemo(() => {
    // 简化判断：第一个加入的玩家或 room.host 匹配
    return players.some((p) => p.isHost && p.characterName === selectedCharacter?.name);
  }, [players, selectedCharacter]);

  /* ---------------------------------------------------------------- */
  /*  渲染主框架                                                        */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner text="正在加载游戏房间..." />
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-bg-primary">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/game/lobby')}>
          返回大厅
        </Button>
      </div>
    );
  }

  const diffInfo = DIFFICULTY_MAP[room?.difficulty || 'medium'];
  const genreInfo = scriptManual?.genre ? GENRE_MAP[scriptManual.genre] : null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-bg-primary">
      {/* ---- 房间头部 ---- */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-bg-secondary/80 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-text-primary">
            {room?.title || room?.scriptName || '游戏房间'}
          </h1>
          <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted">
            <span className="font-mono text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
              #{code}
            </span>
            <span className={`${diffInfo.color}`}>{diffInfo.label}</span>
            {genreInfo && (
              <span className={`flex items-center gap-1 ${genreInfo.color}`}>
                <genreInfo.icon className="w-3 h-3" />
                {genreInfo.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {players.length}/{room?.maxPlayers || '-'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* G币余额 */}
          <GCoinBadge amount={gCoinBalance} />

          {/* Socket 连接状态 */}
          <div
            className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-neon-green' : 'bg-neon-pink'}`}
            title={socketConnected ? '实时连接中' : '连接断开'}
          />

          <Button variant="ghost" size="sm" onClick={() => navigate('/game/lobby')}>
            <ChevronLeft className="w-4 h-4" />
            返回
          </Button>
        </div>
      </div>

      {/* ---- 阶段指示器 ---- */}
      <PhaseIndicator
        currentPhase={gamePhase}
        onPhaseChange={(phase) => {
          if (isCurrentHost) {
            setGamePhase(phase);
            if (phase === 'playing') handleStartGame();
            if (phase === 'voting') enterVotingPhase();
            if (phase === 'review') enterReview();
          }
        }}
        isHost={isCurrentHost}
      />

      {/* ---- 阶段内容 ---- */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {gamePhase === 'lobby' && (
            <LobbyPhase
              key="lobby"
              room={room}
              players={players}
              onEnterCharacter={() => setGamePhase('character')}
            />
          )}

          {gamePhase === 'character' && (
            <CharacterPhase
              key="character"
              room={room}
              characters={characters}
              players={players}
              selectedCharacter={selectedCharacter}
              isJoined={isJoined}
              joining={joining}
              characterTasks={characterTasks}
              onSelectCharacter={setSelectedCharacter}
              onJoin={handleJoin}
            />
          )}

          {gamePhase === 'manual' && (
            <ManualPhase
              key="manual"
              manual={scriptManual}
              starting={starting}
              hasJoined={isJoined}
              onStart={handleStartGame}
            />
          )}

          {gamePhase === 'playing' && (
            <PlayingPhase
              key="playing"
              dmMessages={dmMessages}
              currentChoices={currentChoices}
              playerInput={playerInput}
              sendingAction={sendingAction}
              chatLogOpen={chatLogOpen}
              charPanelOpen={charPanelOpen}
              selectedCharacter={selectedCharacter}
              players={players}
              characterTasks={characterTasks}
              roundCount={roundCount}
              scriptManual={scriptManual}
              onInputChange={setPlayerInput}
              onSend={handleSendAction}
              onChoice={handleChoice}
              onToggleChatLog={() => setChatLogOpen((v) => !v)}
              onToggleCharPanel={() => setCharPanelOpen((v) => !v)}
              messagesEndRef={messagesEndRef}
            />
          )}

          {gamePhase === 'voting' && (
            <VotingPhase
              key="voting"
              votingOptions={votingOptions}
              hasVoted={hasVoted}
              voteResult={voteResult}
              selectedCharacter={selectedCharacter}
              scriptManual={scriptManual}
              onVote={handleVote}
            />
          )}

          {gamePhase === 'ending' && (
            <EndingPhase
              key="ending"
              gameResult={gameResult}
              characterTasks={characterTasks}
              onEnterReview={enterReview}
              onRestart={() => window.location.reload()}
              onBack={() => navigate('/game/lobby')}
            />
          )}

          {gamePhase === 'review' && (
            <ReviewPhase
              key="review"
              reviewMessages={reviewMessages}
              reviewInput={reviewInput}
              gameResult={gameResult}
              gameStats={gameStats}
              players={players}
              playerChoices={playerChoices}
              onInputChange={setReviewInput}
              onSend={handleSendReviewMessage}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ---- 房主控制条（仅在 playing 阶段显示） ---- */}
      {isCurrentHost && gamePhase === 'playing' && (
        <div className="shrink-0 px-4 py-2 bg-bg-secondary/60 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-text-muted">房主控制</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={enterVotingPhase}>
              <Vote className="w-3.5 h-3.5 mr-1" />
              进入投票
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleEndGame(false)}>
              <XCircle className="w-3.5 h-3.5 mr-1" />
              提前结束
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 1: 等待大厅                                                   */
/* ------------------------------------------------------------------ */

function LobbyPhase({
  room,
  players,
  onEnterCharacter,
}: {
  room: RoomData | null;
  players: PlayerData[];
  onEnterCharacter: () => void;
}) {
  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <motion.div
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Users className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h2 className="text-xl font-bold text-text-primary mb-1">{room?.scriptName || '游戏房间'}</h2>
          <p className="text-sm text-text-muted">等待玩家加入...</p>
        </div>

        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">已加入玩家 ({players.length})</p>
          <div className="flex flex-wrap justify-center gap-2">
            {players.length === 0 ? (
              <p className="text-xs text-text-muted">暂无玩家</p>
            ) : (
              players.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-tertiary/60 border border-white/5 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-[10px] font-bold text-white">
                    {(p.characterName?.[0] || p.username[0]).toUpperCase()}
                  </div>
                  <span className="text-text-primary">{p.characterName || p.username}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <Button size="lg" onClick={onEnterCharacter} icon={<ArrowRight className="w-5 h-5" />}>
          进入角色选择
        </Button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 2: 角色选择                                                   */
/* ------------------------------------------------------------------ */

function CharacterPhase({
  room,
  characters,
  players,
  selectedCharacter,
  isJoined,
  joining,
  characterTasks,
  onSelectCharacter,
  onJoin,
}: {
  room: RoomData | null;
  characters: Character[];
  players: PlayerData[];
  selectedCharacter: Character | null;
  isJoined: boolean;
  joining: boolean;
  characterTasks: CharacterTask[];
  onSelectCharacter: (c: Character) => void;
  onJoin: () => void;
}) {
  return (
    <motion.div
      className="h-full flex gap-0 lg:gap-6 p-4 lg:p-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {/* 左侧：角色列表 */}
      <div className="flex-1 min-w-0">
        {room && (
          <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-bg-secondary/60 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">{room.scriptName}</h3>
              <p className="text-xs text-text-muted mt-0.5">
                房主: {room.host || '等待中'} · 难度: {DIFFICULTY_MAP[room.difficulty]?.label || room.difficulty}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-purple" />
            可选角色
            <span className="text-xs text-text-muted font-normal">({characters.length}个角色)</span>
          </h2>
          {isJoined && (
            <p className="text-xs text-neon-green mt-1">已加入房间，等待房主开始游戏...</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              selected={selectedCharacter?.id === char.id}
              onSelect={() => onSelectCharacter(char)}
              disabled={isJoined}
              tasks={selectedCharacter?.id === char.id ? characterTasks : undefined}
            />
          ))}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无可用角色数据</p>
          </div>
        )}

        {/* 移动端底部浮动按钮：选完角色后显示 */}
        {!isJoined && selectedCharacter && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="rounded-xl bg-bg-secondary/95 backdrop-blur-md border border-white/10 p-4 shadow-lg shadow-black/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {selectedCharacter.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{selectedCharacter.name}</p>
                  <p className="text-xs text-text-muted">{selectedCharacter.voicePreset} · 已就绪</p>
                </div>
              </div>
              <Button fullWidth size="md" onClick={onJoin} loading={joining} className="animate-pulse">
                <Play className="w-4 h-4 mr-2" />
                选择角色并进入游戏
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：玩家列表 + 加入按钮 */}
      <div className="hidden lg:flex flex-col w-64 shrink-0 gap-4">
        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-sm font-medium text-text-primary">
            <Users className="w-4 h-4 text-neon-blue" />
            房间玩家
            <span className="text-xs text-text-muted">({players.length})</span>
          </div>
          <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">暂无玩家加入</p>
            ) : (
              players.map((p) => <PlayerBadge key={p.userId} player={p} />)
            )}
          </div>
        </div>

        {!isJoined && (
          <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
            {selectedCharacter ? (
              <div>
                <p className="text-xs text-text-muted mb-2">已选择角色:</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white">
                    {selectedCharacter.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{selectedCharacter.name}</p>
                    <p className="text-[10px] text-text-muted">{selectedCharacter.voicePreset}</p>
                  </div>
                </div>
                <Button fullWidth size="md" onClick={onJoin} loading={joining} className="animate-pulse">
                  <Play className="w-4 h-4 mr-2" />
                  选择角色并进入游戏
                </Button>
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-2">选择一个角色开始游戏</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 3: 游戏说明书                                                  */
/* ------------------------------------------------------------------ */

function ManualPhase({
  manual,
  starting,
  hasJoined,
  onStart,
}: {
  manual: ScriptManual | null;
  starting: boolean;
  hasJoined: boolean;
  onStart: () => void;
}) {
  if (!manual) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="加载游戏说明书..." />
      </div>
    );
  }

  const genreInfo = manual.genre ? GENRE_MAP[manual.genre] : null;

  return (
    <motion.div
      className="h-full overflow-y-auto p-4 lg:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gradient">{manual.title}</h1>
            {genreInfo && (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${genreInfo.color} bg-bg-tertiary/60 border-white/10`}>
                <genreInfo.icon className="w-3 h-3" />
                {genreInfo.label}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted">游戏说明书 · 请仔细阅读</p>
        </div>

        {/* 胜负条件 */}
        {(manual.winCondition || manual.loseCondition) && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {manual.winCondition && (
              <div className="rounded-xl bg-neon-green/5 border border-neon-green/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  <h3 className="text-sm font-semibold text-neon-green">胜利条件</h3>
                </div>
                <p className="text-xs text-text-secondary">{manual.winCondition}</p>
              </div>
            )}
            {manual.loseCondition && (
              <div className="rounded-xl bg-neon-pink/5 border border-neon-pink/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-neon-pink" />
                  <h3 className="text-sm font-semibold text-neon-pink">失败条件</h3>
                </div>
                <p className="text-xs text-text-secondary">{manual.loseCondition}</p>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-neon-purple" />
            故事背景
          </h2>
          <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{manual.overview}</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-neon-cyan" />
            游戏规则
          </h2>
          <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
            <ul className="space-y-2.5">
              {manual.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-[10px] text-neon-cyan font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Sword className="w-4 h-4 text-neon-pink" />
            角色类型说明
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {manual.roles.map((role, i) => (
              <div key={i} className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{role.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">{role.description}</p>
                <div className="flex items-start gap-1.5 text-xs text-text-muted">
                  <Wand2 className="w-3 h-3 mt-0.5 shrink-0 text-neon-purple" />
                  <span>{role.responsibilities}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-neon-pink" />
            游玩建议
          </h2>
          <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
            <ul className="space-y-2">
              {manual.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="shrink-0 text-neon-purple">*</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flex justify-center pb-8">
          {hasJoined ? (
            <Button size="lg" onClick={onStart} loading={starting} icon={<Play className="w-5 h-5" />}>
              开始游戏
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-text-muted mb-2">请先在"角色选择"页面选择一个角色并加入房间</p>
              <Button variant="secondary" size="md" disabled>
                请先选择角色
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 4: DM 驱动游戏进行中                                            */
/* ------------------------------------------------------------------ */

function PlayingPhase({
  dmMessages,
  currentChoices,
  playerInput,
  sendingAction,
  chatLogOpen,
  charPanelOpen,
  selectedCharacter,
  players,
  characterTasks,
  roundCount,
  scriptManual,
  onInputChange,
  onSend,
  onChoice,
  onToggleChatLog,
  onToggleCharPanel,
  messagesEndRef,
}: {
  dmMessages: DmChatEntry[];
  currentChoices: DmChoice[];
  playerInput: string;
  sendingAction: boolean;
  chatLogOpen: boolean;
  charPanelOpen: boolean;
  selectedCharacter: Character | null;
  players: PlayerData[];
  characterTasks: CharacterTask[];
  roundCount: number;
  scriptManual: ScriptManual | null;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onChoice: (id: number) => void;
  onToggleChatLog: () => void;
  onToggleCharPanel: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <motion.div
      className="h-full flex"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 回合与任务状态条 */}
        <div className="shrink-0 px-4 py-2 bg-bg-secondary/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              第 <span className="text-neon-cyan font-bold">{roundCount}</span> 轮
            </span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-xs text-text-muted">
              任务: <span className="text-neon-green">{characterTasks.filter((t) => t.isCompleted).length}</span>
              /{characterTasks.length}
            </span>
          </div>
          {scriptManual?.genre && (
            <span className="text-xs text-text-muted">
              剧本类型: <span className="text-neon-purple">{GENRE_MAP[scriptManual.genre]?.label || scriptManual.genre}</span>
            </span>
          )}
        </div>

        {/* 聊天消息 */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {dmMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">等待游戏开始...</p>
              <p className="text-xs mt-1">房主点击"开始游戏"后，剧情将由此展开</p>
            </div>
          ) : (
            dmMessages.map((entry) => {
              const isDm = entry.role === 'dm';
              const isSystem = entry.role === 'system';
              return (
                <motion.div
                  key={entry.id}
                  className={`flex gap-3 ${isDm ? '' : 'flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDm
                        ? 'bg-gradient-to-br from-neon-blue to-neon-cyan text-white shadow-[0_0_10px_rgba(59,207,227,0.3)]'
                        : isSystem
                          ? 'bg-bg-tertiary text-text-muted border border-white/10'
                          : 'bg-gradient-to-br from-neon-purple to-neon-pink text-white'
                    }`}
                  >
                    {isDm ? 'DM' : isSystem ? 'SYS' : selectedCharacter?.name?.[0] || 'P'}
                  </div>

                  <div className={`flex-1 min-w-0 max-w-[75%] ${isDm ? '' : 'flex flex-col items-end'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isDm ? '' : 'flex-row-reverse'}`}>
                      <span className={`text-xs font-medium ${isDm ? 'text-neon-cyan' : 'text-neon-purple'}`}>
                        {entry.speaker}
                      </span>
                      {entry.emotion && (
                        <span className="text-[10px] text-text-muted italic">[{entry.emotion}]</span>
                      )}
                      <span className="text-[10px] text-text-muted">{entry.timestamp}</span>
                    </div>

                    <div
                      className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isDm
                          ? 'bg-neon-blue/10 border border-neon-blue/30 text-text-primary rounded-tl-sm'
                          : isSystem
                            ? 'bg-bg-tertiary border border-white/10 text-text-muted rounded-tr-sm'
                            : 'bg-neon-purple/10 border border-neon-purple/30 text-text-primary rounded-tr-sm'
                      }`}
                    >
                      {entry.content}

                      {/* 任务更新提示 */}
                      {entry.taskUpdate && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1.5 text-xs text-neon-green">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>任务完成: {entry.taskUpdate.title}</span>
                            <span className="text-neon-yellow flex items-center gap-0.5">
                              <Coins className="w-2.5 h-2.5" />
                              +{entry.taskUpdate.rewardGCoin}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* DM 消息内嵌选择 */}
                      {isDm && entry.choices && entry.choices.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">选择你的行动</p>
                          {entry.choices.map((ch, idx) => (
                            <button
                              key={ch.id}
                              onClick={() => onChoice(ch.id)}
                              className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg bg-bg-tertiary/60 border border-white/5 hover:border-neon-purple/40 hover:bg-neon-purple/10 transition-all text-xs"
                            >
                              <span className="shrink-0 w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-[9px] text-neon-purple font-bold">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <div className="min-w-0">
                                <span className="text-text-primary">{ch.text}</span>
                                {ch.consequence && (
                                  <p className="text-[10px] text-text-muted italic mt-0.5">{ch.consequence}</p>
                                )}
                                {ch.taskHint && (
                                  <p className="text-[10px] text-neon-green mt-0.5 flex items-center gap-0.5">
                                    <Target className="w-2.5 h-2.5" />
                                    {ch.taskHint}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 独立选择面板 */}
        {currentChoices.length > 0 && dmMessages.length > 0 && (
          <div className="shrink-0 px-4 lg:px-6 py-3 border-t border-white/5 bg-bg-secondary/40">
            <div className="flex flex-wrap gap-2">
              {currentChoices.map((ch, idx) => (
                <motion.button
                  key={ch.id}
                  onClick={() => onChoice(ch.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-white/10 text-sm text-text-primary hover:border-neon-purple/40 hover:bg-neon-purple/10 transition-all"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-[10px] text-neon-purple font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{ch.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="shrink-0 p-4 lg:px-6 bg-bg-secondary/60 border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="输入你的对话或行动描述..."
              className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors"
              disabled={dmMessages.length === 0}
            />
            <motion.button
              onClick={onSend}
              disabled={!playerInput.trim() || sendingAction || dmMessages.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={playerInput.trim() ? { scale: 1.02 } : undefined}
              whileTap={playerInput.trim() ? { scale: 0.98 } : undefined}
            >
              {sendingAction ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="hidden lg:flex flex-col w-56 shrink-0 bg-bg-secondary/30 border-l border-white/5">
        <button
          onClick={onToggleChatLog}
          className="flex items-center gap-2 px-4 py-3 border-b border-white/5 text-xs font-medium text-text-primary hover:bg-white/5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-neon-blue" />
          {chatLogOpen ? '收起日志' : '展开日志'}
          <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${chatLogOpen ? 'rotate-90' : ''}`} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {chatLogOpen && (
            <div className="p-3 space-y-2">
              <p className="text-[10px] text-text-muted uppercase tracking-wider px-1 mb-2">聊天记录</p>
              {dmMessages.length === 0 ? (
                <p className="text-[10px] text-text-muted text-center py-4">暂无记录</p>
              ) : (
                dmMessages
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((entry) => (
                    <div key={entry.id} className="text-[11px] px-2 py-1.5 rounded-lg bg-bg-tertiary/40 border border-white/5">
                      <span className={`font-medium ${entry.role === 'dm' ? 'text-neon-cyan' : 'text-neon-purple'}`}>
                        {entry.speaker}
                      </span>
                      :{' '}
                      <span className="text-text-muted">
                        {entry.content.length > 40 ? entry.content.slice(0, 40) + '...' : entry.content}
                      </span>
                    </div>
                  ))
              )}
            </div>
          )}

          {!chatLogOpen && charPanelOpen && (
            <div className="p-3">
              <p className="text-[10px] text-text-muted uppercase tracking-wider px-1 mb-2">角色信息</p>
              {selectedCharacter ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-lg font-bold text-white">
                      {selectedCharacter.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{selectedCharacter.name}</p>
                      <p className="text-[10px] text-text-muted">{selectedCharacter.gender} · {selectedCharacter.age}岁</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] text-neon-purple">
                      <Volume2 className="w-2.5 h-2.5" />
                      {selectedCharacter.voicePreset}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-[10px] text-neon-cyan">
                      <Heart className="w-2.5 h-2.5" />
                      {selectedCharacter.personality.slice(0, 12)}...
                    </span>
                  </div>

                  <div className="border-t border-white/5" />

                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-text-muted mb-0.5">背景</p>
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">{selectedCharacter.background}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neon-pink/80 mb-0.5 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        秘密
                      </p>
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">{selectedCharacter.secret}</p>
                    </div>
                  </div>

                  {/* 任务列表 */}
                  {characterTasks.length > 0 && (
                    <div className="border-t border-white/5 pt-2">
                      <p className="text-[10px] text-text-muted mb-1.5">当前任务</p>
                      <div className="space-y-1">
                        {characterTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded ${
                              task.isCompleted ? 'text-neon-green bg-neon-green/5' : 'text-text-secondary bg-bg-tertiary/30'
                            }`}
                          >
                            {task.isCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Target className="w-2.5 h-2.5" />}
                            <span className="flex-1 truncate">{task.title}</span>
                            <span className="text-neon-yellow">{task.rewardGCoin}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-2">
                    <p className="text-[10px] text-text-muted mb-1.5">房间玩家</p>
                    <div className="space-y-1.5">
                      {players.map((p) => (
                        <div key={p.userId} className="flex items-center gap-2 text-[11px]">
                          <div className="w-5 h-5 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-[8px] font-bold text-text-secondary">
                            {p.username[0]}
                          </div>
                          <span className="text-text-primary truncate">{p.characterName || p.username}</span>
                          {p.isHost && <Star className="w-2.5 h-2.5 text-neon-cyan shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-text-muted text-center py-4">未选择角色</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggleCharPanel}
          className="flex items-center gap-2 px-4 py-3 border-t border-white/5 text-xs font-medium text-text-primary hover:bg-white/5 transition-colors"
        >
          <User className="w-3.5 h-3.5 text-neon-purple" />
          {charPanelOpen ? '收起角色' : '展开角色'}
          <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${charPanelOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 5: 投票指认                                                   */
/* ------------------------------------------------------------------ */

function VotingPhase({
  votingOptions,
  hasVoted,
  voteResult,
  selectedCharacter,
  scriptManual,
  onVote,
}: {
  votingOptions: { id: number; name: string; votes: number }[];
  hasVoted: boolean;
  voteResult: { targetName: string; isCorrect: boolean } | null;
  selectedCharacter: Character | null;
  scriptManual: ScriptManual | null;
  onVote: (targetId: number) => void;
}) {
  const genreInfo = scriptManual?.genre ? GENRE_MAP[scriptManual.genre] : null;

  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center p-6 overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Vote className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">投票指认</h2>
          <p className="text-sm text-text-muted">
            {genreInfo?.label || '悬疑'}剧本 · {scriptManual?.winCondition || '找出真凶'}
          </p>
        </div>

        {!hasVoted ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary text-center">请选择你认为是凶手的目标：</p>
            {votingOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => onVote(option.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-bg-secondary/60 border border-white/5 hover:border-neon-purple/40 hover:bg-neon-purple/5 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-sm font-bold text-white">
                  {option.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{option.name}</p>
                  <p className="text-xs text-text-muted">当前得票: {option.votes}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {voteResult ? (
                <div className={`text-4xl mb-2 ${voteResult.isCorrect ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {voteResult.isCorrect ? <CheckCircle2 className="w-16 h-16 mx-auto" /> : <XCircle className="w-16 h-16 mx-auto" />}
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
              )}
            </motion.div>

            {voteResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-lg font-bold text-text-primary">
                  你指认了 <span className="text-neon-purple">{voteResult.targetName}</span>
                </p>
                <p className={`text-sm mt-1 ${voteResult.isCorrect ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {voteResult.isCorrect ? '指认正确！真相大白！' : '指认错误...真凶仍然逍遥法外'}
                </p>
              </motion.div>
            )}

            {!voteResult && <p className="text-sm text-text-muted">正在统计投票结果...</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 6: 结局展示                                                   */
/* ------------------------------------------------------------------ */

function EndingPhase({
  gameResult,
  characterTasks,
  onEnterReview,
  onRestart,
  onBack,
}: {
  gameResult: GameResult | null;
  characterTasks: CharacterTask[];
  onEnterReview: () => void;
  onRestart: () => void;
  onBack: () => void;
}) {
  if (!gameResult) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="正在计算结局..." />
      </div>
    );
  }

  const completedTasks = characterTasks.filter((t) => t.isCompleted);
  const genreInfo = GENRE_MAP[gameResult.genre] || GENRE_MAP.other;

  return (
    <motion.div
      className="h-full overflow-y-auto p-4 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 结局标题 */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 text-xs text-neon-purple mb-4">
            <genreInfo.icon className="w-3 h-3" />
            {genreInfo.label} · 结局
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${gameResult.isWin ? 'text-neon-green' : 'text-neon-pink'}`}>
            {gameResult.title}
          </h2>

          <div className="w-16 h-0.5 mx-auto rounded-full bg-gradient-to-r from-neon-purple to-neon-blue" />
        </motion.div>

        {/* 结局叙述 */}
        <motion.div
          className="rounded-xl bg-bg-secondary/60 border border-white/5 p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{gameResult.narrative}</p>
        </motion.div>

        {/* G币奖励 */}
        <motion.div
          className="rounded-xl bg-neon-yellow/5 border border-neon-yellow/20 p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neon-yellow flex items-center gap-2">
              <Coins className="w-4 h-4" />
              G币奖励结算
            </h3>
            <span className="text-lg font-bold text-neon-yellow">+{gameResult.gCoinReward}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>胜利奖励</span>
              <span className="text-text-primary">{gameResult.isWin ? 200 : 50}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>任务完成 ({completedTasks.length}/{characterTasks.length})</span>
              <span className="text-text-primary">
                {completedTasks.reduce((sum, t) => sum + t.rewardGCoin, 0)}
              </span>
            </div>
            <div className="border-t border-white/5 pt-1.5 flex justify-between text-text-primary font-medium">
              <span>G币余额</span>
              <span className="text-neon-yellow">{gameResult.totalGCoin.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* 排行榜 */}
        <motion.div
          className="rounded-xl bg-bg-secondary/60 border border-white/5 p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            本局排名
          </h3>
          <div className="space-y-2">
            {gameResult.rankings.map((r, i) => (
              <div
                key={r.playerId}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  r.isWinner ? 'bg-neon-green/5 border border-neon-green/20' : 'bg-bg-tertiary/30'
                }`}
              >
                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-neon-yellow' : 'text-text-muted'}`}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white">
                  {r.characterName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{r.characterName}</p>
                  <p className="text-[10px] text-text-muted">{r.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{r.score}</p>
                  <p className="text-[10px] text-neon-yellow flex items-center justify-end gap-0.5">
                    <Coins className="w-2.5 h-2.5" />
                    {r.gCoinEarned}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 关键选择回顾 */}
        {gameResult.keyChoices.length > 0 && (
          <motion.div
            className="rounded-xl bg-bg-secondary/60 border border-white/5 p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-neon-cyan" />
              关键选择回顾
            </h3>
            <div className="space-y-2">
              {gameResult.keyChoices.map((kc, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      kc.impact === 'positive'
                        ? 'bg-neon-green/10 text-neon-green'
                        : kc.impact === 'negative'
                          ? 'bg-neon-pink/10 text-neon-pink'
                          : 'bg-bg-tertiary text-text-muted'
                    }`}
                  >
                    {kc.round}
                  </span>
                  <div className="flex-1">
                    <p className="text-text-primary">{kc.choice}</p>
                    <p className="text-text-muted">{kc.consequence}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <motion.div
          className="flex flex-col gap-2 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button size="lg" fullWidth onClick={onEnterReview} icon={<MessageSquare className="w-5 h-5" />}>
            进入复盘聊天室
          </Button>
          <Button size="md" fullWidth variant="secondary" onClick={onRestart} icon={<RefreshCw className="w-4 h-4" />}>
            再来一局
          </Button>
          <Button size="md" fullWidth variant="ghost" onClick={onBack} icon={<Home className="w-4 h-4" />}>
            返回大厅
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  阶段 7: 复盘聊天室 + 实时数据可视化                                   */
/* ------------------------------------------------------------------ */

function ReviewPhase({
  reviewMessages,
  reviewInput,
  gameResult,
  gameStats,
  players,
  playerChoices,
  onInputChange,
  onSend,
}: {
  reviewMessages: ReviewMessage[];
  reviewInput: string;
  gameResult: GameResult | null;
  gameStats: GameStats;
  players: PlayerData[];
  playerChoices: { round: number; choice: string }[];
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [reviewMessages]);

  const activityData = gameStats.playerActivity.map((p) => ({
    label: p.name,
    value: p.messages + p.choices,
    color: 'bg-neon-purple',
  }));
  const maxActivity = Math.max(...activityData.map((d) => d.value), 1);

  const completionData = gameStats.scriptCompletion.map((s) => ({
    label: s.phase,
    value: s.percentage,
    color: s.percentage === 100 ? 'bg-neon-green' : 'bg-neon-cyan',
  }));

  const genreColors = ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
  const genrePieData = gameStats.genreDistribution.map((g, i) => ({
    label: g.genre,
    value: g.count,
    color: genreColors[i % genreColors.length],
  }));

  return (
    <motion.div
      className="h-full flex gap-0 lg:gap-6 p-4 lg:p-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {/* 左侧：复盘聊天 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-neon-purple" />
          <h2 className="text-base font-semibold text-text-primary">复盘聊天室</h2>
          <span className="text-xs text-text-muted">({reviewMessages.length} 条消息)</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 bg-bg-secondary/30 rounded-xl border border-white/5 p-4">
          {reviewMessages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex gap-2 ${msg.type === 'chat' ? '' : 'justify-center'}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.type === 'chat' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {msg.sender[0]}
                </div>
              )}
              <div className={`max-w-[80%] ${msg.type === 'chat' ? '' : 'text-center'}`}>
                {msg.type === 'chat' && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-neon-cyan">{msg.sender}</span>
                    <span className="text-[10px] text-text-muted">{msg.timestamp}</span>
                  </div>
                )}
                <div
                  className={`inline-block px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.type === 'system'
                      ? 'bg-bg-tertiary/60 text-text-muted'
                      : msg.type === 'highlight'
                        ? 'bg-neon-purple/10 border border-neon-purple/20 text-text-primary'
                        : 'bg-bg-tertiary/40 text-text-secondary'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 复盘输入 */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={reviewInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="分享你的想法..."
            className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors"
          />
          <motion.button
            onClick={onSend}
            disabled={!reviewInput.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 右侧：数据可视化 */}
      <div className="hidden lg:flex flex-col w-80 shrink-0 gap-4">
        {/* 玩家活跃度 */}
        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-neon-cyan" />
            玩家活跃度
          </h3>
          <SimpleBarChart data={activityData} maxValue={maxActivity} color="bg-neon-purple" />
        </div>

        {/* 剧本完成度 */}
        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-neon-green" />
            剧本完成度
          </h3>
          <SimpleBarChart data={completionData} maxValue={100} />
        </div>

        {/* G币排行榜 */}
        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-neon-yellow" />
            G币排行榜
          </h3>
          <div className="space-y-2">
            {gameStats.gCoinLeaderboard.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-4 text-center font-bold ${i === 0 ? 'text-neon-yellow' : 'text-text-muted'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-text-secondary truncate">{entry.name}</span>
                <span className="text-neon-yellow flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {entry.gCoin}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 剧本类型分布 */}
        <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <PieChartIcon className="w-4 h-4 text-neon-pink" />
            剧本类型分布
          </h3>
          <SimplePieChart data={genrePieData} />
        </div>

        {/* 关键选择 */}
        {playerChoices.length > 0 && (
          <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-neon-purple" />
              你的关键选择
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {playerChoices.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-neon-purple/10 text-neon-purple flex items-center justify-center text-[10px] font-bold">
                    {c.round}
                  </span>
                  <span className="text-text-secondary truncate">{c.choice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  辅助图标组件                                                        */
/* ------------------------------------------------------------------ */

function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
