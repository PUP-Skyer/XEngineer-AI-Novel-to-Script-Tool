import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Star, BookOpen } from 'lucide-react';
import type { NovelListItem } from '@asg/shared';

interface NovelCardProps {
  novel: NovelListItem;
  index?: number;
}

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

const genreColors: Record<string, string> = {
  suspense: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  fantasy: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  scifi: 'text-neon-blue bg-neon-blue/10 border-neon-blue/20',
  romance: 'text-neon-pink bg-neon-pink/10 border-neon-pink/20',
  horror: 'text-red-400 bg-red-400/10 border-red-400/20',
  action: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  comedy: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  drama: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  other: 'text-text-secondary bg-white/5 border-white/10',
};

export default function NovelCard({ novel, index = 0 }: NovelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/novels/${novel.id}`}>
        <motion.div
          className="group relative bg-bg-secondary border border-white/5 rounded-2xl overflow-hidden cursor-pointer h-full"
          whileHover={{
            y: -6,
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow:
              '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.08)',
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden bg-bg-tertiary">
            {novel.coverUrl ? (
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                <BookOpen className="w-12 h-12 text-neon-purple/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />

            {/* Genre Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  genreColors[novel.genre] || genreColors.other
                }`}
              >
                {genreLabels[novel.genre] || novel.genre}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-text-primary line-clamp-1 group-hover:text-neon-purple transition-colors">
              {novel.title}
            </h3>

            {novel.description && (
              <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                {novel.description}
              </p>
            )}

            {/* Tags */}
            {novel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {novel.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Eye className="w-3.5 h-3.5" />
                <span>{novel.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Star className="w-3.5 h-3.5" />
                <span>{novel.avgRating > 0 ? novel.avgRating.toFixed(1) : '暂无'}</span>
              </div>
              <div className="text-xs text-text-muted ml-auto">
                {novel.wordCount.toLocaleString()} 字
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
