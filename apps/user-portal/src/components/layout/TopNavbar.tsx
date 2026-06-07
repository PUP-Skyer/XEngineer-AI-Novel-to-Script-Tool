import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Gamepad2,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Wand2,
  FileText,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { to: '/', label: '首页', icon: Sparkles },
  { to: '/novels', label: '小说陈列馆', icon: BookOpen },
  { to: '/scripts/convert/1', label: '剧本转换', icon: Wand2 },
  { to: '/game/lobby', label: '游戏大厅', icon: Gamepad2 },
  { to: '/leaderboard', label: '排行榜', icon: Trophy },
];

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-primary/90 backdrop-blur-xl border-b border-neon-purple/20">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan hidden sm:block">
            AI Script Game
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to.split('/').slice(0, -1).join('/') || link.to);
            return (
              <Link key={link.to} to={link.to}>
                <motion.div
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'text-neon-purple'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-neon-purple rounded-full"
                      layoutId="navbar-indicator"
                      style={{
                        boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <motion.button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-white/5 hover:border-neon-purple/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname || user.username}
                    className="w-7 h-7 rounded-full object-cover border border-neon-purple/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white">
                    {(user.nickname || user.username)?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-text-primary">
                  {user.nickname || user.username}
                </span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg hover:shadow-neon-purple transition-shadow"
              >
                注册
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-secondary border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.to.split('/').slice(0, -1).join('/') || link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-neon-purple bg-neon-purple/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-white/5 pt-3 mt-3">
                {isAuthenticated && user ? (
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user.nickname || user.username}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-red-400 hover:bg-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 text-center py-2 text-sm text-text-secondary hover:text-text-primary border border-white/10 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center py-2 text-sm font-medium text-white bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(168,85,247,0.5) 30%, rgba(99,102,241,0.5) 50%, rgba(34,211,238,0.3) 70%, transparent)',
        }}
      />
    </nav>
  );
}
