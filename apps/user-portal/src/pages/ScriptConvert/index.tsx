import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, Wand2, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft, Sparkles,
  Clock, Mic, Camera, Music, Volume2
} from 'lucide-react';
import scriptService from '@/services/scriptService';
import Button from '@/components/ui/Button';

type ConvertPhase = 'confirm' | 'analyzing' | 'characters' | 'scenes' | 'dialogues' | 'completed' | 'error';

interface ConvertProgress {
  phase: ConvertPhase;
  progress: number;
  message: string;
  scriptId?: number;
  scriptStats?: {
    totalScenes: number;
    totalDialogues: number;
    totalShots: number;
    totalChoices: number;
    totalDuration: number;
    characterCount: number;
  };
  error?: string;
}

const PHASES: { key: ConvertPhase; label: string; icon: typeof BookOpen; description: string }[] = [
  { key: 'analyzing', label: '解析小说', icon: BookOpen, description: 'AI 正在分析小说10章完整结构、人物关系和情节线...' },
  { key: 'characters', label: '生成角色', icon: Users, description: '提取角色设定，分配AI人声音色（清亮/低沉/沙哑/清冷等）...' },
  { key: 'scenes', label: '划分场景', icon: Wand2, description: '将故事拆分为30+场景，每场标注分镜、机位、音效和BGM...' },
  { key: 'dialogues', label: '创作对白', icon: FileText, description: '基于角色性格创作完整对白，标注每句情感和语音风格...' },
];

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
  const pollingRef = useRef<number | null>(null);

  const [progress, setProgress] = useState<ConvertProgress>({
    phase: 'confirm',
    progress: 0,
    message: '',
  });
  const [novelTitle, setNovelTitle] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);

  const startConversion = async () => {
    if (!novelId) return;
    const id = Number(novelId);

    setProgress({ phase: 'analyzing', progress: 5, message: '正在启动 AI 转换引擎...' });
    setCurrentPhaseIndex(0);

    try {
      const result = await scriptService.convertNovel(id);
      setTaskId(result.taskId);
      simulateProgress(result.taskId, id);
    } catch (err: any) {
      setProgress({
        phase: 'error',
        progress: 0,
        message: err?.response?.data?.message || err?.message || '转换失败',
        error: err?.response?.data?.message || err?.message,
      });
    }
  };

  const simulateProgress = (taskId: string, novelId: number) => {
    const phases: ConvertPhase[] = ['analyzing', 'characters', 'scenes', 'dialogues'];
    let index = 0;

    const advancePhase = () => {
      if (index >= phases.length) {
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
      const delay = phase === 'dialogues' ? 4000 : phase === 'scenes' ? 3000 : 2000;
      setTimeout(advancePhase, delay);
    };

    advancePhase();
  };

  const pollForResult = async (taskId: string, novelId: number) => {
    let attempts = 0;
    const maxAttempts = 60;

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
            scriptStats: status.stats,
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
          pollingRef.current = window.setTimeout(poll, 2000);
        } else {
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
          pollingRef.current = window.setTimeout(poll, 2000);
        } else {
          setProgress({ phase: 'error', progress: 0, message: '无法获取转换状态', error: 'poll_failed' });
        }
      }
    };

    poll();
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

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

  const PhaseIndicator = () => (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {PHASES.map((phase, index) => {
        const isCompleted = currentPhaseIndex > index;
        const isCurrent = currentPhaseIndex === index;
        const Icon = phase.icon;
        return (
          <div key={phase.key} className="flex flex-col items-center relative">
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
            <span className={`mt-2 text-xs font-medium ${isCompleted || isCurrent ? 'text-text-primary' : 'text-text-muted'}`}>
              {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (progress.phase === 'confirm') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full">
          <Link to={novelId ? `/novels/${novelId}` : '/novels'} className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回小说详情
          </Link>
          <div className="neon-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-neon-purple" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">AI 剧本转换 v2.0</h1>
            <p className="text-text-secondary mb-2">将小说完整10章内容转换为沉浸式剧本</p>
            {novelTitle && <p className="text-neon-purple font-medium mb-6">「{novelTitle}」</p>}

            <div className="bg-bg-tertiary rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-text-primary mb-3">全新升级包含：</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-neon-blue" /> 完整角色设定 + <span className="text-neon-cyan">AI人声音色</span>（清亮/低沉/沙哑/清冷）</li>
                <li className="flex items-center gap-2"><Camera className="w-4 h-4 text-neon-purple" /> <span className="text-neon-cyan">30+分镜头</span>（机位、景别、镜头语言、转场方式）</li>
                <li className="flex items-center gap-2"><Mic className="w-4 h-4 text-neon-cyan" /> 完整对白 + 每句<span className="text-neon-cyan">情感标注</span> + 语音风格</li>
                <li className="flex items-center gap-2"><Music className="w-4 h-4 text-neon-green" /> 场景 <span className="text-neon-cyan">BGM</span> + <span className="text-neon-cyan">音效</span> 设计（雷声/脚步声/心跳声等）</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-neon-pink" /> 总时长 <span className="text-neon-cyan">30-60 分钟</span>，分场景时长标注</li>
              </ul>
            </div>

            <Button onClick={startConversion} variant="primary" size="lg" className="w-full">
              <Sparkles className="w-5 h-5 mr-2" />
              开始转换
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (progress.phase === 'error') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
          <div className="neon-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">转换失败</h1>
            <p className="text-text-secondary mb-6">{progress.error || '未知错误'}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(novelId ? `/novels/${novelId}` : '/novels')} variant="ghost">返回</Button>
              <Button onClick={startConversion} variant="primary">重新尝试</Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (progress.phase === 'completed') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full">
          <div className="neon-card p-8 text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle className="w-10 h-10 text-neon-green" />
            </motion.div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">转换完成！</h1>

            {progress.scriptStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Camera className="w-5 h-5 text-neon-purple mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{progress.scriptStats.totalScenes}</div>
                  <div className="text-xs text-text-muted">场景</div>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Mic className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{progress.scriptStats.totalDialogues}</div>
                  <div className="text-xs text-text-muted">对话/旁白</div>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Clock className="w-5 h-5 text-neon-green mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{Math.round(progress.scriptStats.totalDuration)}</div>
                  <div className="text-xs text-text-muted">分钟预计时长</div>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Users className="w-5 h-5 text-neon-blue mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{progress.scriptStats.characterCount}</div>
                  <div className="text-xs text-text-muted">角色（含配音）</div>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Wand2 className="w-5 h-5 text-neon-pink mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{progress.scriptStats.totalShots}</div>
                  <div className="text-xs text-text-muted">分镜头</div>
                </div>
                <div className="bg-bg-tertiary rounded-xl p-3">
                  <Music className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-text-primary">{progress.scriptStats.totalChoices}</div>
                  <div className="text-xs text-text-muted">剧情分支</div>
                </div>
              </div>
            )}

            <p className="text-text-secondary mb-6 text-sm">
              完整覆盖10章，包含完整角色对白、分镜脚本、BGM及音效设计
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/novels')} variant="ghost">返回陈列馆</Button>
              {progress.scriptId && (
                <Button onClick={() => navigate(`/scripts/${progress.scriptId}`)} variant="primary">
                  <Volume2 className="w-4 h-4 mr-2" />
                  查看完整剧本
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PhaseIndicator />
          <div className="neon-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 text-neon-purple animate-spin" />
              <h2 className="text-xl font-bold text-text-primary">AI 正在创作你的剧本</h2>
            </div>
            <ProgressBar />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-text-secondary">{progress.message}</span>
              <span className="text-neon-purple font-medium">{progress.progress}%</span>
            </div>
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
              基于小说完整10章内容转换，预计生成30+场景 · 30+分钟完整剧本
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
