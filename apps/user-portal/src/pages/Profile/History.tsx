import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Trophy, RotateCcw, Trash2 } from 'lucide-react';

interface HistoryRecord {
  id: number;
  scriptTitle: string;
  characterName: string;
  result: 'win' | 'lose' | 'draw';
  playedAt: string;
  score: number;
  playerCount: number;
}

const mockHistory: HistoryRecord[] = [
  {
    id: 1,
    scriptTitle: '迷雾古堡',
    characterName: '侦探陈先生',
    result: 'win',
    playedAt: '2026-06-04T20:30:00',
    score: 92,
    playerCount: 6,
  },
  {
    id: 2,
    scriptTitle: '赛博迷局',
    characterName: '特工零号',
    result: 'lose',
    playedAt: '2026-06-03T14:15:00',
    score: 67,
    playerCount: 5,
  },
  {
    id: 3,
    scriptTitle: '末日生存',
    characterName: '幸存者小林',
    result: 'win',
    playedAt: '2026-06-02T19:00:00',
    score: 88,
    playerCount: 8,
  },
  {
    id: 4,
    scriptTitle: '谍影重重',
    characterName: '双面间谍',
    result: 'draw',
    playedAt: '2026-05-31T21:45:00',
    score: 75,
    playerCount: 6,
  },
  {
    id: 5,
    scriptTitle: '星辰旅途',
    characterName: '舰长李云',
    result: 'win',
    playedAt: '2026-05-28T16:00:00',
    score: 95,
    playerCount: 4,
  },
  {
    id: 6,
    scriptTitle: '龙与少年',
    characterName: '驯龙师小雨',
    result: 'lose',
    playedAt: '2026-05-25T20:00:00',
    score: 54,
    playerCount: 5,
  },
];

const resultConfig: Record<string, { label: string; color: string; bg: string }> = {
  win: {
    label: '胜利',
    color: 'text-neon-green',
    bg: 'bg-neon-green/10 border-neon-green/20',
  },
  lose: {
    label: '失败',
    color: 'text-neon-pink',
    bg: 'bg-neon-pink/10 border-neon-pink/20',
  },
  draw: {
    label: '平局',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10 border-neon-cyan/20',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function History() {
  if (mockHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-14 h-14 mx-auto mb-4 text-text-muted/30" />
        <p className="text-text-secondary text-lg mb-2">暂无游戏记录</p>
        <p className="text-text-muted text-sm">快去游戏大厅开始你的第一局剧本杀吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {mockHistory.map((record, index) => {
          const config = resultConfig[record.result];

          return (
            <motion.div
              key={record.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div className="group bg-bg-secondary border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  {/* Rank / Index */}
                  <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center shrink-0 text-sm font-bold text-text-muted">
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-text-primary truncate">
                        {record.scriptTitle}
                      </h4>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {record.characterName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.playedAt)}
                      </span>
                      <span>{record.playerCount}人局</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-neon-purple" />
                      <span
                        className={`text-lg font-bold ${
                          record.score >= 80
                            ? 'text-neon-green'
                            : record.score >= 60
                            ? 'text-neon-cyan'
                            : 'text-neon-pink'
                        }`}
                      >
                        {record.score}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">得分</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      className="p-1.5 rounded-lg text-text-muted hover:text-neon-purple hover:bg-neon-purple/10 transition-colors"
                      title="再来一局"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-text-muted hover:text-neon-pink hover:bg-neon-pink/10 transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
