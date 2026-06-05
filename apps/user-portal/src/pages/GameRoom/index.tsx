import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Send,
  Wifi,
  WifiOff,
  Copy,
  Settings,
  Crown,
  Bot,
  User,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MessageBubble from '@/components/game/MessageBubble';
import ChoicePanel from '@/components/game/ChoicePanel';
import { useGameSession } from '@/hooks/useGameSession';
import { useAuthStore } from '@/stores/authStore';

export default function GameRoom() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuthStore();
  const { session, players, logs, currentChoices, isConnected, loading, error, joinRoom, speak, makeChoice } =
    useGameSession({ roomCode: code || '' });

  const [message, setMessage] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Join room on mount
  useEffect(() => {
    if (code) {
      joinRoom(code);
    }
  }, [code, joinRoom]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await speak(message.trim());
    setMessage('');
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="正在连接游戏房间..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary">返回大厅</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Room Header */}
        <div className="h-14 flex items-center justify-between px-4 bg-bg-secondary border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">
              {session?.status === 'playing' ? '游戏进行中' : '等待玩家加入'}
            </span>
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-neon-green" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className="text-xs text-text-muted">
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs font-mono text-neon-cyan bg-neon-cyan/10 px-2.5 py-1 rounded-lg border border-neon-cyan/20 hover:bg-neon-cyan/15 transition-colors"
            >
              {code}
              <Copy className="w-3 h-3" />
              {copied && <span className="text-neon-green ml-1">已复制</span>}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <p className="text-sm">等待游戏开始...</p>
              <p className="text-xs mt-1">所有玩家加入后即可开始游戏</p>
            </div>
          ) : (
            logs.map((log) => {
              const player = players.find((p) => p.id === log.playerId);
              let role: 'player' | 'ai' | 'dm' | 'narrator' = 'player';
              if (player?.isAi) role = 'ai';
              if (!player) role = 'narrator';
              if (log.actionType === 'system') role = 'dm';

              return (
                <MessageBubble
                  key={log.id}
                  speaker={player?.characterName || '系统'}
                  role={role}
                  content={log.content}
                  timestamp={new Date(log.createdAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Choice Panel */}
        {currentChoices.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5 bg-bg-secondary">
            <ChoicePanel
              choices={currentChoices}
              onSelect={makeChoice}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-bg-secondary border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的对话..."
              className="flex-1 px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors"
              disabled={!isConnected}
            />
            <motion.button
              onClick={handleSend}
              disabled={!message.trim() || !isConnected}
              className="px-4 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={message.trim() ? { scale: 1.02 } : undefined}
              whileTap={message.trim() ? { scale: 0.98 } : undefined}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Player Sidebar */}
      <div className="w-56 bg-bg-secondary border-l border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Users className="w-4 h-4 text-neon-purple" />
            玩家列表 ({players.length})
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-tertiary"
            >
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple text-xs font-bold">
                {player.characterName?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary truncate">
                  {player.characterName || '未分配'}
                </div>
                <div className="text-xs text-text-muted flex items-center gap-1">
                  {player.isAi ? (
                    <>
                      <Bot className="w-3 h-3" />
                      AI
                    </>
                  ) : player.userId === user?.id ? (
                    <>
                      <User className="w-3 h-3" />
                      你
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      玩家
                    </>
                  )}
                </div>
              </div>
              {player.isAlive === false && (
                <span className="text-xs text-red-400">已淘汰</span>
              )}
            </div>
          ))}

          {players.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4">
              等待玩家加入...
            </p>
          )}
        </div>

        {/* Room Settings */}
        <div className="p-3 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors rounded-lg hover:bg-white/5">
            <Settings className="w-3.5 h-3.5" />
            房间设置
          </button>
        </div>
      </div>
    </div>
  );
}
