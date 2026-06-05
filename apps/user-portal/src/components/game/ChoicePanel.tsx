import { motion } from 'framer-motion';

interface Choice {
  id: number;
  text: string;
  consequence?: string;
}

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (choiceId: number) => void;
  disabled?: boolean;
}

export default function ChoicePanel({
  choices,
  onSelect,
  disabled = false,
}: ChoicePanelProps) {
  if (choices.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
        做出你的选择
      </p>
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          className="w-full text-left px-4 py-3 rounded-xl bg-bg-tertiary border border-white/10 text-sm text-text-primary hover:border-neon-purple/40 hover:bg-neon-purple/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={!disabled ? { x: 4, borderColor: 'rgba(168, 85, 247, 0.4)' } : undefined}
          whileTap={!disabled ? { scale: 0.98 } : undefined}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-xs text-neon-purple font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <div className="flex-1 min-w-0">
              <span>{choice.text}</span>
              {choice.consequence && (
                <p className="mt-1 text-xs text-text-muted italic">
                  {choice.consequence}
                </p>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
