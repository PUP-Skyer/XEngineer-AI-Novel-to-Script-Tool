import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Wand2, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import scriptService from '@/services/scriptService';
import Button from '@/components/ui/Button';

type ConvertPhase = 'confirm' | 'analyzing' | 'characters' | 'scenes' | 'dialogues' | 'completed' | 'error';

interface ConvertProgress {
  phase: ConvertPhase;
  progress: number;
  message: string;
  scriptId?: number;
  error?: string;
}

const PHASES: { key: ConvertPhase; label: string; icon: typeof BookOpen; description: string }[] = [
  { key: 'analyzing', label: '解析小说', icon: BookOpen, description: 'AI 正在分析小说结构、人物关系和情节线...' },
  { key: 'characters', label: '生成角色', icon: Users, description: '正在提取并设定虚拟角色的性格、背景和秘密...' },
  { key: 'scenes', label: '划分场景', icon: Wand2, description: '正在将故事拆分为独立场景并设计选择分支...' },
  { key: 'dialogues', label: '创作对白', icon: FileText, description: '正在基于角色性格创作自然对白...' },
];

// 模拟进度（实际项目中应由后端轮询驱动）
const MOCK_PHASE_PROGRESS: Record<ConvertPhase, number> = {
  confirm: 0,
  analyzing: 15,
  characters: 40,
  scenes: 65,
  dialogues: 90,
  completed: 100,
  error: 0,
};

export default function ScriptConvert() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<ConvertProgress>({
    phase: 'confirm',
    progress: 0,
    message: '',
  });
  const [novelTitle, setNovelTitle] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);

  // 开始转换
  const startConversion = useCallback(async () => {
    if (!novelId) return;
    const id = Number(novelId);

    setProgress({ phase: 'analyzing', progress: 5, message: '正在启动 AI 转换引擎...' });
    setCurrentPhaseIndex(0);

    try {
      const result = await scriptService.convertNovel(id);
      setTaskId(result.taskId);

      // 模拟阶段推进（实际应轮询 getConvertStatus）
      simulateProgress(result.taskId, id);
    } catch (err: any) {
      setProgress({
        phase: 'error',
        progress: 0,
        message: err?.response?.data?.message || err?.message || '转换失败',
        error: err?.response?.data?.message || err?.message,
      });
    }
  }, [novelId]);

  // 模拟进度推进
  const simulateProgress = (taskId: string, novelId: number) => {
    const phases: ConvertPhase[] = ['analyzing', 'characters', 'scenes', 'dialogues'];
    let index = 0;

    const advancePhase = () => {
      if (index >= phases.length) {
        // 轮询后端获取最终结果
        pollForResult(taskId, novelId);
        return;
      }

      const phase = phases[index];
      setCurrentPhaseIndex(index);
      setProgress({
        phase,
        progress: MOCK_PHASE_PROGRESS[phase],
        message: PHASES.find((p) => p.key === phase)?.description || '',
      });

      index++;
      // 基于阶段的延迟（分析快，对白慢）
      const delay = phase === 'dialogues' ? 4000 : phase === 'scenes' ? 3000 : 2000;
      setTimeout(advancePhase, delay);
    };

    advancePhase();
  };

  // 轮询后端获取转换结果
  const pollForResult = async (taskId: string, novelId: number) => {
    let attempts = 0;
    const maxAttempts = 60; // 最多轮询 60 次

    const poll = async () => {
      attempts++;
      try {
        const status = await scriptService.getConvertStatus(taskId);
        if (status.status === 'completed' && status.scriptId) {
          setProgress({
            phase: 'completed',
            progress: 100,
            message: '剧本转换完成！',
            scriptId: status.scriptId,
          });
          return;
        }
        if (status.status === 'failed') {
          setProgress({
            phase: 'error',
            progress: 0,
            message: status.error || '转换失败',
            error: status.error,
          });
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // 超时，尝试直接查找剧本
          try {
            const scripts = await scriptService.getScriptList({ page: 1, pageSize: 10 });
            const found = scripts.items.find((s) => s.novelId === novelId);
            if (found) {
              setProgress({ phase: 'completed', progress: 100, message: '剧本转换完成！', scriptId: found.id });
            } else {
              setProgress({ phase: 'error', progress: 0, message: '转换超时，请稍后在剧本列表中查看', error: 'timeout' });
            }
          } catch {
            setProgress({ phase: 'error', progress: 0, message: '转换超时', error: 'timeout' });
          }
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setProgress({ phase: 'error', progress: 0, message: '无法获取转换状态', error: 'poll_failed' });
        }
      }
    };

    poll();
  };

  // 进度条动画
  const ProgressBar = () => (
    <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #a855f7, #6366f1, #22d3ee)',
          backgroundSize: '200% 100%',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress.progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );

  // 阶段指示器
  const PhaseIndicator = () => (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {PHASES.map((phase, index) => {
        const isCompleted = currentPhaseIndex > index;
        const isCurrent = currentPhaseIndex === index;
        const Icon = phase.icon;

        return (
          <div key={phase.key} className="flex flex-col items-center relative">
            {/* 连接线 */}
            {index < PHASES.length - 1 && (
              <div
                className="absolute top-5 left-full w-12 sm:w-16 lg:w-24 h-0.5"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(90deg, #a855f7, #6366f1)'
                    : '#2a2a45',
                }}
              />
            )}
            {/* 圆圈 */}
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                isCompleted
                  ? 'bg-neon-purple/20 border-2 border-neon-purple'
                  : isCurrent
                  ? 'bg-neon-purple/10 border-2 border-neon-blue animate-pulse'
                  : 'bg-bg-tertiary border-2 border-bg-elevated'
              }`}
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-neon-green" />
              ) : (
                <Icon
                  className={`w-5 h-5 ${
                    isCurrent ? 'text-neon-purple' : 'text-text-muted'
                  }`}
                />
              )}
            </motion.div>
            {/* 标签 */}
            <span
              className={`mt-2 text-xs font-medium ${
                isCompleted || isCurrent ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  // 确认页面
  if (progress.phase === 'confirm') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Link
            to={novelId ? `/novels/${novelId}` : '/novels'}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回小说详情
          </Link>

          <div className="neon-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-neon-purple" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-3">
              AI 剧本转换
            </h1>
            <p className="text-text-secondary mb-2">
              将你的小说转化为沉浸式剧本杀
            </p>
            {novelTitle && (
              <p className="text-neon-purple font-medium mb-6">
                「{novelTitle}」
              </p>
            )}

            <div className="bg-bg-tertiary rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-text-primary mb-3">
                转换过程将包含：
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-blue" />
                  虚拟角色设定（性格、背景、秘密、动机）
                </li>
                <li className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-neon-purple" />
                  场景划分与选择分支设计
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neon-cyan" />
                  基于角色性格的自然对白生成
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neon-green" />
                  YAML 格式结构化剧本输出
                </li>
              </ul>
            </div>

            <Button
              onClick={startConversion}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              开始转换
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 错误页面
  if (progress.phase === 'error') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="neon-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">转换失败</h1>
            <p className="text-text-secondary mb-6">{progress.error || '未知错误'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(novelId ? `/novels/${novelId}` : '/novels')} variant="ghost">
                返回
              </Button>
              <Button onClick={startConversion} variant="primary">
                重新尝试
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 完成页面
  if (progress.phase === 'completed') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="neon-card p-8 text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle className="w-10 h-10 text-neon-green" />
            </motion.div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">转换完成！</h1>
            <p className="text-text-secondary mb-6">
              你的剧本已生成，包含完整的角色设定和对白
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/novels')} variant="ghost">
                返回陈列馆
              </Button>
              {progress.scriptId && (
                <Button
                  onClick={() => navigate(`/scripts/${progress.scriptId}`)}
                  variant="primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  查看剧本
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 转换进行中
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PhaseIndicator />

          <div className="neon-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 text-neon-purple animate-spin" />
              <h2 className="text-xl font-bold text-text-primary">
                AI 正在创作你的剧本
              </h2>
            </div>

            <ProgressBar />

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-text-secondary">{progress.message}</span>
              <span className="text-neon-purple font-medium">{progress.progress}%</span>
            </div>

            {/* 当前阶段详情 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={progress.phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-bg-tertiary rounded-lg"
              >
                {(() => {
                  const phaseInfo = PHASES.find((p) => p.key === progress.phase);
                  if (!phaseInfo) return null;
                  const Icon = phaseInfo.icon;
                  return (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-neon-purple" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary">{phaseInfo.label}</h3>
                        <p className="text-sm text-text-secondary mt-1">{phaseInfo.description}</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-text-muted mt-6 text-center">
              转换通常需要 1-3 分钟，请耐心等待...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
