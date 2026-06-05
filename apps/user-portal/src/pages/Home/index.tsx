import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Gamepad2, ArrowRight, Wand2, Users, ScrollText } from 'lucide-react';
import MagicRings from '@/components/effects/MagicRings';
import NovelCardGrid from '@/components/novel/NovelCardGrid';
import { novelService } from '@/services/novelService';
import type { NovelListItem } from '@asg/shared';

const features = [
  {
    icon: Wand2,
    title: 'AI 小说生成',
    description: '输入你的创意灵感，AI 为你打造独一无二的原创小说，支持多种题材风格。',
    color: 'from-neon-purple to-neon-blue',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    icon: ScrollText,
    title: '剧本转换',
    description: '一键将小说转换为剧本杀脚本，自动生成角色、场景和对白。',
    color: 'from-neon-blue to-neon-cyan',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: Users,
    title: '多人剧本杀',
    description: '邀请好友或匹配陌生人，沉浸在 AI 驱动的沉浸式剧本杀体验中。',
    color: 'from-neon-cyan to-neon-green',
    glowColor: 'rgba(34, 211, 238, 0.3)',
  },
];

export default function Home() {
  const [hotNovels, setHotNovels] = useState<NovelListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotNovels = async () => {
      try {
        const result = await novelService.getList({ sort: 'popular', pageSize: 6 });
        setHotNovels(result.data);
      } catch {
        // Use empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchHotNovels();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <MagicRings
          ringCount={6}
          speed={0.25}
          opacity={0.3}
          followMouse
          parallax
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI 驱动的新一代创作平台
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
                AI 驱动的
              </span>
              <br />
              <span className="text-text-primary">小说剧本杀平台</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              用 AI 创作你的专属小说，一键转换为沉浸式剧本杀。
              <br />
              在霓虹闪烁的世界里，开启你的叙事冒险。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/novels/create">
                <motion.div
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl cursor-pointer hover:shadow-neon-purple transition-shadow"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Wand2 className="w-5 h-5" />
                  开始创作
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link to="/game/lobby">
                <motion.div
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-text-primary bg-bg-secondary border border-white/10 rounded-xl cursor-pointer hover:border-neon-purple/30 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Gamepad2 className="w-5 h-5" />
                  进入游戏
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              核心功能
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              从灵感到沉浸式体验，一站式满足你的创作与娱乐需求
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative bg-bg-secondary border border-white/5 rounded-2xl p-8 hover:border-neon-purple/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 0 30px ${feature.glowColor}`,
                }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Novels Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                热门小说
              </h2>
              <p className="text-text-secondary">
                探索由 AI 创作的精彩故事
              </p>
            </div>
            <Link
              to="/novels"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-neon-purple hover:text-neon-cyan transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <NovelCardGrid novels={hotNovels} loading={loading} />

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/novels"
              className="inline-flex items-center gap-2 text-sm text-neon-purple"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center bg-bg-secondary border border-white/5 rounded-3xl p-12 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
            }}
          />
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            加入我们，体验 AI 驱动的创作与剧本杀新世界
          </p>
          <Link to="/register">
            <motion.div
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl cursor-pointer"
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              免费注册
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
