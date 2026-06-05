import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BookOpen, Eye, Star, Trash2 } from 'lucide-react';

interface CollectionItem {
  id: number;
  title: string;
  description: string;
  coverUrl?: string;
  genre: string;
  viewCount: number;
  avgRating: number;
  wordCount: number;
  type: 'novel' | 'script';
  collectedAt: string;
}

const mockCollections: CollectionItem[] = [
  {
    id: 1,
    title: '迷雾古堡',
    description: '一座被浓雾笼罩的古老城堡，隐藏着不为人知的秘密。当你踏入其中，才发现一切远非表面看上去那么简单。',
    genre: '悬疑',
    viewCount: 12580,
    avgRating: 4.8,
    wordCount: 35600,
    type: 'novel',
    collectedAt: '2026-05-20',
  },
  {
    id: 2,
    title: '赛博迷局',
    description: '2087年的新东京，一名退役特工在虚拟世界中寻找失踪的女儿，却卷入了一场跨越现实与虚拟的惊天阴谋。',
    genre: '科幻',
    viewCount: 9430,
    avgRating: 4.6,
    wordCount: 42100,
    type: 'script',
    collectedAt: '2026-05-18',
  },
  {
    id: 3,
    title: '末日生存',
    description: '丧尸横行的废土世界，幸存者们聚集在最后的堡垒中，人性的光辉与黑暗在生死边缘交织。',
    genre: '恐怖',
    viewCount: 18200,
    avgRating: 4.9,
    wordCount: 28900,
    type: 'novel',
    collectedAt: '2026-05-15',
  },
  {
    id: 4,
    title: '星辰旅途',
    description: '在浩瀚宇宙中，一支探险队踏上了寻找新家园的旅程，每一颗星球都带来新的惊喜与挑战。',
    genre: '奇幻',
    viewCount: 7650,
    avgRating: 4.5,
    wordCount: 31200,
    type: 'script',
    collectedAt: '2026-05-10',
  },
  {
    id: 5,
    title: '谍影重重',
    description: '冷战时期的东方谍战传奇，一位双面间谍游走在信任与背叛之间，步步为营。',
    genre: '悬疑',
    viewCount: 15800,
    avgRating: 4.7,
    wordCount: 38400,
    type: 'novel',
    collectedAt: '2026-05-08',
  },
  {
    id: 6,
    title: '龙与少年',
    description: '一个平凡少年与一条古老神龙的相遇，开启了一段跨越千年的冒险旅程。',
    genre: '奇幻',
    viewCount: 11200,
    avgRating: 4.4,
    wordCount: 26700,
    type: 'novel',
    collectedAt: '2026-05-01',
  },
];

const typeLabels: Record<string, string> = {
  novel: '小说',
  script: '剧本',
};

const typeBadgeColors: Record<string, string> = {
  novel: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  script: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
};

export default function Collection() {
  const [collections, setCollections] = useState<CollectionItem[]>(mockCollections);

  const handleRemove = (id: number) => {
    setCollections((prev) => prev.filter((item) => item.id !== id));
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-14 h-14 mx-auto mb-4 text-text-muted/30" />
        <p className="text-text-secondary text-lg mb-2">暂无收藏内容</p>
        <p className="text-text-muted text-sm">去陈列馆探索感兴趣的小说和剧本吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <AnimatePresence>
        {collections.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Link to={item.type === 'novel' ? `/novels/${item.id}` : `/scripts/${item.id}`}>
              <motion.div
                className="group bg-bg-secondary border border-white/5 rounded-2xl overflow-hidden cursor-pointer h-full"
                whileHover={{
                  y: -6,
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                  boxShadow:
                    '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.08)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Cover */}
                <div className="relative h-40 overflow-hidden bg-bg-tertiary">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/15 to-neon-blue/15">
                      <BookOpen className="w-10 h-10 text-neon-purple/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        typeBadgeColors[item.type]
                      }`}
                    >
                      {typeLabels[item.type]}
                    </span>
                  </div>

                  {/* Genre Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-text-secondary">
                      {item.genre}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-text-primary line-clamp-1 group-hover:text-neon-purple transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Star className="w-3.5 h-3.5" />
                      <span>{item.avgRating > 0 ? item.avgRating.toFixed(1) : '暂无'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted ml-auto">
                      <Trash2
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-neon-pink cursor-pointer transition-opacity hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
