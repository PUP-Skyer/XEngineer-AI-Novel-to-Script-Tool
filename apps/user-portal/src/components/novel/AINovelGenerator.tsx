import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  X,
  Sparkles,
  BookOpen,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  Heart,
  BrainCircuit,
  Flame,
  Eye,
  Skull,
  MessageSquare,
} from 'lucide-react';
import { useAIGenerationStore } from '@/stores/aiNovelStore';
import {
  streamGenerateNovel,
  saveNovel,
  draftStorage,
  type AIGenerationParams,
  type GenerationProgress,
} from '@/services/aiNovelService';
import type { NovelGenre } from '@asg/shared';

/* ------------------------------------------------------------------ */
/*  类型与常量                                                          */
/* ------------------------------------------------------------------ */

interface AINovelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const genreOptions: { value: NovelGenre; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'suspense', label: '悬疑', icon: Eye, color: 'text-neon-purple' },
  { value: 'fantasy', label: '奇幻', icon: Sparkles, color: 'text-neon-blue' },
  { value: 'scifi', label: '科幻', icon: BrainCircuit, color: 'text-neon-cyan' },
  { value: 'romance', label: '言情', icon: Heart, color: 'text-neon-pink' },
  { value: 'horror', label: '恐怖', icon: Skull, color: 'text-neon-red' },
  { value: 'action', label: '动作', icon: Flame, color: 'text-neon-orange' },
  { value: 'drama', label: '剧情', icon: BookOpen, color: 'text-neon-green' },
  { value: 'other', label: '其他', icon: FileText, color: 'text-text-muted' },
];

const styleOptions = [
  { value: 'literary', label: '文学性', desc: '优美细腻，注重描写' },
  { value: 'commercial', label: '商业化', desc: '节奏紧凑，情节驱动' },
  { value: 'web', label: '网文风', desc: '爽点密集，通俗易懂' },
  { value: 'classic', label: '经典风', desc: '结构严谨，人物深刻' },
];

const toneOptions = [
  { value: 'dark', label: '暗黑沉重', desc: '压抑氛围，深刻主题' },
  { value: 'light', label: '轻松明快', desc: '幽默风趣，温暖治愈' },
  { value: 'tense', label: '紧张刺激', desc: '悬念迭起，扣人心弦' },
  { value: 'romantic', label: '浪漫温情', desc: '情感细腻，动人心弦' },
  { value: 'epic', label: '史诗宏大', desc: '气势磅礴，格局宏大' },
];

/* ------------------------------------------------------------------ */
/*  主组件                                                             */
/* ------------------------------------------------------------------ */

export default function AINovelGenerator({ isOpen, onClose, onSaved }: AINovelGeneratorProps) {
  const store = useAIGenerationStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'progress' | 'preview'>('config');
  const [saving, setSaving] = useState(false);

  // 配置表单
  const [config, setConfig] = useState<AIGenerationParams>({
    prompt: '',
    genre: 'suspense',
    wordCount: 10000,
    chapterCount: 5,
    style: 'commercial',
    tone: 'tense',
  });

  // 清理
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // 监听阶段变化，自动切换标签
  useEffect(() => {
    if (store.phase === 'outlining' || store.phase === 'generating') {
      setActiveTab('progress');
    } else if (store.phase === 'preview' || store.phase === 'completed') {
      setActiveTab('preview');
    }
  }, [store.phase]);

  /* ---- 开始生成 ---- */
  const handleStartGeneration = useCallback(async () => {
    if (!config.prompt.trim()) return;

    abortControllerRef.current = new AbortController();
    store.startGeneration(config.chapterCount);

    try {
      let currentChapterContent = '';
      let currentChapterNumber = 0;

      for await (const chunk of streamGenerateNovel(config, abortControllerRef.current.signal)) {
        handleGenerationChunk(chunk, currentChapterContent, currentChapterNumber);

        // 更新当前章节内容缓冲
        if (chunk.type === 'chapter_content' && chunk.data?.content) {
          currentChapterContent += chunk.data.content;
        }
        if (chunk.type === 'chapter_start') {
          currentChapterContent = '';
          currentChapterNumber = chunk.data?.chapterNumber || 0;
        }
      }

      store.completeGeneration();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        store.setError(err.message || '生成失败');
        store.setPhase('error');
      }
    } finally {
      store.setIsGenerating(false);
    }
  }, [config, store]);

  /* ---- 处理生成块 ---- */
  const handleGenerationChunk = (
    chunk: GenerationProgress,
    currentContent: string,
    currentNumber: number
  ) => {
    switch (chunk.type) {
      case 'outline':
        store.setOutline(chunk.data);
        store.setPhase('generating');
        store.setProgress(5);
        break;
      case 'chapter_start':
        store.setCurrentChapter(chunk.data?.chapterNumber || 0);
        break;
      case 'chapter_content':
        // 内容通过流式更新，这里可以实时更新UI
        break;
      case 'chapter_complete': {
        const chapter = chunk.data;
        if (chapter) {
          store.addChapter({
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            wordCount: chapter.wordCount,
          });
        }
        break;
      }
      case 'progress':
        store.setProgress(chunk.progress || 0);
        break;
      case 'error':
        store.setError(chunk.message || '生成出错');
        store.setPhase('error');
        break;
      case 'complete':
        store.completeGeneration();
        break;
    }
  };

  /* ---- 取消生成 ---- */
  const handleCancel = () => {
    abortControllerRef.current?.abort();
    store.setIsGenerating(false);
    store.setPhase('idle');
  };

  /* ---- 保存小说 ---- */
  const handleSave = async () => {
    if (!store.currentDraft) return;
    setSaving(true);
    try {
      // 先保存到本地草稿
      draftStorage.save(store.currentDraft);
      // 再保存到后端
      await saveNovel(store.currentDraft);
      store.setPhase('completed');
      onSaved?.();
    } catch (err: any) {
      store.setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  /* ---- 重新生成 ---- */
  const handleRegenerate = () => {
    store.reset();
    setActiveTab('config');
  };

  /* ---- 计算总字数 ---- */
  const totalWordCount = store.chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-bg-primary border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">AI 智能创作</h2>
                  <p className="text-xs text-text-muted">
                    {store.phase === 'idle' && '配置生成参数，开始创作'}
                    {store.phase === 'outlining' && '正在构思故事大纲...'}
                    {store.phase === 'generating' && `正在生成第 ${store.currentChapter}/${store.totalChapters} 章...`}
                    {store.phase === 'preview' && '生成完成，预览并保存'}
                    {store.phase === 'completed' && '已保存到小说馆'}
                    {store.phase === 'error' && '生成出错'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 标签切换 */}
            {(store.phase !== 'idle' || activeTab !== 'config') && (
              <div className="shrink-0 flex items-center gap-1 px-6 py-2 border-b border-white/5 bg-bg-secondary/30">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'config'
                      ? 'bg-neon-purple/15 text-neon-purple'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  配置
                </button>
                {(store.phase === 'outlining' || store.phase === 'generating' || store.phase === 'error') && (
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'progress'
                        ? 'bg-neon-purple/15 text-neon-purple'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    进度
                  </button>
                )}
                {(store.phase === 'preview' || store.phase === 'completed') && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-neon-purple/15 text-neon-purple'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    预览
                  </button>
                )}
              </div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* 配置面板 */}
                {activeTab === 'config' && (
                  <motion.div
                    key="config"
                    className="p-6 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* 故事提示词 */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        故事灵感 <span className="text-neon-pink">*</span>
                      </label>
                      <textarea
                        value={config.prompt}
                        onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                        placeholder="描述你想要的故事：主角、背景、核心冲突、期望的结局方向...&#10;例如：一个失忆的侦探在雨夜醒来，发现自己身边有一具尸体，而所有证据都指向他是凶手..."
                        rows={4}
                        className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 resize-none"
                      />
                      <p className="text-xs text-text-muted mt-1">
                        提示词越详细，生成效果越好。建议包含：主角设定、故事背景、核心冲突、期望风格。
                      </p>
                    </div>

                    {/* 类型选择 */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">故事类型</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {genreOptions.map((g) => {
                          const Icon = g.icon;
                          return (
                            <button
                              key={g.value}
                              onClick={() => setConfig({ ...config, genre: g.value })}
                              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all ${
                                config.genre === g.value
                                  ? 'bg-neon-purple/10 border-neon-purple/30'
                                  : 'bg-bg-secondary border-white/5 hover:border-white/20'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${config.genre === g.value ? g.color : 'text-text-muted'}`} />
                              <span className={`text-xs ${config.genre === g.value ? 'text-text-primary' : 'text-text-muted'}`}>
                                {g.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 字数和章节 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          目标字数: <span className="text-neon-purple">{config.wordCount.toLocaleString()}</span> 字
                        </label>
                        <input
                          type="range"
                          min="3000"
                          max="50000"
                          step="1000"
                          value={config.wordCount}
                          onChange={(e) => setConfig({ ...config, wordCount: parseInt(e.target.value) })}
                          className="w-full accent-neon-purple"
                        />
                        <div className="flex justify-between text-xs text-text-muted mt-1">
                          <span>3,000</span>
                          <span>50,000</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          章节数: <span className="text-neon-purple">{config.chapterCount}</span> 章
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="20"
                          step="1"
                          value={config.chapterCount}
                          onChange={(e) => setConfig({ ...config, chapterCount: parseInt(e.target.value) })}
                          className="w-full accent-neon-purple"
                        />
                        <div className="flex justify-between text-xs text-text-muted mt-1">
                          <span>3章</span>
                          <span>20章</span>
                        </div>
                      </div>
                    </div>

                    {/* 风格选择 */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">写作风格</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {styleOptions.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setConfig({ ...config, style: s.value })}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                              config.style === s.value
                                ? 'bg-neon-purple/10 border-neon-purple/30'
                                : 'bg-bg-secondary border-white/5 hover:border-white/20'
                            }`}
                          >
                            <p className={`text-sm font-medium ${config.style === s.value ? 'text-text-primary' : 'text-text-secondary'}`}>
                              {s.label}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 基调选择 */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">情感基调</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {toneOptions.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setConfig({ ...config, tone: t.value })}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                              config.tone === t.value
                                ? 'bg-neon-purple/10 border-neon-purple/30'
                                : 'bg-bg-secondary border-white/5 hover:border-white/20'
                            }`}
                          >
                            <p className={`text-sm font-medium ${config.tone === t.value ? 'text-text-primary' : 'text-text-secondary'}`}>
                              {t.label}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 开始按钮 */}
                    <motion.button
                      onClick={handleStartGeneration}
                      disabled={!config.prompt.trim() || store.isGenerating}
                      className="w-full py-3.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-purple transition-shadow disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {store.isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {store.isGenerating ? '生成中...' : '开始 AI 创作'}
                    </motion.button>
                  </motion.div>
                )}

                {/* 进度面板 */}
                {activeTab === 'progress' && (
                  <motion.div
                    key="progress"
                    className="p-6 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* 进度条 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text-secondary">
                          {store.phase === 'outlining' ? '构思大纲中...' : `生成章节中...`}
                        </span>
                        <span className="text-sm font-bold text-neon-purple">{store.progress}%</span>
                      </div>
                      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${store.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* 大纲展示 */}
                    {store.outline && (
                      <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
                        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-neon-purple" />
                          故事大纲
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-text-muted mb-1">标题</p>
                            <p className="text-sm text-text-primary font-medium">{store.outline.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted mb-1">简介</p>
                            <p className="text-sm text-text-secondary">{store.outline.description}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted mb-1">钩子</p>
                            <p className="text-sm text-neon-purple">{store.outline.hook}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted mb-1">情感弧线</p>
                            <p className="text-sm text-text-secondary">{store.outline.emotionalArc}</p>
                          </div>
                          {store.outline.plotTwists.length > 0 && (
                            <div>
                              <p className="text-xs text-text-muted mb-1">关键反转</p>
                              <div className="flex flex-wrap gap-1.5">
                                {store.outline.plotTwists.map((twist, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-xs text-neon-pink"
                                  >
                                    {twist}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 章节进度 */}
                    {store.outline?.chapters && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-text-secondary">章节进度</h3>
                        <div className="space-y-2">
                          {store.outline.chapters.map((ch) => {
                            const isCompleted = store.chapters.some((c) => c.chapterNumber === ch.chapterNumber);
                            const isCurrent = ch.chapterNumber === store.currentChapter;
                            return (
                              <div
                                key={ch.chapterNumber}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                                  isCompleted
                                    ? 'bg-neon-green/5 border-neon-green/20'
                                    : isCurrent
                                      ? 'bg-neon-purple/5 border-neon-purple/30'
                                      : 'bg-bg-secondary/40 border-white/5'
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCompleted
                                      ? 'bg-neon-green text-white'
                                      : isCurrent
                                        ? 'bg-neon-purple text-white'
                                        : 'bg-bg-tertiary text-text-muted'
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : ch.chapterNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${isCompleted ? 'text-neon-green' : 'text-text-primary'}`}>
                                    {ch.title}
                                  </p>
                                  <p className="text-xs text-text-muted truncate">{ch.summary}</p>
                                </div>
                                {isCurrent && <Loader2 className="w-4 h-4 text-neon-purple animate-spin" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 错误提示 */}
                    {store.error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {store.error}
                      </div>
                    )}

                    {/* 取消按钮 */}
                    {store.isGenerating && (
                      <motion.button
                        onClick={handleCancel}
                        className="w-full py-3 bg-bg-secondary border border-white/10 text-text-secondary text-sm font-medium rounded-xl hover:border-neon-pink/30 hover:text-neon-pink transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        取消生成
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* 预览面板 */}
                {activeTab === 'preview' && store.currentDraft && (
                  <motion.div
                    key="preview"
                    className="p-6 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* 小说信息 */}
                    <div className="rounded-xl bg-bg-secondary/60 border border-white/5 p-4">
                      <h3 className="text-lg font-bold text-text-primary mb-1">{store.currentDraft.title}</h3>
                      <p className="text-sm text-text-secondary mb-2">{store.currentDraft.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {store.currentDraft.chapters.length} 章
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {totalWordCount.toLocaleString()} 字
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {store.currentDraft.hook}
                        </span>
                      </div>
                    </div>

                    {/* 章节预览 */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-text-secondary">章节预览</h3>
                      {store.currentDraft.chapters.map((chapter) => (
                        <div
                          key={chapter.chapterNumber}
                          className="rounded-xl bg-bg-secondary/40 border border-white/5 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neon-purple font-bold">第{chapter.chapterNumber}章</span>
                              <span className="text-sm text-text-primary font-medium">{chapter.title}</span>
                            </div>
                            <span className="text-xs text-text-muted">{chapter.wordCount} 字</span>
                          </div>
                          <div className="px-4 py-3 max-h-40 overflow-y-auto">
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                              {chapter.content.slice(0, 500)}
                              {chapter.content.length > 500 && (
                                <span className="text-text-muted">...（共 {chapter.wordCount} 字）</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-neon-purple transition-shadow disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? '保存中...' : '保存到小说馆'}
                      </motion.button>
                      <motion.button
                        onClick={handleRegenerate}
                        className="px-4 py-3 bg-bg-secondary border border-white/10 text-text-secondary text-sm font-medium rounded-xl flex items-center gap-2 hover:border-white/20 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        重新生成
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
