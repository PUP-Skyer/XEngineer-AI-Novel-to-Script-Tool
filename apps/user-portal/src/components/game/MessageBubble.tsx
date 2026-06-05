import { motion } from 'framer-motion';
import { Bot, User, Crown, Scroll } from 'lucide-react';

export type SpeakerRole = 'player' | 'ai' | 'dm' | 'narrator';

interface MessageBubbleProps {
  speaker: string;
  role: SpeakerRole;
  content: string;
  emotion?: string;
  timestamp?: string;
}

const roleConfig: Record<
  SpeakerRole,
  {
    bg: string;
    border: string;
    icon: React.ReactNode;
    label: string;
    textColor: string;
  }
> = {
  player: {
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
    icon: <User className="w-4 h-4" />,
    label: '玩家',
    textColor: 'text-neon-green',
  },
  ai: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    icon: <Bot className="w-4 h-4" />,
    label: 'AI',
    textColor: 'text-neon-purple',
  },
  dm: {
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/30',
    icon: <Crown className="w-4 h-4" />,
    label: 'DM',
    textColor: 'text-neon-blue',
  },
  narrator: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: <Scroll className="w-4 h-4" />,
    label: '旁白',
    textColor: 'text-text-muted',
  },
};

export default function MessageBubble({
  speaker,
  role,
  content,
  emotion,
  timestamp,
}: MessageBubbleProps) {
  const config = roleConfig[role];

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full ${config.bg} border ${config.border} flex items-center justify-center ${config.textColor}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${config.textColor}`}>
            {speaker}
          </span>
          <span className={`text-xs ${config.textColor} opacity-60`}>
            [{config.label}]
          </span>
          {emotion && (
            <span className="text-xs text-text-muted italic">{emotion}</span>
          )}
          {timestamp && (
            <span className="text-xs text-text-muted ml-auto">{timestamp}</span>
          )}
        </div>
        <div
          className={`inline-block max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${config.bg} border ${config.border} text-text-primary`}
        >
          {content}
        </div>
      </div>
    </motion.div>
  );
}
