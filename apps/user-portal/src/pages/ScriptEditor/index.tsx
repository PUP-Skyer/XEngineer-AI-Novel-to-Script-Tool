import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  MessageSquare,
  FileText,
  Save,
  Play,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Script, Character, Scene, Dialogue } from '@asg/shared';
import apiClient from '@/services/apiClient';

interface ScriptEditorProps {}

export default function ScriptEditor(_props: ScriptEditorProps) {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [yamlPreview, setYamlPreview] = useState('');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchScript = async () => {
      try {
        const { data } = await apiClient.get(`/scripts/${id}`);
        setScript(data);
        generateYamlPreview(data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchScript();
  }, [id]);

  const generateYamlPreview = (scriptData: Script) => {
    const yaml = `title: ${scriptData.title}
difficulty: ${scriptData.difficulty}
players: ${scriptData.playerCountMin}-${scriptData.playerCountMax}
duration: ${scriptData.estimatedDuration}min

characters:
${scriptData.characters.map((c: Character) => `  - name: ${c.name}
    type: ${c.type}
    gender: ${c.gender}
    personality: ${c.personality}
    background: ${c.background.substring(0, 100)}...`).join('\n')}

scenes:
${scriptData.scenes.map((s: Scene) => `  - title: ${s.title}
    location: ${s.location || '未设置'}
    description: ${s.description.substring(0, 80)}...
    dialogues: ${s.dialogues.length}
    choices: ${s.choices?.length || 0}`).join('\n')}`;
    setYamlPreview(yaml);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="加载剧本..." />
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">剧本不存在</p>
      </div>
    );
  }

  const currentScene = script.scenes[activeSceneIndex];

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Panel: Characters */}
      <motion.div
        className={`${leftPanelOpen ? 'w-64' : 'w-12'} bg-bg-secondary border-r border-white/5 flex flex-col transition-all duration-300`}
        initial={false}
      >
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="h-10 flex items-center justify-center text-text-muted hover:text-text-primary border-b border-white/5"
        >
          {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {leftPanelOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Users className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium text-text-primary">角色面板</span>
            </div>

            <div className="space-y-1">
              {script.characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedCharacter?.id === character.id
                      ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <div className="font-medium">{character.name}</div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {character.type} / {character.gender}
                  </div>
                </button>
              ))}
            </div>

            {/* Character Detail */}
            {selectedCharacter && (
              <div className="mt-4 p-3 bg-bg-tertiary rounded-xl text-xs space-y-2">
                <h4 className="font-medium text-text-primary text-sm">
                  {selectedCharacter.name}
                </h4>
                <div className="space-y-1.5 text-text-secondary">
                  <p><span className="text-text-muted">性格：</span>{selectedCharacter.personality}</p>
                  <p><span className="text-text-muted">背景：</span>{selectedCharacter.background}</p>
                  {selectedCharacter.secret && (
                    <p className="text-neon-pink"><span className="text-text-muted">秘密：</span>{selectedCharacter.secret}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Center: Scene Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Scene Tabs */}
        <div className="h-10 flex items-center gap-1 px-4 bg-bg-secondary border-b border-white/5 overflow-x-auto">
          {script.scenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => setActiveSceneIndex(index)}
              className={`shrink-0 px-3 py-1 text-xs rounded-md transition-colors ${
                index === activeSceneIndex
                  ? 'bg-neon-purple/20 text-neon-purple'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              {scene.sceneNumber}. {scene.title}
            </button>
          ))}
        </div>

        {/* Scene Content */}
        {currentScene && (
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Scene Header */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  第 {currentScene.sceneNumber} 场：{currentScene.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  {currentScene.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentScene.location}
                    </span>
                  )}
                  {currentScene.time && (
                    <span>{currentScene.time}</span>
                  )}
                </div>
              </div>

              {/* Scene Description */}
              <div className="p-4 bg-bg-tertiary rounded-xl text-sm text-text-secondary leading-relaxed">
                {currentScene.description}
              </div>

              {/* Dialogues */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <MessageSquare className="w-4 h-4 text-neon-blue" />
                  对白
                </div>
                {currentScene.dialogues.map((dialogue: Dialogue) => {
                  const character = script.characters.find(
                    (c) => c.id === dialogue.characterId,
                  );
                  return (
                    <div
                      key={dialogue.id}
                      className="p-4 bg-bg-secondary border border-white/5 rounded-xl"
                    >
                      {dialogue.type === 'narration' ? (
                        <p className="text-text-muted italic text-sm leading-relaxed">
                          {dialogue.content}
                        </p>
                      ) : dialogue.type === 'stage_direction' ? (
                        <p className="text-neon-cyan text-sm">
                          [{dialogue.content}]
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-neon-purple">
                              {character?.name || '未知'}
                            </span>
                            {dialogue.emotion && (
                              <span className="text-xs text-text-muted italic">
                                （{dialogue.emotion}）
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed">
                            {dialogue.content}
                          </p>
                          {dialogue.action && (
                            <p className="text-xs text-text-muted mt-2">
                              {dialogue.action}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Choices */}
              {currentScene.choices && currentScene.choices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <FileText className="w-4 h-4 text-neon-green" />
                    选择分支
                  </div>
                  {currentScene.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="p-3 bg-neon-green/5 border border-neon-green/20 rounded-xl text-sm text-text-secondary"
                    >
                      <span className="text-neon-green mr-2">[选项]</span>
                      {choice.text}
                      {choice.consequence && (
                        <p className="mt-1 text-xs text-text-muted italic">
                          结果: {choice.consequence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="h-12 flex items-center justify-between px-4 bg-bg-secondary border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" icon={<Save className="w-3.5 h-3.5" />}>
              保存
            </Button>
            <Button size="sm" icon={<Play className="w-3.5 h-3.5" />}>
              开始游戏
            </Button>
          </div>
          <span className="text-xs text-text-muted">
            场景 {activeSceneIndex + 1} / {script.scenes.length}
          </span>
        </div>
      </div>

      {/* Right Panel: YAML Preview */}
      <motion.div
        className={`${rightPanelOpen ? 'w-80' : 'w-12'} bg-bg-secondary border-l border-white/5 flex flex-col transition-all duration-300`}
        initial={false}
      >
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="h-10 flex items-center justify-center text-text-muted hover:text-text-primary border-b border-white/5"
        >
          {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {rightPanelOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-3">
              <FileText className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-medium text-text-primary">YAML 预览</span>
            </div>
            <pre className="px-4 pb-4 text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {yamlPreview}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}
