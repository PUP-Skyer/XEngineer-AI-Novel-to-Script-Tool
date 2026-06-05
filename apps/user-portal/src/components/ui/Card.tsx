import { type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glowOnHover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  hoverable = false,
  glowOnHover = true,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-bg-secondary border border-white/5 rounded-2xl
        ${hoverable ? 'cursor-pointer' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      whileHover={
        hoverable
          ? {
              y: -4,
              borderColor: 'rgba(168, 85, 247, 0.3)',
              boxShadow: glowOnHover
                ? '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.08)'
                : 'none',
            }
          : undefined
      }
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
