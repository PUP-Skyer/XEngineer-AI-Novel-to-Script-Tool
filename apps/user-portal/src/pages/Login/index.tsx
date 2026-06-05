import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import MagicRings from '@/components/effects/MagicRings';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!validateEmail(email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 演示账号（后端未启动时使用）
  const DEMO_USER = {
    id: 1,
    username: 'demo',
    nickname: '演示用户',
    avatarUrl: '',
    role: 'user' as const,
    expPoints: 0,
    level: 1,
    createdAt: new Date().toISOString(),
  };
  const DEMO_TOKENS = {
    accessToken: 'demo-token-' + Date.now(),
    refreshToken: 'demo-refresh-' + Date.now(),
    expiresIn: 3600,
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      // 演示模式：任意邮箱 + 密码 12345678 即可登录
      if (password === '12345678') {
        setAuth(
          { ...DEMO_USER, username: email.split('@')[0] || 'demo' },
          DEMO_TOKENS,
        );
        navigate('/');
        return;
      }

      // Dynamic import to avoid circular dependency
      const { userApi } = await import('@/services/apiClient');
      const response = await userApi.login({
        email: email.trim(),
        password,
      });

      setAuth(response.user, response.tokens);
      navigate('/');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || '登录失败，请重试';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background Magic Rings */}
      <div className="absolute inset-0" style={{ opacity: 0.15 }}>
        <MagicRings
          ringCount={6}
          speed={0.25}
          opacity={0.4}
          followMouse
          parallax
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-neon-purple/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-neon-blue/5 to-transparent pointer-events-none" />

      {/* Login Card */}
      <motion.div
        className="relative w-full max-w-md z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden" style={{ background: 'rgba(20,20,35,0.95)', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 0 40px rgba(168,85,247,0.08), 0 25px 50px rgba(0,0,0,0.5)' }}>
          {/* Top glow line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
            }}
          />

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-extrabold mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
                AI Script Game
              </span>
            </motion.h1>
            <motion.p
              className="text-text-secondary text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              登录你的账号，继续冒险
            </motion.p>
          </div>

          {/* Demo Hint */}
          <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(168,85,247,0.9)' }}>
            💡 演示模式：输入任意邮箱 + 密码 <code className="font-mono font-bold">12345678</code> 即可登录
          </div>

          {/* Server Error */}
          {serverError && (
            <motion.div
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {serverError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-bg-tertiary border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-neon-purple/40'
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="输入密码"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
                    errors.password
                      ? 'border border-red-500/50 focus:border-red-500/70'
                      : 'border border-white/20 focus:border-neon-purple/60 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  }`} style={{ background: 'rgba(15,15,30,0.8)' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border border-white/20 bg-bg-tertiary peer-checked:bg-neon-purple peer-checked:border-neon-purple transition-colors flex items-center justify-center">
                    {rememberMe && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  记住我
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-neon-purple/70 hover:text-neon-purple transition-colors"
              >
                忘记密码？
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              icon={<LogIn className="w-4 h-4" />}
            >
              登录
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-text-muted" style={{ background: 'rgba(20,20,35,0.95)' }}>或</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              没有账号？{' '}
              <Link
                to="/register"
                className="text-neon-purple hover:text-neon-cyan transition-colors font-medium"
              >
                去注册
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
