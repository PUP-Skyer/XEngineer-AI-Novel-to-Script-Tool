import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  LogIn,
  Gamepad2,
  Users,
  ScrollText,
  Hash,
  RefreshCw,
  Flame,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { gameService } from '@/services/gameService';
import { useAuthStore } from '@/stores/authStore';

interface ScriptInfo {
  id: number;
  title: string;
  playerCountMin: number;
  playerCountMax: number;
  difficulty: string;
}

interface RoomInfo {
  roomCode: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  scriptTitle: string;
}

export default function GameLobby() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [roomCode, setRoomCode] = useState('');
  const [scripts, setScripts] = useState<ScriptInfo[]>([]);
  const [hotRooms, setHotRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        const [scriptsData] = await Promise.all([
          gameService.getAvailableScripts().catch(() => []),
        ]);
        setScripts(scriptsData);

        // Mock hot rooms data
        setHotRooms([
          { roomCode: 'ABCD1234', hostName: '暗夜猎手', playerCount: 3, maxPlayers: 6, status: 'waiting', scriptTitle: '迷雾古堡' },
          { roomCode: 'EFGH5678', hostName: '星辰旅者', playerCount: 5, maxPlayers: 6, status: 'waiting', scriptTitle: '末日生存' },
          { roomCode: 'IJKL9012', hostName: '月影诗人', playerCount: 4, maxPlayers: 8, status: 'playing', scriptTitle: '赛博迷局' },
        ]);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLobbyData();
  }, []);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await gameService.joinRoom({ roomCode: roomCode.trim() });
      navigate(`/game/room/${roomCode.trim()}`);
    } catch {
      // Show error
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedScriptId || !isAuthenticated) return;
    setCreating(true);
    try {
      const session = await gameService.createRoom({ scriptId: selectedScriptId });
      navigate(`/game/room/${session.roomCode}`);
    } catch {
      // Show error
    } finally {
      setCreating(false);
    }
  };

  const difficultyColors: Record<string, string> = {
    easy: 'text-neon-green',
    medium: 'text-neon-cyan',
    hard: 'text-neon-pink',
  };

  const difficultyLabels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">游戏大厅</h1>
          </div>
          <p className="text-text-secondary ml-[52px]">
            创建或加入房间，开启剧本杀之旅
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card hoverable glowOnHover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    创建房间
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    选择一个剧本，创建你自己的游戏房间
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    disabled={!isAuthenticated}
                  >
                    创建新房间
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card hoverable glowOnHover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center shrink-0">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    加入房间
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    输入房间码，加入朋友的房间
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="输入房间码"
                        maxLength={8}
                        className="w-full pl-9 pr-3 py-2 bg-bg-tertiary border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 font-mono tracking-wider"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim()}
                    >
                      加入
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Available Scripts */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-neon-purple" />
              可用剧本
            </h2>
          </div>

          {loading ? (
            <LoadingSpinner text="加载中..." />
          ) : scripts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无可用剧本</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts.map((script, index) => (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card hoverable padding="md">
                    <h4 className="font-semibold text-text-primary mb-2">
                      {script.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {script.playerCountMin}-{script.playerCountMax}人
                      </span>
                      <span className={difficultyColors[script.difficulty] || 'text-text-muted'}>
                        {difficultyLabels[script.difficulty] || script.difficulty}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Hot Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Flame className="w-5 h-5 text-neon-pink" />
              热门房间
            </h2>
            <button className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              刷新
            </button>
          </div>

          <div className="space-y-3">
            {hotRooms.map((room, index) => (
              <motion.div
                key={room.roomCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card padding="md" className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-lg border border-neon-cyan/20">
                      {room.roomCode}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">
                        {room.scriptTitle}
                      </h4>
                      <p className="text-xs text-text-muted">
                        房主: {room.hostName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-text-muted">
                      <span className="text-text-secondary">{room.playerCount}</span>
                      /{room.maxPlayers} 人
                    </div>
                    <Button
                      size="sm"
                      variant={room.status === 'waiting' ? 'primary' : 'secondary'}
                      disabled={room.status !== 'waiting'}
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate(`/game/room/${room.roomCode}`);
                        } else {
                          navigate('/login');
                        }
                      }}
                    >
                      {room.status === 'waiting' ? '加入' : '进行中'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Create Room Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="创建游戏房间"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateRoom}
              loading={creating}
              disabled={!selectedScriptId}
            >
              创建房间
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">
          选择一个剧本来创建游戏房间
        </p>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => setSelectedScriptId(script.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedScriptId === script.id
                  ? 'bg-neon-purple/10 border-neon-purple/30'
                  : 'bg-bg-tertiary border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">
                    {script.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{script.playerCountMin}-{script.playerCountMax} 人</span>
                    <span className={difficultyColors[script.difficulty] || ''}>
                      {difficultyLabels[script.difficulty] || script.difficulty}
                    </span>
                  </div>
                </div>
                {selectedScriptId === script.id && (
                  <div className="w-5 h-5 rounded-full bg-neon-purple flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
