import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ScrollText,
  Crown,
  Medal,
  TrendingUp,
  Eye,
  Star,
  Heart,
  Gamepad2,
  Loader2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { novelService } from '@/services/novelService';
import type { NovelListItem } from '@asg/shared';

type TabKey = 'novels' | 'players' | 'scripts';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { key: 'novels', label: '热门小说', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'players', label: '玩家排行', icon: <Users className="w-4 h-4" /> },
  { key: 'scripts', label: '热门剧本', icon: <ScrollText className="w-4 h-4" /> },
];

// Mock data: Player Rankings
const mockPlayers = [
  { rank: 1, username: '暗夜猎手', level: 28, winRate: 85, totalGames: 156, totalScore: 13260 },
  { rank: 2, username: '星辰旅者', level: 25, winRate: 82, totalGames: 142, totalScore: 11640 },
  { rank: 3, username: '月影诗人', level: 23, winRate: 79, totalGames: 128, totalScore: 10112 },
  { rank: 4, username: '风之旅人', level: 21, winRate: 76, totalGames: 115, totalScore: 8740 },
  { rank: 5, username: '幽灵船长', level: 20, winRate: 74, totalGames: 108, totalScore: 7992 },
  { rank: 6, username: '极光行者', level: 19, winRate: 72, totalGames: 98, totalScore: 7056 },
  { rank: 7, username: '银翼杀手', level: 18, winRate: 70, totalGames: 92, totalScore: 6440 },
  { rank: 8, username: '雾中旅人', level: 17, winRate: 68, totalGames: 85, totalScore: 5780 },
  { rank: 9, username: '幻影猎手', level: 16, winRate: 65, totalGames: 78, totalScore: 5070 },
  { rank: 10, username: '星尘游侠', level: 15, winRate: 63, totalGames: 72, totalScore: 4536 },
];

// Mock data: Hot Scripts
const mockScripts = [
  { rank: 1, title: '迷雾古堡', author: '暗夜猎手', playerCount: 6, difficulty: '困难', playCount: 2340, rating: 4.9 },
  { rank: 2, title: '赛博迷局', author: '月影诗人', playerCount: 6, difficulty: '困难', playCount: 1890, rating: 4.8 },
  { rank: 3, title: '末日生存', author: '星辰旅者', playerCount: 8, difficulty: '中等', playCount: 1650, rating: 4.7 },
  { rank: 4, title: '谍影重重', author: '暗夜猎手', playerCount: 8, difficulty: '中等', playCount: 1420, rating: 4.6 },
  { rank: 5, title: '午夜列车', author: '风之旅人', playerCount: 6, difficulty: '简单', playCount: 1180, rating: 4.5 },
  { rank: 6, title: '龙与少年', author: '月影诗人', playerCount: 5, difficulty: '中等', playCount: 980, rating: 4.4 },
  { rank: 7, title: '量子玫瑰', author: '星辰旅者', playerCount: 4, difficulty: '简单', playCount: 820, rating: 4.3 },
  { rank: 8, title: '深海密语', author: '幽灵船长', playerCount: 6, difficulty: '困难', playCount: 750, rating: 4.2 },
  { rank: 9, title: '时空裂隙', author: '风之旅人', playerCount: 5, difficulty: '中等', playCount: 680, rating: 4.1 },
  { rank: 10, title: '血色黄昏', author: '幻影猎手', playerCount: 7, difficulty: '困难', playCount: 620, rating: 4.0 },
];

const rankIcons: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Crown className="w-5 h-5" />, color: 'text-yellow-400' },
  2: { icon: <Medal className="w-5 h-5" />, color: 'text-gray-300' },
  3: { icon: <Medal className="w-5 h-5" />, color: 'text-amber-600' },
};

const difficultyColors: Record<string, string> = {
  '简单': 'text-neon-green bg-neon-green/10 border-neon-green/20',
  '中等': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  '困难': 'text-neon-pink bg-neon-pink/10 border-neon-pink/20',
};

const genreLabels: Record<string, string> = {
  suspense: '悬疑',
  fantasy: '奇幻',
  scifi: '科幻',
  romance: '言情',
  horror: '恐怖',
  action: '动作',
  comedy: '喜剧',
  drama: '剧情',
  other: '其他',
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('novels');
  const [archivedNovels, setArchivedNovels] = useState<NovelListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'novels') {
      fetchArchivedNovels();
    }
  }, [activeTab]);

  const fetchArchivedNovels = async () => {
    setLoading(true);
    try {
      const result = await novelService.getArchived({ page: 1, pageSize: 20, sort: 'rating' });
      setArchivedNovels(result.data || []);
    } catch (err) {
      console.error('Failed to fetch archived novels:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">排行榜</h1>
          </div>
          <p className="text-text-secondary ml-[52px]">
            查看热门作品和顶尖玩家
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-1 p-1 bg-bg-secondary border border-white/5 rounded-xl mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all justify-center ${
                  activeTab === tab.key
                    ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hot Novels - Only Archived */}
              {activeTab === 'novels' && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                    </div>
                  ) : archivedNovels.length === 0 ? (
                    <div className="text-center py-20 text-text-muted">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>暂无已存档的小说</p>
                      <p className="text-sm mt-1">去小说陈列馆存档作品吧</p>
                    </div>
                  ) : (
                    archivedNovels.map((novel, index) => {
                      const rank = index + 1;
                      const rankInfo = rankIcons[rank];

                      return (
                        <motion.div
                          key={novel.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <Link to={`/novels/${novel.id}`}>
                            <Card padding="md" hoverable glowOnHover className="cursor-pointer">
                              <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    rankInfo
                                      ? 'bg-bg-tertiary'
                                      : 'bg-bg-tertiary text-text-muted'
                                  } ${rankInfo?.color || ''}`}
                                >
                                  {rankInfo ? (
                                    rankInfo.icon
                                  ) : (
                                    <span className="text-sm font-bold">{rank}</span>
                                  )}
                                </div>

                                {/* Cover */}
                                {novel.coverUrl && (
                                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                                  </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-text-primary truncate">
                                      {novel.title}
                                    </h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-muted">
                                      {genreLabels[novel.genre] || novel.genre}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-muted line-clamp-1">
                                    {novel.hook || novel.description}
                                  </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-5 shrink-0">
                                  <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{(novel.viewCount || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Star className="w-3.5 h-3.5 text-neon-purple" />
                                    <span>{novel.avgRating > 0 ? novel.avgRating.toFixed(1) : '暂无'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Heart className="w-3.5 h-3.5 text-neon-pink" />
                                    <span>{(novel.favoriteCount || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Player Rankings */}
              {activeTab === 'players' && (
                <div className="space-y-3">
                  {mockPlayers.map((player, index) => {
                    const rankInfo = rankIcons[player.rank];

                    return (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Card padding="md" hoverable glowOnHover>
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                rankInfo
                                  ? 'bg-bg-tertiary'
                                  : 'bg-bg-tertiary text-text-muted'
                              } ${rankInfo?.color || ''}`}
                            >
                              {rankInfo ? (
                                rankInfo.icon
                              ) : (
                                <span className="text-sm font-bold">{player.rank}</span>
                              )}
                            </div>

                            {/* Avatar + Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple/50 to-neon-blue/50 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {player.username.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-text-primary">
                                  {player.username}
                                </h4>
                                <p className="text-xs text-text-muted">
                                  Lv.{player.level}
                                </p>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-5 shrink-0">
                              <div className="text-center">
                                <p className="text-sm font-bold text-neon-green">
                                  {player.winRate}%
                                </p>
                                <p className="text-xs text-text-muted">胜率</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-text-primary">
                                  {player.totalGames}
                                </p>
                                <p className="text-xs text-text-muted">总局数</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-neon-purple">
                                  {player.totalScore.toLocaleString()}
                                </p>
                                <p className="text-xs text-text-muted">总分</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Hot Scripts */}
              {activeTab === 'scripts' && (
                <div className="space-y-3">
                  {mockScripts.map((script, index) => {
                    const rankInfo = rankIcons[script.rank];

                    return (
                      <motion.div
                        key={script.rank}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Card padding="md" hoverable glowOnHover className="cursor-pointer">
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                rankInfo
                                  ? 'bg-bg-tertiary'
                                  : 'bg-bg-tertiary text-text-muted'
                              } ${rankInfo?.color || ''}`}
                            >
                              {rankInfo ? (
                                rankInfo.icon
                              ) : (
                                <span className="text-sm font-bold">{script.rank}</span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-text-primary truncate">
                                  {script.title}
                                </h4>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                    difficultyColors[script.difficulty] || ''
                                  }`}
                                >
                                  {script.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-text-muted">
                                作者: {script.author} | {script.playerCount}人局
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-5 shrink-0">
                              <div className="flex items-center gap-1 text-xs text-text-muted">
                                <Gamepad2 className="w-3.5 h-3.5" />
                                <span>{script.playCount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-text-muted">
                                <Star className="w-3.5 h-3.5 text-neon-purple" />
                                <span>{script.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// Trophy icon component (not in lucide-react as default)
function Trophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
