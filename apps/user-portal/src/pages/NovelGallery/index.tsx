import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import NovelCardGrid from '@/components/novel/NovelCardGrid';
import { useNovelStore } from '@/stores/novelStore';
import { novelService } from '@/services/novelService';
import type { NovelGenre } from '@asg/shared';

const genreOptions: { value: NovelGenre | ''; label: string }[] = [
  { value: '', label: '全部类型' },
  { value: 'suspense', label: '悬疑' },
  { value: 'fantasy', label: '奇幻' },
  { value: 'scifi', label: '科幻' },
  { value: 'romance', label: '言情' },
  { value: 'horror', label: '恐怖' },
  { value: 'action', label: '动作' },
  { value: 'comedy', label: '喜剧' },
  { value: 'drama', label: '剧情' },
  { value: 'other', label: '其他' },
];

const sortOptions = [
  { value: 'latest', label: '最新发布' },
  { value: 'popular', label: '最多浏览' },
  { value: 'rating', label: '最高评分' },
];

export default function NovelGallery() {
  const { novels, loading, total, page, pageSize, query, setNovels, setLoading, setError, setPage, setQuery } =
    useNovelStore();

  const [searchInput, setSearchInput] = useState(query.search || '');
  const totalPages = Math.ceil(total / pageSize);

  const fetchNovels = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await novelService.getList(query);
      setNovels(result.data, result.total);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, [query]);

  const handleSearch = () => {
    setQuery({ search: searchInput || undefined, page: 1 });
  };

  const handleGenreChange = (genre: NovelGenre | '') => {
    setQuery({ genre: (genre || undefined) as NovelGenre | undefined, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    setQuery({ sort: sort as any, page: 1 });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            小说陈列馆
          </h1>
          <p className="text-text-secondary">
            探索由 AI 创作的海量精彩小说
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索小说标题、标签..."
                className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors"
              />
            </div>
            <motion.button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl hover:shadow-neon-purple transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              搜索
            </motion.button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <SlidersHorizontal className="w-4 h-4" />
              筛选
            </div>

            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleGenreChange(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    (query.genre || '') === option.value
                      ? 'text-neon-purple bg-neon-purple/10 border-neon-purple/30'
                      : 'text-text-secondary bg-bg-secondary border-white/10 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto">
              <select
                value={query.sort || 'latest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 text-xs bg-bg-secondary border border-white/10 rounded-lg text-text-secondary focus:outline-none focus:border-neon-purple/40 appearance-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Novel Grid */}
        <NovelCardGrid novels={novels} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
