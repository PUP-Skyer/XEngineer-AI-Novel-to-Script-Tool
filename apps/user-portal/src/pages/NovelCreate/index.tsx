import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, BookOpen, FileText, Hash, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { novelService } from '@/services/novelService';
import type { NovelGenre } from '@asg/shared';

const genreOptions: { value: NovelGenre; label: string; description: string }[] = [
  { value: 'suspense', label: '悬疑', description: '推理与谜题' },
  { value: 'fantasy', label: '奇幻', description: '魔法与冒险' },
  { value: 'scifi', label: '科幻', description: '未来与科技' },
  { value: 'romance', label: '言情', description: '情感与关系' },
  { value: 'horror', label: '恐怖', description: '惊悚与恐怖' },
  { value: 'action', label: '动作', description: '战斗与冒险' },
  { value: 'comedy', label: '喜剧', description: '幽默与搞笑' },
  { value: 'drama', label: '剧情', description: '人生与故事' },
  { value: 'other', label: '其他', description: '自定义类型' },
];

export default function NovelCreate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<NovelGenre>('suspense');
  const [wordCountTarget, setWordCountTarget] = useState(5000);
  const [chapterCount, setChapterCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [preview, setPreview] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setProgress(0);
    setProgressMessage('正在初始化 AI 创作引擎...');

    try {
      const novel = await novelService.generate({
        prompt: prompt.trim(),
        genre,
        wordCountTarget,
        chapterCount,
        title: title.trim() || undefined,
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      setProgressMessage('AI 正在创作你的小说...');

      // Simulate completion
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setProgressMessage('创作完成！');
        setPreview(novel.content?.substring(0, 500) + '...' || '小说已生成成功');

        // Navigate to novel detail after a brief pause
        setTimeout(() => {
          navigate(`/novels/${novel.id}`);
        }, 1500);
      }, 5000);
    } catch (err: any) {
      setProgressMessage(`生成失败: ${err.message}`);
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setTitle('');
    setGenre('suspense');
    setWordCountTarget(5000);
    setChapterCount(5);
    setGenerating(false);
    setProgress(0);
    setProgressMessage('');
    setPreview('');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">
              AI 小说生成
            </h1>
          </div>
          <p className="text-text-secondary ml-[52px]">
            描述你想要的故事，让 AI 为你创作
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <FileText className="w-4 h-4 inline mr-1.5" />
                小说标题（可选）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="留空将由 AI 自动生成"
                className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors"
              />
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Sparkles className="w-4 h-4 inline mr-1.5" />
                故事描述 *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="描述你想要的故事背景、人物、情节走向...&#10;&#10;例如：一个发生在未来都市的悬疑故事，主角是一位失忆的侦探，在调查一起连环案件的过程中逐渐发现自己的过去..."
                className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/40 transition-colors resize-none leading-relaxed"
              />
              <p className="mt-1 text-xs text-text-muted">
                {prompt.length} / 2000 字符
              </p>
            </div>

            {/* Genre Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                <BookOpen className="w-4 h-4 inline mr-1.5" />
                故事类型
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genreOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGenre(option.value)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      genre === option.value
                        ? 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple'
                        : 'bg-bg-secondary border-white/5 text-text-secondary hover:border-white/15'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <Hash className="w-4 h-4 inline mr-1.5" />
                  目标字数
                </label>
                <select
                  value={wordCountTarget}
                  onChange={(e) => setWordCountTarget(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-neon-purple/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value={3000}>约 3,000 字</option>
                  <option value={5000}>约 5,000 字</option>
                  <option value={10000}>约 10,000 字</option>
                  <option value={20000}>约 20,000 字</option>
                  <option value={50000}>约 50,000 字</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1.5" />
                  章节数
                </label>
                <select
                  value={chapterCount}
                  onChange={(e) => setChapterCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-neon-purple/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value={3}>3 章</option>
                  <option value={5}>5 章</option>
                  <option value={10}>10 章</option>
                  <option value={15}>15 章</option>
                  <option value={20}>20 章</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Right: Preview & Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Generate Button */}
            <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 space-y-4">
              <Button
                onClick={handleGenerate}
                loading={generating}
                fullWidth
                size="lg"
                disabled={!prompt.trim()}
                icon={<Wand2 className="w-5 h-5" />}
              >
                {generating ? '生成中...' : '开始生成'}
              </Button>

              {generating && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-text-muted text-center">
                    {progressMessage}
                  </p>
                </div>
              )}

              {!generating && (
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  重置
                </button>
              )}
            </div>

            {/* Preview Area */}
            {preview && (
              <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  预览
                </h3>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {preview}
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-bg-secondary border border-neon-purple/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-neon-purple mb-3">
                写作提示
              </h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">1.</span>
                  描述越详细，生成的小说越符合你的期望
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">2.</span>
                  可以指定人物性格、背景、故事走向
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">3.</span>
                  建议 5000-10000 字，获得最佳阅读体验
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">4.</span>
                  生成后可一键转换为剧本杀
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
