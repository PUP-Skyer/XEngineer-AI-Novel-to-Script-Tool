import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, MapPin, MessageSquare, FileText, Save, Play, ChevronRight, ChevronLeft,
  Clock, Mic, Camera, Music, Volume2, AlertCircle, Film, Sun, Speaker, Headphones
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/services/apiClient';

interface Character {
  id: number; scriptId: number; name: string; type: string; gender: string; age: number;
  personality: string; background: string; appearance: string; secret: string; motivation: string;
  isPlayable: boolean; voicePreset: string; voiceConfig: { gender: string; age: string; tone: string; speed: string; description: string };
}
interface CameraShot { shotNumber: number; type: string; description: string; duration: number; }
interface StoryboardShot { shotNumber: number; cameraAngle: string; description: string; duration: number; transition: string; }
interface SoundEffect { name: string; file: string; duration: number; timing: string; }
interface BGM { name: string; file: string; mood: string; volume: number; }
interface Choice { id: number; sceneId: number; text: string; consequence: string; nextSceneOffset: number; }
interface StageDirection { id: number; description: string; timing: string; }
interface Dialogue {
  id: number; sceneId: number; characterId: number | null; characterName: string;
  dialogueOrder: number; content: string; emotion: string; type: string; action: string;
  stageDirection: string; voiceStyle: string; soundEffect: SoundEffect | null;
}
interface Scene {
  id: number; scriptId: number; sceneNumber: number; actNumber: number; actTitle: string;
  title: string; location: string; time: string; description: string; atmosphere: string;
  storyboard: StoryboardShot[]; cameraShots: CameraShot[]; soundEffects: SoundEffect[];
  bgm: BGM; estimatedDuration: number; dialogues: Dialogue[]; choices: Choice[];
  stageDirections: StageDirection[];
}
interface Script {
  id: number; novelId: number; title: string; description: string; difficulty: string;
  playerCountMin: number; playerCountMax: number; estimatedDuration: number; status: string;
  version: number; yamlContent: string; characters: Character[]; scenes: Scene[];
}

export default function ScriptEditor() {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [playingDialogue, setPlayingDialogue] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchScript = async () => {
      try {
        const { data } = await apiClient.get(`/scripts/${id}`);
        setScript(data);
      } catch { /**/ } finally { setLoading(false); }
    };
    fetchScript();
  }, [id]);

  const speakDialogue = (dialogue: Dialogue) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dialogue.content);
      utterance.lang = 'zh-CN';
      utterance.rate = dialogue.type === 'narration' ? 0.9 : 1.0;
      utterance.pitch = dialogue.emotion === '愤怒' || dialogue.emotion === '激动' ? 1.2 : 1.0;
      setPlayingDialogue(dialogue.id);
      utterance.onend = () => setPlayingDialogue(null);
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="加载剧本..." /></div>;
  if (!script) return <div className="min-h-screen flex items-center justify-center"><p className="text-text-secondary">剧本不存在</p></div>;

  const currentScene = script.scenes[activeSceneIndex];
  const totalDuration = script.scenes.reduce((s, sc) => s + (sc.estimatedDuration || 0), 0);
  const totalDialogues = script.scenes.reduce((s, sc) => s + (sc.dialogues?.length || 0), 0);

  const ActIndicator = () => {
    const acts = [1, 2, 3];
    return (
      <div className="flex gap-1 mb-3">
        {acts.map(act => {
          const actScenes = script.scenes.filter(s => s.actNumber === act);
          const isActive = currentScene?.actNumber === act;
          return (
            <div key={act} className={`flex-1 text-center py-1 text-xs rounded-md ${isActive ? 'bg-neon-purple/20 text-neon-purple font-medium' : 'bg-bg-tertiary text-text-muted'}`}>
              第{act}幕 · {actScenes.length}场
            </div>
          );
        })}
      </div>
    );
  };

  const SceneDurationBadge = ({ duration }: { duration: number }) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Panel: Characters */}
      <motion.div
        className={`${leftPanelOpen ? 'w-72' : 'w-12'} bg-bg-secondary border-r border-white/5 flex flex-col transition-all duration-300`}
        initial={false}
      >
        <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className="h-10 flex items-center justify-center text-text-muted hover:text-text-primary border-b border-white/5">
          {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {leftPanelOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-neon-purple" /><span className="text-sm font-medium text-text-primary">角色面板</span></div>
              <span className="text-xs text-text-muted">{script.characters.length}人</span>
            </div>
            <div className="space-y-1">
              {script.characters.map((character) => (
                <button key={character.id} onClick={() => setSelectedCharacter(character)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedCharacter?.id === character.id ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                  <div className="font-medium flex items-center gap-2">
                    {character.name}
                    {character.voicePreset !== 'narrator' && <Volume2 className="w-3 h-3 text-neon-cyan" />}
                  </div>
                  <div className="text-xs opacity-60 mt-0.5 flex items-center gap-2">
                    <span>{character.type} / {character.gender}</span>
                    {character.isPlayable && <span className="text-neon-green">（可操作）</span>}
                  </div>
                </button>
              ))}
            </div>
            {selectedCharacter && (
              <div className="mt-4 p-3 bg-bg-tertiary rounded-xl text-xs space-y-2">
                <h4 className="font-medium text-text-primary text-sm flex items-center gap-2">
                  {selectedCharacter.name}
                  <span className="text-xs text-text-muted font-normal">#{selectedCharacter.voicePreset}</span>
                </h4>
                <div className="space-y-1.5 text-text-secondary">
                  <p><span className="text-text-muted">性格：</span>{selectedCharacter.personality}</p>
                  <p><span className="text-text-muted">背景：</span>{selectedCharacter.background}</p>
                  {selectedCharacter.appearance && <p><span className="text-text-muted">外貌：</span>{selectedCharacter.appearance}</p>}
                  {selectedCharacter.secret && <p className="text-neon-pink"><span className="text-text-muted">秘密：</span>{selectedCharacter.secret}</p>}
                  {selectedCharacter.voiceConfig && (
                    <div className="mt-2 p-2 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
                      <div className="flex items-center gap-1 text-neon-cyan font-medium mb-1">
                        <Mic className="w-3 h-3" />
                        AI 人声配置
                      </div>
                      <p>音色：{selectedCharacter.voiceConfig.tone}</p>
                      <p>语速：{selectedCharacter.voiceConfig.speed}</p>
                      <p className="text-text-muted">{selectedCharacter.voiceConfig.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Center: Scene Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-bg-secondary border-b border-white/5">
          <ActIndicator />
          <div className="h-10 flex items-center gap-1 px-4 overflow-x-auto">
            {script.scenes.map((scene, index) => (
              <button key={scene.id} onClick={() => setActiveSceneIndex(index)}
                className={`shrink-0 px-3 py-1 text-xs rounded-md transition-colors ${index === activeSceneIndex ? 'bg-neon-purple/20 text-neon-purple' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
              >
                S{scene.sceneNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Scene Content */}
        {currentScene && (
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div key={currentScene.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              {/* Scene Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-text-primary">
                    {currentScene.actTitle} · 第{currentScene.sceneNumber}场：{currentScene.title}
                  </h2>
                  <SceneDurationBadge duration={currentScene.estimatedDuration} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{currentScene.location}</span>
                  <span>{currentScene.time}</span>
                  <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />氛围：{currentScene.atmosphere}</span>
                  {currentScene.bgm && <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" />BGM：{currentScene.bgm.name}</span>}
                </div>
              </div>

              {/* Scene Description */}
              <div className="p-4 bg-bg-tertiary rounded-xl text-sm text-text-secondary leading-relaxed">
                {currentScene.description}
              </div>

              {/* BGM + Sound Effects */}
              {(currentScene.bgm || currentScene.soundEffects?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentScene.bgm && (
                    <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-medium text-neon-cyan mb-1">
                        <Headphones className="w-4 h-4" />
                        背景音乐
                      </div>
                      <p className="text-sm text-text-primary">{currentScene.bgm.name} ({currentScene.bgm.mood})</p>
                      <p className="text-xs text-text-muted">音量：{Math.round(currentScene.bgm.volume * 100)}% · 循环播放</p>
                    </div>
                  )}
                  {currentScene.soundEffects?.length > 0 && (
                    <div className="p-3 bg-amber-400/5 border border-amber-400/20 rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-1">
                        <Speaker className="w-4 h-4" />
                        音效设计
                      </div>
                      <div className="space-y-1">
                        {currentScene.soundEffects.map((se, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-text-primary">{se.name}</span>
                            <span className="text-text-muted">[{se.timing}]</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Camera Shots / 分镜 */}
              {currentScene.cameraShots?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                    <Camera className="w-4 h-4 text-neon-purple" />
                    分镜脚本 · {currentScene.cameraShots.length}个机位
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {currentScene.cameraShots.map((shot) => (
                      <div key={shot.shotNumber} className="p-3 bg-bg-secondary border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-neon-purple">#{shot.shotNumber}</span>
                          <span className="text-xs text-text-muted">{shot.duration}s</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary">{shot.type}</p>
                        <p className="text-xs text-text-secondary mt-1">{shot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Storyboard (shot-by-shot) */}
              {currentScene.storyboard?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                    <Film className="w-4 h-4 text-neon-green" />
                    镜头分切 · {currentScene.storyboard.length}个镜头
                  </div>
                  <div className="space-y-2">
                    {currentScene.storyboard.map((shot) => (
                      <div key={shot.shotNumber} className="flex items-start gap-3 p-3 bg-bg-secondary border border-white/5 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-neon-green">{shot.shotNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-neon-cyan">{shot.cameraAngle}</span>
                            <span className="text-xs text-text-muted">{shot.duration}s</span>
                            <span className="text-xs text-text-muted">转场：{shot.transition}</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{shot.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Directions */}
              {currentScene.stageDirections?.length > 0 && (
                <div className="p-3 bg-amber-400/5 border border-amber-400/10 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-2">
                    <span className="text-lg">🎬</span>
                    舞台指示
                  </div>
                  <div className="space-y-1 text-sm text-text-secondary">
                    {currentScene.stageDirections.map((sd, i) => (
                      <p key={i}>[{sd.timing}] {sd.description}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Dialogues */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <MessageSquare className="w-4 h-4 text-neon-blue" />
                    对白 · {currentScene.dialogues.length}句
                  </div>
                  <SceneDurationBadge duration={currentScene.estimatedDuration} />
                </div>
                {currentScene.dialogues.map((dialogue) => {
                  const character = script.characters.find(c => c.id === dialogue.characterId);
                  return (
                    <div key={dialogue.id} className="group p-4 bg-bg-secondary border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      {dialogue.type === 'narration' ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => speakDialogue(dialogue)}
                            className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neon-purple/20"
                            title="播放旁白"
                          >
                            <Volume2 className="w-3 h-3 text-neon-cyan" />
                          </button>
                          <p className="text-text-muted italic text-sm leading-relaxed flex-1">
                            {dialogue.content}
                          </p>
                        </div>
                      ) : dialogue.type === 'stage_direction' ? (
                        <p className="text-neon-cyan text-sm">
                          [{dialogue.content}]
                        </p>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => speakDialogue(dialogue)}
                            className={`mt-1 shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              playingDialogue === dialogue.id
                                ? 'bg-neon-purple text-white animate-pulse'
                                : 'bg-bg-tertiary text-text-muted opacity-0 group-hover:opacity-100 hover:bg-neon-purple/20'
                            }`}
                            title="播放AI人声对话"
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${playingDialogue === dialogue.id ? 'text-white' : ''}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-neon-purple">
                                {character?.name || dialogue.characterName || '未知'}
                              </span>
                              {dialogue.emotion && (
                                <span className="text-xs text-text-muted italic">
                                  （{dialogue.emotion}）
                                </span>
                              )}
                              <span className="text-[10px] text-neon-cyan/60">
                                [{dialogue.voiceStyle}]
                              </span>
                            </div>
                            <p className="text-sm text-text-primary leading-relaxed">
                              {dialogue.content}
                            </p>
                            {dialogue.action && <p className="text-xs text-text-muted mt-1 italic">{dialogue.action}</p>}
                            {dialogue.soundEffect && (
                              <p className="text-xs text-amber-400 mt-1">
                                🔊 音效：{dialogue.soundEffect.name}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Choices */}
              {currentScene.choices?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <FileText className="w-4 h-4 text-neon-green" />
                    选择分支
                  </div>
                  {currentScene.choices.map((choice) => (
                    <div key={choice.id} className="p-3 bg-neon-green/5 border border-neon-green/20 rounded-xl text-sm text-text-secondary hover:bg-neon-green/10 cursor-pointer transition-colors">
                      <span className="text-neon-green mr-2">[选项]</span>
                      {choice.text}
                      {choice.consequence && <p className="mt-1 text-xs text-text-muted italic">结果: {choice.consequence}</p>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="h-12 flex items-center justify-between px-4 bg-bg-secondary border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" icon={<Save className="w-3.5 h-3.5" />}>保存</Button>
            <Button size="sm" icon={<Play className="w-3.5 h-3.5" />}>开始游戏</Button>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>场景 {activeSceneIndex + 1} / {script.scenes.length}</span>
            <span>总计 {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</span>
            <span>{totalDialogues} 句对白</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Stats */}
      <motion.div
        className={`${rightPanelOpen ? 'w-72' : 'w-12'} bg-bg-secondary border-l border-white/5 flex flex-col transition-all duration-300`}
        initial={false}
      >
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="h-10 flex items-center justify-center text-text-muted hover:text-text-primary border-b border-white/5">
          {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {rightPanelOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center gap-2 mb-4 px-1">
              <FileText className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-medium text-text-primary">剧作信息</span>
            </div>

            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-bg-tertiary rounded-lg text-center">
                  <div className="text-lg font-bold text-neon-purple">{script.scenes.length}</div>
                  <div className="text-[10px] text-text-muted">场景</div>
                </div>
                <div className="p-2 bg-bg-tertiary rounded-lg text-center">
                  <div className="text-lg font-bold text-neon-green">{Math.floor(totalDuration / 60)}′</div>
                  <div className="text-[10px] text-text-muted">总时长</div>
                </div>
                <div className="p-2 bg-bg-tertiary rounded-lg text-center">
                  <div className="text-lg font-bold text-neon-cyan">{script.characters.length}</div>
                  <div className="text-[10px] text-text-muted">角色</div>
                </div>
                <div className="p-2 bg-bg-tertiary rounded-lg text-center">
                  <div className="text-lg font-bold text-amber-400">{totalDialogues}</div>
                  <div className="text-[10px] text-text-muted">对白/旁白</div>
                </div>
              </div>

              {/* Act breakdown */}
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-text-muted">幕次分布</h4>
                {[1, 2, 3].map(act => {
                  const actScenes = script.scenes.filter(s => s.actNumber === act);
                  const actDuration = actScenes.reduce((s, sc) => s + (sc.estimatedDuration || 0), 0);
                  return (
                    <div key={act} className="flex items-center justify-between text-xs p-2 bg-bg-tertiary rounded-lg">
                      <span className="text-text-primary">第{act}幕</span>
                      <span className="text-text-muted">{actScenes.length}场 · {Math.floor(actDuration / 60)}:{String(actDuration % 60).padStart(2, '0')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Voice Presets Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-text-muted">AI 人声配置</h4>
                {script.characters.filter(c => c.voicePreset !== 'narrator').map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-xs p-2 bg-bg-tertiary rounded-lg">
                    <Mic className="w-3 h-3 text-neon-cyan shrink-0" />
                    <span className="text-text-primary">{c.name}</span>
                    <span className="text-text-muted ml-auto text-[10px]">{c.voiceConfig?.tone || c.voicePreset}</span>
                  </div>
                ))}
              </div>

              {/* Current Scene Info */}
              {currentScene && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-text-muted">当前场景</h4>
                  <div className="text-xs p-2 bg-bg-tertiary rounded-lg space-y-1">
                    <p><span className="text-text-muted">位置：</span><span className="text-text-primary">{currentScene.location}</span></p>
                    <p><span className="text-text-muted">时间：</span><span className="text-text-primary">{currentScene.time}</span></p>
                    <p><span className="text-text-muted">气氛：</span><span className="text-text-primary">{currentScene.atmosphere}</span></p>
                    <p><span className="text-text-muted">时长：</span><span className="text-text-primary">{currentScene.estimatedDuration}秒</span></p>
                    {currentScene.bgm && <p><span className="text-text-muted">BGM：</span><span className="text-text-primary">{currentScene.bgm.name}</span></p>}
                    <p><span className="text-text-muted">分镜：</span><span className="text-text-primary">{currentScene.cameraShots?.length || 0}个机位</span></p>
                    <p><span className="text-text-muted">音效：</span><span className="text-text-primary">{currentScene.soundEffects?.length || 0}个</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
