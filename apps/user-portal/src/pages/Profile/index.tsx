import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ScrollText,
  Gamepad2,
  Heart,
  Trophy,
  Star,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import Collection from './Collection';
import History from './History';

type TabKey = 'novels' | 'scripts' | 'history' | 'collections' | 'achievements';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { key: 'novels', label: '我的小说', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'scripts', label: '我的剧本', icon: <ScrollText className="w-4 h-4" /> },
  { key: 'history', label: '游戏历史', icon: <Gamepad2 className="w-4 h-4" /> },
  { key: 'collections', label: '收藏', icon: <Heart className="w-4 h-4" /> },
  { key: 'achievements', label: '成就', icon: <Trophy className="w-4 h-4" /> },
];

// Mock data for My Novels tab
const mockNovels = [
  { id: 1, title: '迷雾古堡', status: '已完成', wordCount: 35600, updatedAt: '2026-05-20' },
  { id: 2, title: '末日生存', status: '连载中', wordCount: 18900, updatedAt: '2026-06-01' },
  { id: 3, title: '星辰旅途', status: '草稿', wordCount: 5200, updatedAt: '2026-06-03' },
];

// Mock data for My Scripts tab
const mockScripts = [
  { id: 1, title: '赛博迷局', playerCount: 6, difficulty: '困难', updatedAt: '2026-05-18' },
  { id: 2, title: '谍影重重', playerCount: 8, difficulty: '中等', updatedAt: '2026-05-10' },
];

// Mock achievements
const mockAchievements = [
  { id: 1, title: '初入江湖', description: '完成第一局游戏', icon: '🏆', unlocked: true, unlockedAt: '2026-04-15' },
  { id: 2, title: '创作新星', description: '发布第一部小说', icon: '✍️', unlocked: true, unlockedAt: '2026-04-20' },
  { id: 3, title: '百战不殆', description: '累计完成10局游戏', icon: '⚔️', unlocked: false },
  { id: 4, title: '收藏达人', description: '收藏20部作品', icon: '📚', unlocked: false },
  { id: 5, title: '连胜纪录', description: '连续赢得5局游戏', icon: '🔥', unlocked: false },
  { id: 6, title: '社交蝴蝶', description: '与10位不同玩家组队', icon: '🦋', unlocked: true, unlockedAt: '2026-05-12' },
];

const statusColors: Record<string, string> = {
  '已完成': 'text-neon-green bg-neon-green/10 border-neon-green/20',
  '连载中': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  '草稿': 'text-text-muted bg-white/5 border-white/10',
};

const difficultyColors: Record<string, string> = {
  '简单': 'text-neon-green',
  '中等': 'text-neon-cyan',
  '困难': 'text-neon-pink',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('novels');

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-bg-secondary border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">请先登录</h2>
          <p className="text-text-secondary mb-6">登录后即可查看个人中心</p>
          <Button onClick={() => navigate('/login')} size="lg">
            去登录
          </Button>
        </motion.div>
      </div>
    );
  }

  // Mock user level info
  const userLevel = user.level || 12;
  const userExp = user.exp || 7500;
  const nextLevelExp = 10000;
  const expProgress = (userExp / nextLevelExp) * 100;

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="relative overflow-hidden">
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
              }}
            />

            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-neon-purple/5 to-transparent pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-neon-purple/20">
                  {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neon-green border-2 border-bg-secondary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-text-primary">
                    {user.username || '用户'}
                  </h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
                    Lv.{userLevel}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-3">{user.email}</p>

                {/* XP Progress */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                    <span>经验值</span>
                    <span>
                      {userExp.toLocaleString()} / {nextLevelExp.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                      initial={{ width: 0 }}
                      animate={{ width: `${expProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:self-start">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Settings className="w-4 h-4" />}
                >
                  设置
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-bg-secondary border border-white/5 rounded-xl mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
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
              {activeTab === 'novels' && (
                <div className="space-y-3">
                  {mockNovels.length === 0 ? (
                    <EmptyState
                      icon={<BookOpen className="w-14 h-14" />}
                      title="暂无小说"
                      description="开始创作你的第一部AI小说吧"
                    />
                  ) : (
                    mockNovels.map((novel, index) => (
                      <motion.div
                        key={novel.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card padding="md" hoverable glowOnHover className="cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-text-primary truncate">
                                  {novel.title}
                                </h4>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                    statusColors[novel.status] || ''
                                  }`}
                                >
                                  {novel.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-text-muted">
                                <span>{novel.wordCount.toLocaleString()} 字</span>
                                <span>更新于 {novel.updatedAt}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted shrink-0 ml-3" />
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'scripts' && (
                <div className="space-y-3">
                  {mockScripts.length === 0 ? (
                    <EmptyState
                      icon={<ScrollText className="w-14 h-14" />}
                      title="暂无剧本"
                      description="将你的小说转换为精彩的剧本杀吧"
                    />
                  ) : (
                    mockScripts.map((script, index) => (
                      <motion.div
                        key={script.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card padding="md" hoverable glowOnHover className="cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-text-primary mb-1 truncate">
                                {script.title}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-text-muted">
                                <span>{script.playerCount}人局</span>
                                <span className={difficultyColors[script.difficulty] || ''}>
                                  {script.difficulty}
                                </span>
                                <span>更新于 {script.updatedAt}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted shrink-0 ml-3" />
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'history' && <History />}

              {activeTab === 'collections' && <Collection />}

              {activeTab === 'achievements' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Card
                        padding="md"
                        className={`relative overflow-hidden ${
                          achievement.unlocked
                            ? 'border-neon-purple/20'
                            : 'opacity-60'
                        }`}
                      >
                        {achievement.unlocked && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neon-purple/10 to-transparent pointer-events-none" />
                        )}
                        <div className="flex items-start gap-4">
                          <div
                            className={`text-3xl ${
                              achievement.unlocked ? '' : 'grayscale'
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-text-primary">
                                {achievement.title}
                              </h4>
                              {achievement.unlocked && (
                                <Star className="w-3.5 h-3.5 text-neon-purple fill-neon-purple" />
                              )}
                            </div>
                            <p className="text-xs text-text-secondary mb-2">
                              {achievement.description}
                            </p>
                            {achievement.unlocked && achievement.unlockedAt && (
                              <p className="text-xs text-text-muted">
                                达成于 {achievement.unlockedAt}
                              </p>
                            )}
                            {!achievement.unlocked && (
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-neon-purple/50 to-neon-blue/50"
                                    style={{ width: '0%' }}
                                  />
                                </div>
                                <span className="text-xs text-text-muted">未达成</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// Reusable empty state component
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-text-muted/30 mb-4 flex justify-center">{icon}</div>
      <p className="text-text-secondary text-lg mb-2">{title}</p>
      <p className="text-text-muted text-sm">{description}</p>
    </div>
  );
}
