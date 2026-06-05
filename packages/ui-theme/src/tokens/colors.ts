export const colors = {
  bg: {
    primary: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a2e',
    elevated: '#222240',
  },
  text: {
    primary: '#e8e8f0',
    secondary: '#9898b0',
    muted: '#606078',
  },
  neon: {
    purple: '#a855f7',
    blue: '#6366f1',
    cyan: '#22d3ee',
    pink: '#ec4899',
    green: '#10b981',
  },
  border: {
    default: '#2a2a45',
    neon: 'rgba(168, 85, 247, 0.3)',
  },
} as const;

export type ColorTokens = typeof colors;
