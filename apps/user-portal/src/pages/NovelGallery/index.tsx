import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, Upload, FileText, X, Sparkles, Loader2, Save } from 'lucide-react';
import NovelCardGrid from '@/components/novel/NovelCardGrid';
import { useNovelStore } from '@/stores/novelStore';
import { novelService } from '@/services/novelService';
import type { NovelGenre, NovelListItem } from '@asg/shared';

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

type ModalMode = 'add' | 'import' | 'edit' | null;

export default function NovelGallery() {
  const { novels, loading, total, page, pageSize, query, setNovels, setLoading, setError, setPage, setQuery } =
    useNovelStore();
  const [searchInput, setSearchInput] = useState(query.search || '');
  const totalPages = Math.ceil(total / pageSize);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [importing, setImporting] = useState(false);
  const [importForm, setImportForm] = useState({
    title: '',
    description: '',
    genre: 'other' as NovelGenre,
    hook: '',
    file: null as File | null,
  });
  const [addForm, setAddForm] = useState({ title: '', description: '', genre: 'other', hook: '', chapter1Title: '第一章', chapter1Content: '' });
  const [editForm, setEditForm] = useState({ id: 0, title: '', description: '', genre: 'other' as NovelGenre, hook: '', tags: [] as string[] });
  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportForm(prev => ({ ...prev, file }));
    }
  };

  const handleImport = async () => {
    if (!importForm.file) return;
    setImporting(true);
    try {
      const result = await novelService.importFile(importForm.file, {
        title: importForm.title,
        description: importForm.description,
        genre: importForm.genre,
        hook: importForm.hook,
      });
      setModalMode(null);
      setImportForm({ title: '', description: '', genre: 'other', hook: '', file: null });
      setQuery({ ...query, page: 1 });
    } catch (err: any) {
      setError(err.message || '导入失败');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    if (!addForm.title.trim()) return;
    setSubmitLoading(true);
    try {
      await novelService.create(addForm);
      setModalMode(null);
      setAddForm({ title: '', description: '', genre: 'other', hook: '', chapter1Title: '第一章', chapter1Content: '' });
      setQuery({ ...query, page: 1 });
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (novel: NovelListItem) => {
    setEditForm({
      id: novel.id,
      title: novel.title,
      description: novel.description || '',
      genre: novel.genre as NovelGenre,
      hook: novel.hook || '',
      tags: novel.tags || [],
    });
    setModalMode('edit');
  };

  const handleUpdate = async () => {
    if (!editForm.title.trim()) return;
    setEditLoading(true);
    try {
      await novelService.update(editForm.id, {
        title: editForm.title,
        description: editForm.description,
        genre: editForm.genre,
        hook: editForm.hook,
        tags: editForm.tags,
      });
      setModalMode(null);
      setQuery({ ...query });
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这本小说吗？此操作不可恢复。')) return;
    try {
      await novelService.delete(id);
      setQuery({ ...query });
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await novelService.toggleArchive(id);
      setQuery({ ...query });
    } catch (err: any) {
      setError(err.message || '存档操作失败');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-10 flex items-start justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              小说陈列馆
            </h1>
            <p className="text-text-secondary">
              探索由 AI 创作的海量精彩小说，现在已有 <span className="text-neon-purple font-semibold">{total}</span> 部
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setModalMode('import')}
              className="px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-white/20 flex items-center gap-2 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">导入作品</span>
            </motion.button>
            <motion.button
              onClick={() => setModalMode('add')}
              className="px-4 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:shadow-neon-purple transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">添加小说</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <SlidersHorizontal className="w-4 h-4" />
              筛选
            </div>
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
        <NovelCardGrid 
          novels={novels} 
          loading={loading} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
        />

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
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
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

      {/* Modal Overlay */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMode(null)}
          >
            <motion.div
              className="bg-bg-primary border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    {modalMode === 'add' ? '添加新小说' : modalMode === 'edit' ? '编辑小说' : '导入作品'}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {modalMode === 'add' ? '创建一个全新的小说' : modalMode === 'edit' ? '修改小说信息' : '从 PDF 或 Word 文件导入'}
                  </p>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalMode === 'edit' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">作品名称 *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="输入作品名称..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">一句话钩子</label>
                    <input
                      type="text"
                      value={editForm.hook}
                      onChange={(e) => setEditForm({ ...editForm, hook: e.target.value })}
                      placeholder="吸引读者的一句话..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">作品简介</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="故事简介..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">选择主题</label>
                    <select
                      value={editForm.genre}
                      onChange={(e) => setEditForm({ ...editForm, genre: e.target.value as NovelGenre })}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-secondary focus:outline-none focus:border-neon-purple/40"
                    >
                      {genreOptions.filter(g => g.value).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    onClick={handleUpdate}
                    disabled={!editForm.title.trim() || editLoading}
                    className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-purple transition-shadow disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editLoading ? '保存中...' : '保存修改'}
                  </motion.button>
                </div>
              ) : modalMode === 'add' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">小说标题 *</label>
                    <input
                      type="text"
                      value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                      placeholder="输入标题..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">一句话钩子</label>
                    <input
                      type="text"
                      value={addForm.hook}
                      onChange={(e) => setAddForm({ ...addForm, hook: e.target.value })}
                      placeholder="吸引读者的一句话..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">简介</label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      placeholder="故事简介..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">类型</label>
                    <select
                      value={addForm.genre}
                      onChange={(e) => setAddForm({ ...addForm, genre: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-secondary focus:outline-none focus:border-neon-purple/40"
                    >
                      {genreOptions.filter(g => g.value).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">第一章标题</label>
                    <input
                      type="text"
                      value={addForm.chapter1Title}
                      onChange={(e) => setAddForm({ ...addForm, chapter1Title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">第一章内容</label>
                    <textarea
                      value={addForm.chapter1Content}
                      onChange={(e) => setAddForm({ ...addForm, chapter1Content: e.target.value })}
                      placeholder="写下第一章的内容..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 resize-none"
                    />
                  </div>
                  <motion.button
                    onClick={handleCreate}
                    disabled={!addForm.title.trim() || submitLoading}
                    className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-purple transition-shadow disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {submitLoading ? '创建中...' : '创建小说'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 文件上传 */}
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-neon-purple/30 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
                      <p className="text-text-primary font-medium mb-1">
                        {importForm.file ? importForm.file.name : '点击上传文件'}
                      </p>
                      <p className="text-text-muted text-xs">
                        支持 PDF、Word 格式（.doc / .docx）
                      </p>
                    </label>
                  </div>

                  {/* 作品名称 */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">作品名称 *</label>
                    <input
                      type="text"
                      value={importForm.title}
                      onChange={(e) => setImportForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入作品名称..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>

                  {/* 一句话钩子 */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">一句话钩子</label>
                    <input
                      type="text"
                      value={importForm.hook}
                      onChange={(e) => setImportForm(prev => ({ ...prev, hook: e.target.value }))}
                      placeholder="吸引读者的一句话..."
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40"
                    />
                  </div>

                  {/* 简介 */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">作品简介</label>
                    <textarea
                      value={importForm.description}
                      onChange={(e) => setImportForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="故事简介..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 resize-none"
                    />
                  </div>

                  {/* 选择主题/类型 */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">选择主题</label>
                    <select
                      value={importForm.genre}
                      onChange={(e) => setImportForm(prev => ({ ...prev, genre: e.target.value as NovelGenre }))}
                      className="w-full px-4 py-2.5 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-secondary focus:outline-none focus:border-neon-purple/40"
                    >
                      {genreOptions.filter(g => g.value).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 导入按钮 */}
                  <motion.button
                    onClick={handleImport}
                    disabled={!importForm.file || !importForm.title.trim() || importing}
                    className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-purple transition-shadow disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {importing ? '正在导入...' : '确认导入'}
                  </motion.button>

                  {importing && (
                    <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在导入并解析...
                    </div>
                  )}
                  <div className="bg-bg-secondary rounded-xl p-4">
                    <p className="text-xs text-text-muted">
                      <span className="text-neon-purple font-medium">自动配图：</span>
                      导入成功后，系统会自动为你的小说生成 AI 配图提示词。使用五哥生图生成封面后可在详情页上传。
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
