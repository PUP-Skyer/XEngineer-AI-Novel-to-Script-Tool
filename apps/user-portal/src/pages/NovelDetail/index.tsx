import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Star,
  Heart,
  Share2,
  ScrollText,
  Calendar,
  BookOpen,
  Tag,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { novelService } from '@/services/novelService';
import type { Novel } from '@asg/shared';

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

export default function NovelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchNovel = async () => {
      setLoading(true);
      try {
        const data = await novelService.getById(Number(id));
        setNovel(data);
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [id]);

  const handleFavorite = async () => {
    if (!novel) return;
    try {
      const result = await novelService.toggleFavorite(novel.id);
      setFavorited(result.favorited);
    } catch {
      // Silently fail
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="加载小说详情..." />
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">{error || '小说不存在'}</p>
        <Button variant="secondary" onClick={() => navigate('/novels')}>
          返回陈列馆
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
        </motion.div>

        {/* Novel Header */}
        <motion.div
          className="bg-bg-secondary border border-white/5 rounded-2xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Cover */}
          <div className="relative h-64 md:h-80 bg-bg-tertiary">
            {novel.coverUrl ? (
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                <BookOpen className="w-20 h-20 text-neon-purple/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
          </div>

          {/* Info */}
          <div className="p-6 md:p-8 -mt-12 relative z-10">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
                {genreLabels[novel.genre] || novel.genre}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              {novel.title}
            </h1>

            {novel.description && (
              <p className="text-text-secondary leading-relaxed mb-6">
                {novel.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-6">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {novel.viewCount.toLocaleString()} 浏览
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                {novel.avgRating > 0 ? novel.avgRating.toFixed(1) : '暂无评分'}
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {novel.wordCount.toLocaleString()} 字
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(novel.createdAt).toLocaleDateString('zh-CN')}
              </div>
            </div>

            {/* Tags */}
            {novel.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {novel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs text-text-muted bg-white/5 px-2.5 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/scripts/convert/${novel.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-neon-purple hover:bg-neon-purple/90 text-white rounded-lg font-medium transition-all neon-glow"
              >
                <Sparkles className="w-5 h-5" />
                AI 转为剧本
              </Link>
              <Button
                variant="secondary"
                onClick={handleFavorite}
                icon={<Heart className={`w-4 h-4 ${favorited ? 'fill-neon-pink text-neon-pink' : ''}`} />}
              >
                {favorited ? '已收藏' : '收藏'}
              </Button>
              <Button variant="ghost" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
                分享
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Novel Content */}
        <motion.div
          className="bg-bg-secondary border border-white/5 rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-text-primary mb-6 pb-4 border-b border-white/5">
            正文
          </h2>
          <div className="prose prose-invert max-w-none">
            {novel.content.split('\n').map((paragraph, index) =>
              paragraph.trim() ? (
                <p
                  key={index}
                  className="text-text-secondary leading-loose mb-4 text-sm md:text-base"
                >
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              ),
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
