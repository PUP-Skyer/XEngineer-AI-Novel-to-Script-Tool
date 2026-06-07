import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Gamepad2,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Clock,
  Trophy,
  Heart,
  Send,
  Plus,
  Filter,
  Search,
  Play,
  Sparkles,
  Flame,
  BarChart3,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/services/apiClient';
import { getAllScripts, getScriptByTitle, getScriptIdByTitle } from '@/data/gameScripts';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface RoomData {
  id: number;
  roomCode: string;
  scriptTitle: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  rating?: number;
  tags?: string[];
}

interface CommentData {
  id: number;
  username: string;
  avatar?: string;
  text: string;
  rating: number;
  likes: number;
  liked: boolean;
  createdAt: string;
  scriptTitle?: string;
}

interface RoomStatEntry {
  day: string;
  activeRooms: number;
  newPlayers: number;
  dialoguesPlayed: number;
  avgSessionMinutes: number;
}

interface ScriptPopularityEntry {
  title: string;
  players: number;
  sessions: number;
  rating: number;
  completion: number;
}

interface LobbyStats {
  roomsActive: number;
  playersOnline: number;
  gamesToday: number;
  avgRating: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const statusLabels: Record<string, string> = {
  waiting: '等待中',
  playing: '进行中',
  finished: '已结束',
};

const statusColors: Record<string, string> = {
  waiting: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  playing: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  finished: 'text-text-muted bg-bg-tertiary border-white/5',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(hrs / 24);
  return `${days}天前`;
}

/* ------------------------------------------------------------------ */
/*  StarRating component                                              */
/* ------------------------------------------------------------------ */

function StarRating({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={`${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted'} transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatCard                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, gradient }: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <motion.div
      className="bg-bg-secondary/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function GameLobby() {
  const navigate = useNavigate();

  /* ---- data state ---- */
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LobbyStats>({
    roomsActive: 0, playersOnline: 0, gamesToday: 0, avgRating: 0,
  });
  const [hotRooms, setHotRooms] = useState<RoomData[]>([]);
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [roomStats, setRoomStats] = useState<RoomStatEntry[]>([]);
  const [scriptPopularity, setScriptPopularity] = useState<ScriptPopularityEntry[]>([]);

  /* ---- filter / sort state ---- */
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('hot');
  const [searchQuery, setSearchQuery] = useState('');

  /* ---- comment form state ---- */
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);

  /* ---- create room modal state ---- */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createScriptId, setCreateScriptId] = useState(1);
  const [createMaxPlayers, setCreateMaxPlayers] = useState(6);
  const [creating, setCreating] = useState(false);

  /* ---- derived values ---- */
  const genres = [...new Set(scriptPopularity.map((s) => s.title.split('·')[0] ?? s.title))];
  const genrePlayerCounts = genres.map((g) => {
    const total = scriptPopularity
      .filter((s) => (s.title.split('·')[0] ?? s.title) === g)
      .reduce((sum, s) => sum + s.players, 0);
    return { genre: g, players: total };
  });
  const maxGenrePlayers = Math.max(...genrePlayerCounts.map((g) => g.players), 1);

  const maxWeeklyRooms = Math.max(...roomStats.map((r) => r.activeRooms), 1);

  const filteredRooms = allRooms
    .filter((r) => statusFilter === 'all' || r.status === statusFilter)
    .filter((r) => searchQuery === '' || r.scriptTitle.includes(searchQuery) || r.roomCode.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'hot') return b.playerCount - a.playerCount;
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  /* ---- fetch data ---- */
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [roomsRes, commentsRes, statsRes, popRes] = await Promise.all([
          apiClient.get('/api/game/rooms', { params: { sort: 'hot', pageSize: 20 } }),
          apiClient.get('/api/game/comments'),
          apiClient.get('/api/game/room-stats').catch(() => ({ data: { data: [] } })),
          apiClient.get('/api/game/script-popularity').catch(() => ({ data: { data: [] } })),
        ]);

        if (cancelled) return;

        const rooms = roomsRes.data.data ?? [];
        const rStats = roomsRes.data.stats;

        setStats({
          roomsActive: rStats?.roomsActive ?? rooms.filter((r: RoomData) => r.status !== 'finished').length,
          playersOnline: rStats?.playersOnline ?? rooms.reduce((s: number, r: RoomData) => s + r.playerCount, 0),
          gamesToday: rStats?.gamesToday ?? 0,
          avgRating: rStats?.avgRating ?? 4.5,
        });

        // Top 6 hot rooms
        setHotRooms(rooms.slice(0, 6));
        setAllRooms(rooms);
        setComments(commentsRes.data.data ?? []);
        setRoomStats(statsRes.data.data ?? []);
        setScriptPopularity(popRes.data.data ?? []);
      } catch {
        // Fallback mock data
        if (!cancelled) {
          setStats({ roomsActive: 24, playersOnline: 186, gamesToday: 53, avgRating: 4.8 });
          setHotRooms(getMockHotRooms());
          setAllRooms(getMockAllRooms());
          setComments(getMockComments());
          setRoomStats(getMockRoomStats());
          setScriptPopularity(getMockScriptPopularity());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  /* ---- like comment ---- */
  const handleLike = async (commentId: number) => {
    try {
      const res = await apiClient.post(`/api/game/comments/${commentId}/like`);
      const updated: CommentData = res.data.data;
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    } catch {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
            : c,
        ),
      );
    }
  };

  /* ---- create room ---- */
  const handleCreateRoom = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await apiClient.post('/api/game/rooms', {
        scriptId: createScriptId,
        maxPlayers: createMaxPlayers,
      });
      const newRoom = res.data?.data;
      if (newRoom?.roomCode) {
        setShowCreateModal(false);
        navigate(`/game/room/${newRoom.roomCode}?scriptId=${createScriptId}`);
      }
    } catch {
      // Fallback: create locally and navigate
      const mockCode = `ROOM${Date.now().toString(36).toUpperCase()}`;
      const scriptNames = ['迷雾古堡', '末日生存', '赛博迷局'];
      const newRoom: RoomData = {
        id: Date.now(),
        roomCode: mockCode,
        scriptTitle: scriptNames[createScriptId - 1] || '迷雾古堡',
        status: 'waiting',
        playerCount: 1,
        maxPlayers: createMaxPlayers,
        hostName: '我',
        rating: 0,
      };
      setAllRooms((prev) => [newRoom, ...prev]);
      setShowCreateModal(false);
      navigate(`/game/room/${mockCode}?scriptId=${createScriptId}`);
    } finally {
      setCreating(false);
    }
  };

  /* ---- submit comment ---- */
  const handleSubmitComment = async () => {
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await apiClient.post('/api/game/comments', {
        username: commentName.trim(),
        text: commentText.trim(),
        rating: commentRating,
      });
      const newComment: CommentData = res.data.data ?? {
        id: Date.now(),
        username: commentName.trim(),
        text: commentText.trim(),
        rating: commentRating,
        likes: 0,
        liked: false,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setCommentRating(5);
    } catch {
      // Fallback: add locally
      setComments((prev) => [
        {
          id: Date.now(),
          username: commentName.trim(),
          text: commentText.trim(),
          rating: commentRating,
          likes: 0,
          liked: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setCommentText('');
      setCommentRating(5);
    } finally {
      setSubmittingComment(false);
    }
  };

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载游戏大厅..." />
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ========================================================== */}
        {/*  HEADER TITLE                                              */}
        {/* ========================================================== */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">游戏大厅</h1>
          </div>
          <p className="text-text-secondary ml-[52px] text-sm">
            发现热门剧本，加入房间，开始你的推理之旅
          </p>
        </motion.div>

        {/* ========================================================== */}
        {/*  STATS BANNER                                              */}
        {/* ========================================================== */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
        >
          <StatCard icon={Activity} label="活跃房间" value={stats.roomsActive} gradient="from-neon-purple to-neon-blue" />
          <StatCard icon={Users} label="在线玩家" value={stats.playersOnline} gradient="from-neon-cyan to-teal-400" />
          <StatCard icon={Gamepad2} label="今日游戏" value={stats.gamesToday} gradient="from-neon-pink to-rose-400" />
          <StatCard icon={Star} label="平均评分" value={stats.avgRating.toFixed(1)} gradient="from-yellow-500 to-orange-400" />
        </motion.div>

        {/* ========================================================== */}
        {/*  热门房间                                                  */}
        {/* ========================================================== */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Flame className="w-5 h-5 text-neon-pink" />
              热门房间
              <span className="text-xs font-normal text-text-muted ml-1">实时热度</span>
            </h2>
            <Button size="sm" variant="ghost" icon={<Sparkles className="w-3.5 h-3.5" />}>
              查看更多
            </Button>
          </div>

          {hotRooms.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-bg-secondary/40 rounded-2xl border border-white/5">
              <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无热门房间</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotRooms.map((room, i) => (
                <motion.div
                  key={room.id ?? room.roomCode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <div className="group relative bg-bg-secondary/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-neon-purple/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      const scriptId = getScriptIdByTitle(room.scriptTitle);
                      navigate(`/game/room/${room.roomCode}?scriptId=${scriptId}`);
                    }}
                  >
                    {/* Heat indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-neon-pink">
                      <Flame className="w-3 h-3" />
                      <span>{(i + 1) * 12}</span>
                    </div>

                    <h3 className="text-base font-semibold text-text-primary mb-3 pr-14">
                      {room.scriptTitle}
                    </h3>

                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="flex items-center gap-1 text-text-secondary">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-text-primary font-medium">{room.playerCount}</span>
                        <span className="text-text-muted">/{room.maxPlayers}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${statusColors[room.status]}`}>
                        {statusLabels[room.status]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        房主: {room.hostName}
                      </span>
                      <Button
                        size="sm"
                        variant={room.status === 'waiting' ? 'primary' : 'secondary'}
                        disabled={room.status !== 'waiting'}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const scriptId = getScriptIdByTitle(room.scriptTitle);
                          navigate(`/game/room/${room.roomCode}?scriptId=${scriptId}`);
                        }}
                      >
                        {room.status === 'waiting' ? '加入' : '已开始'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ========================================================== */}
        {/*  所有房间                                                  */}
        {/* ========================================================== */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-neon-cyan" />
              所有房间
              <span className="text-xs font-normal text-text-muted ml-1">共 {allRooms.length} 间</span>
            </h2>
            <Button
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateModal(true)}
            >
              创建房间
            </Button>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-1 bg-bg-secondary/60 border border-white/5 rounded-xl p-1">
              {[
                { key: 'all', label: '全部' },
                { key: 'waiting', label: '等待中' },
                { key: 'playing', label: '进行中' },
                { key: 'finished', label: '已结束' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    statusFilter === f.key
                      ? 'bg-neon-purple/20 text-neon-purple shadow-sm'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索房间名称或代码..."
                className="w-full pl-9 pr-3 py-2 bg-bg-secondary/60 border border-white/5 rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/30 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-bg-secondary/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-purple/30 cursor-pointer"
              >
                <option value="hot">按热度</option>
                <option value="newest">最新创建</option>
                <option value="rating">按评分</option>
              </select>
            </div>
          </div>

          {/* Room list */}
          {sortedRooms.length === 0 ? (
            <div className="text-center py-16 text-text-muted bg-bg-secondary/40 rounded-2xl border border-white/5">
              <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">暂无符合条件的房间</p>
              <p className="text-xs mt-1">试试调整筛选条件或创建一个新房间</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRooms.map((room, i) => (
                <motion.div
                  key={room.id ?? room.roomCode + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.025 * i }}
                >
                  <div
                    className="flex items-center justify-between bg-bg-secondary/40 hover:bg-bg-secondary/80 border border-white/5 hover:border-white/10 rounded-xl px-5 py-4 transition-all cursor-pointer group"
                    onClick={() => {
                      const scriptId = getScriptIdByTitle(room.scriptTitle);
                      navigate(`/game/room/${room.roomCode}?scriptId=${scriptId}`);
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Room code badge */}
                      <div className="shrink-0">
                        <span className="font-mono text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg px-3 py-1.5 tracking-wider">
                          {room.roomCode}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-text-primary truncate">
                          {room.scriptTitle}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="text-text-secondary">{room.playerCount}</span>/{room.maxPlayers}
                          </span>
                          <span className="text-xs text-text-muted">房主: {room.hostName}</span>
                          {room.rating && (
                            <span className="text-xs flex items-center gap-0.5 text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {room.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusColors[room.status]}`}>
                        {statusLabels[room.status]}
                      </span>
                      <Button
                        size="sm"
                        variant={room.status === 'waiting' ? 'primary' : 'secondary'}
                        disabled={room.status !== 'waiting'}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const scriptId = getScriptIdByTitle(room.scriptTitle);
                          navigate(`/game/room/${room.roomCode}?scriptId=${scriptId}`);
                        }}
                        icon={room.status === 'waiting' ? <Play className="w-3 h-3" /> : undefined}
                      >
                        {room.status === 'waiting' ? '加入' : room.status === 'playing' ? '观战' : '查看'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ========================================================== */}
        {/*  数据统计                                                  */}
        {/* ========================================================== */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-neon-purple" />
            <h2 className="text-xl font-bold text-text-primary">数据统计</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ---- Weekly activity chart ---- */}
            <div className="bg-bg-secondary/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-neon-cyan" />
                  周活跃趋势
                </h3>
                <span className="text-[10px] text-text-muted">活跃房间数/天</span>
              </div>

              {roomStats.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs">暂无数据</div>
              ) : (
                <div className="flex items-end justify-between gap-1.5 h-32 pt-2">
                  {roomStats.map((entry, idx) => {
                    const heightPct = (entry.activeRooms / maxWeeklyRooms) * 100;
                    return (
                      <div key={entry.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <motion.div
                          className="w-full rounded-t-md bg-gradient-to-t from-neon-cyan/60 to-neon-cyan/20 hover:from-neon-cyan/80 hover:to-neon-cyan/40 transition-colors relative group/bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(heightPct, 4)}%` }}
                          transition={{ duration: 0.6, delay: 0.05 * idx }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-bg-elevated border border-white/10 rounded-md px-2 py-1 text-[10px] text-text-primary whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                            {entry.activeRooms} 房间
                          </div>
                        </motion.div>
                        <span className="text-[10px] text-text-muted mt-1">
                          {entry.day.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---- Script popularity ranking ---- */}
            <div className="bg-bg-secondary/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  剧本热度排行
                </h3>
                <span className="text-[10px] text-text-muted">玩家数</span>
              </div>

              {scriptPopularity.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs">暂无数据</div>
              ) : (
                <div className="space-y-2.5">
                  {scriptPopularity.slice(0, 6).map((script, idx) => {
                    const maxPlayers = Math.max(...scriptPopularity.map((s) => s.players), 1);
                    const barPct = (script.players / maxPlayers) * 100;
                    const gradients = [
                      'from-neon-purple to-neon-blue',
                      'from-neon-cyan to-teal-400',
                      'from-neon-pink to-rose-400',
                      'from-yellow-500 to-orange-400',
                      'from-green-500 to-emerald-400',
                      'from-blue-500 to-indigo-400',
                    ];
                    return (
                      <div key={script.title} className="flex items-center gap-2">
                        <span className="w-4 text-center text-xs font-bold text-text-muted">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-text-primary truncate">{script.title}</span>
                            <span className="text-[10px] text-text-muted shrink-0 ml-2">{script.players}</span>
                          </div>
                          <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${gradients[idx % gradients.length]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${barPct}%` }}
                              transition={{ duration: 0.8, delay: 0.08 * idx }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---- Player count by genre ---- */}
            <div className="bg-bg-secondary/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  玩家偏好分布
                </h3>
                <span className="text-[10px] text-text-muted">玩家数</span>
              </div>

              {genrePlayerCounts.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs">暂无数据</div>
              ) : (
                <div className="space-y-3">
                  {genrePlayerCounts.map((g) => {
                    const pct = (g.players / maxGenrePlayers) * 100;
                    return (
                      <div key={g.genre}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-primary font-medium">{g.genre}</span>
                          <span className="text-xs text-text-muted">{g.players}</span>
                        </div>
                        <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-neon-green/70 to-neon-green/30"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ========================================================== */}
        {/*  评论区                                                    */}
        {/* ========================================================== */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neon-cyan" />
              玩家评论
              <span className="text-xs font-normal text-text-muted ml-1">共 {comments.length} 条</span>
            </h2>
          </div>

          {/* Comment input */}
          <div className="bg-bg-secondary/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-neon-purple" />
              发表评论
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="你的昵称"
                  className="flex-1 bg-bg-tertiary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/30 transition-colors"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">评分:</span>
                  <StarRating value={commentRating} onChange={setCommentRating} />
                </div>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的游戏体验..."
                rows={3}
                className="w-full bg-bg-tertiary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/30 transition-colors resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5" />}
                  loading={submittingComment}
                  disabled={!commentName.trim() || !commentText.trim()}
                  onClick={handleSubmitComment}
                >
                  发布评论
                </Button>
              </div>
            </div>
          </div>

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-bg-secondary/40 rounded-2xl border border-white/5">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无评论，快来发表第一条评论吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, i) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * i }}
                  className="bg-bg-secondary/40 hover:bg-bg-secondary/60 border border-white/5 rounded-xl p-5 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + rating + time */}
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-text-primary">
                          {comment.username}
                        </span>
                        <StarRating value={comment.rating} size={12} />
                        <span className="text-[10px] text-text-muted ml-auto">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {/* Script title if available */}
                      {comment.scriptTitle && (
                        <span className="text-[10px] text-neon-cyan/70 bg-neon-cyan/5 rounded px-2 py-0.5 inline-block mb-1.5">
                          剧本: {comment.scriptTitle}
                        </span>
                      )}

                      {/* Text */}
                      <p className="text-sm text-text-secondary leading-relaxed mb-3">
                        {comment.text}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.liked
                              ? 'text-neon-pink'
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          <Heart
                            size={14}
                            className={comment.liked ? 'fill-neon-pink' : ''}
                          />
                          <span>{comment.likes}</span>
                        </button>
                        <span className="text-[10px] text-text-muted">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* ========================================================== */}
      {/*  创建房间 Modal                                            */}
      {/* ========================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            className="w-full max-w-md rounded-2xl bg-bg-secondary border border-white/10 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-text-primary">创建游戏房间</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* 选择剧本 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  选择剧本
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 1, title: '迷雾古堡', genre: '悬疑', desc: '一座被迷雾笼罩的古堡，隐藏着跨越三百年的诅咒与秘密...' },
                    { id: 2, title: '末日生存', genre: '科幻', desc: '病毒爆发后的第三年，六位幸存者在地下避难所中相遇...' },
                    { id: 3, title: '赛博迷局', genre: '赛博朋克', desc: '2077年新东京，六位来自不同阶层的人在虚拟与现实交织的世界中相遇...' },
                  ].map((script) => (
                    <button
                      key={script.id}
                      onClick={() => setCreateScriptId(script.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        createScriptId === script.id
                          ? 'border-neon-purple bg-neon-purple/10'
                          : 'border-white/5 bg-bg-tertiary/50 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary">{script.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                          {script.genre}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2">{script.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 人数设置 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  最大玩家数: <span className="text-neon-purple font-bold">{createMaxPlayers}</span> 人
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={createMaxPlayers}
                  onChange={(e) => setCreateMaxPlayers(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary rounded-full appearance-none cursor-pointer accent-neon-purple"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>3人</span>
                  <span>10人</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleCreateRoom} loading={creating}>
                <Plus className="w-4 h-4 mr-1.5" />
                创建房间
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Mock data fallbacks                                               */
/* ================================================================== */

function getMockHotRooms(): RoomData[] {
  return [
    { id: 1, roomCode: 'HV8K3M', scriptTitle: '迷雾古堡', hostName: '暗夜猎手', playerCount: 3, maxPlayers: 6, status: 'waiting', rating: 4.7, tags: ['悬疑', '推理'] },
    { id: 2, roomCode: '9BX2PJ', scriptTitle: '末日生存', hostName: '星辰旅者', playerCount: 5, maxPlayers: 6, status: 'waiting', rating: 4.5, tags: ['生存', '合作'] },
    { id: 3, roomCode: 'RN5TK1', scriptTitle: '赛博迷局', hostName: '月影诗人', playerCount: 4, maxPlayers: 8, status: 'playing', rating: 4.8, tags: ['科幻', '策略'] },
    { id: 4, roomCode: 'WD7F9L', scriptTitle: '血月庄园', hostName: '红枫', playerCount: 6, maxPlayers: 6, status: 'waiting', rating: 4.9, tags: ['恐怖', '推理'] },
    { id: 5, roomCode: 'GM4H2Q', scriptTitle: '时光倒流', hostName: '追光者', playerCount: 2, maxPlayers: 5, status: 'waiting', rating: 4.3, tags: ['科幻', '情感'] },
    { id: 6, roomCode: 'TX8VB6', scriptTitle: '暗影之都', hostName: '夜行者', playerCount: 4, maxPlayers: 7, status: 'playing', rating: 4.6, tags: ['悬疑', '动作'] },
  ];
}

function getMockAllRooms(): RoomData[] {
  return [
    { id: 1, roomCode: 'HV8K3M', scriptTitle: '迷雾古堡', hostName: '暗夜猎手', playerCount: 3, maxPlayers: 6, status: 'waiting', rating: 4.7 },
    { id: 2, roomCode: '9BX2PJ', scriptTitle: '末日生存', hostName: '星辰旅者', playerCount: 5, maxPlayers: 6, status: 'waiting', rating: 4.5 },
    { id: 3, roomCode: 'RN5TK1', scriptTitle: '赛博迷局', hostName: '月影诗人', playerCount: 4, maxPlayers: 8, status: 'playing', rating: 4.8 },
    { id: 4, roomCode: 'WD7F9L', scriptTitle: '血月庄园', hostName: '红枫', playerCount: 6, maxPlayers: 6, status: 'waiting', rating: 4.9 },
    { id: 5, roomCode: 'GM4H2Q', scriptTitle: '时光倒流', hostName: '追光者', playerCount: 2, maxPlayers: 5, status: 'waiting', rating: 4.3 },
    { id: 6, roomCode: 'TX8VB6', scriptTitle: '暗影之都', hostName: '夜行者', playerCount: 4, maxPlayers: 7, status: 'playing', rating: 4.6 },
    { id: 7, roomCode: 'KJ2M5N', scriptTitle: '深海迷踪', hostName: '蓝鲸', playerCount: 3, maxPlayers: 6, status: 'waiting', rating: 4.2 },
    { id: 8, roomCode: 'PQ7R3S', scriptTitle: '荒岛求生', hostName: '冒险王', playerCount: 0, maxPlayers: 8, status: 'finished', rating: 4.1 },
    { id: 9, roomCode: 'ZL9X4C', scriptTitle: '幽灵列车', hostName: '列车长', playerCount: 5, maxPlayers: 6, status: 'waiting', rating: 4.6 },
    { id: 10, roomCode: 'FB6D1G', scriptTitle: '魔法学院', hostName: '巫师', playerCount: 3, maxPlayers: 8, status: 'waiting', rating: 4.4 },
    { id: 11, roomCode: 'VH3N8T', scriptTitle: '罪恶都市', hostName: '侦探', playerCount: 2, maxPlayers: 5, status: 'playing', rating: 4.0 },
    { id: 12, roomCode: 'CM9W5E', scriptTitle: '星际迷航', hostName: '船长', playerCount: 6, maxPlayers: 6, status: 'waiting', rating: 4.7 },
  ];
}

function getMockComments(): CommentData[] {
  return [
    { id: 1, username: '暗夜猎手', text: '迷雾古堡的剧情设计太棒了！每个角色的线索都很均衡，推理过程非常过瘾。', rating: 5, likes: 23, liked: false, createdAt: '2026-06-06T14:30:00Z', scriptTitle: '迷雾古堡' },
    { id: 2, username: '星辰旅者', text: '末日生存的紧迫感做得很到位，建议和熟悉的朋友一起玩，配合会更默契。', rating: 4, likes: 15, liked: true, createdAt: '2026-06-05T20:15:00Z', scriptTitle: '末日生存' },
    { id: 3, username: '月影诗人', text: '赛博迷局的世界观构建非常出色，科幻迷必玩！不过可能需要一定的阅读量。', rating: 5, likes: 31, liked: false, createdAt: '2026-06-04T18:45:00Z', scriptTitle: '赛博迷局' },
    { id: 4, username: '红枫', text: '血月庄园的氛围渲染太绝了！全程头皮发麻，喜欢恐怖题材的一定要试试。', rating: 5, likes: 42, liked: true, createdAt: '2026-06-03T22:00:00Z', scriptTitle: '血月庄园' },
    { id: 5, username: '追光者', text: '时光倒流的感情线很感人，不是单纯的推理本，适合喜欢剧情的玩家。', rating: 4, likes: 8, liked: false, createdAt: '2026-06-02T10:30:00Z', scriptTitle: '时光倒流' },
  ];
}

function getMockRoomStats(): RoomStatEntry[] {
  return [
    { day: '2026-06-01', activeRooms: 18, newPlayers: 45, dialoguesPlayed: 320, avgSessionMinutes: 62 },
    { day: '2026-06-02', activeRooms: 22, newPlayers: 52, dialoguesPlayed: 410, avgSessionMinutes: 58 },
    { day: '2026-06-03', activeRooms: 15, newPlayers: 38, dialoguesPlayed: 280, avgSessionMinutes: 65 },
    { day: '2026-06-04', activeRooms: 24, newPlayers: 61, dialoguesPlayed: 490, avgSessionMinutes: 55 },
    { day: '2026-06-05', activeRooms: 20, newPlayers: 48, dialoguesPlayed: 370, avgSessionMinutes: 60 },
    { day: '2026-06-06', activeRooms: 27, newPlayers: 72, dialoguesPlayed: 530, avgSessionMinutes: 52 },
    { day: '2026-06-07', activeRooms: 23, newPlayers: 55, dialoguesPlayed: 440, avgSessionMinutes: 57 },
  ];
}

function getMockScriptPopularity(): ScriptPopularityEntry[] {
  return [
    { title: '迷雾古堡', players: 1240, sessions: 210, rating: 4.7, completion: 85 },
    { title: '血月庄园', players: 980, sessions: 165, rating: 4.9, completion: 78 },
    { title: '赛博迷局', players: 870, sessions: 148, rating: 4.8, completion: 82 },
    { title: '末日生存', players: 720, sessions: 130, rating: 4.5, completion: 74 },
    { title: '幽灵列车', players: 560, sessions: 98, rating: 4.6, completion: 80 },
    { title: '魔法学院', players: 430, sessions: 82, rating: 4.4, completion: 71 },
  ];
}
