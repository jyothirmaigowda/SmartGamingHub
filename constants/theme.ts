// Smart Gaming Hub - Theme System
// 4 Premium Themes: Cyberpunk, Dark Gamer, Retro Arcade, Glassmorphism

export type ThemeKey = 'cyberpunk' | 'darkgamer' | 'retro' | 'glass';

export interface GameTheme {
  key: ThemeKey;
  name: string;
  icon: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    card: string;
    cardBorder: string;
    primary: string;
    primaryGlow: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    success: string;
    danger: string;
    warning: string;
    tabBar: string;
    tabBarBorder: string;
    inputBg: string;
    inputBorder: string;
    overlay: string;
    shadow: string;
    gradient1: string;
    gradient2: string;
  };
  typography: {
    fontFamily?: string;
    headingWeight: '700' | '800' | '900';
    bodyWeight: '400' | '500';
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  effects: {
    glowEnabled: boolean;
    pixelStyle: boolean;
    glassEnabled: boolean;
  };
}

export const themes: Record<ThemeKey, GameTheme> = {
  cyberpunk: {
    key: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '⚡',
    colors: {
      background: '#0a0010',
      surface: '#120020',
      surfaceAlt: '#1a0035',
      card: '#160028',
      cardBorder: '#7B2FFF',
      primary: '#B44FFF',
      primaryGlow: 'rgba(180,79,255,0.4)',
      secondary: '#00D4FF',
      accent: '#FF2D7E',
      text: '#F0E6FF',
      textSecondary: '#B89FCC',
      textMuted: '#6B4D8A',
      success: '#00FF88',
      danger: '#FF2D7E',
      warning: '#FFD700',
      tabBar: '#0d0018',
      tabBarBorder: '#7B2FFF',
      inputBg: '#1a0035',
      inputBorder: '#7B2FFF',
      overlay: 'rgba(10,0,16,0.92)',
      shadow: '#B44FFF',
      gradient1: '#B44FFF',
      gradient2: '#00D4FF',
    },
    typography: {
      headingWeight: '800',
      bodyWeight: '400',
    },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 100 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    effects: { glowEnabled: true, pixelStyle: false, glassEnabled: false },
  },
  darkgamer: {
    key: 'darkgamer',
    name: 'Dark Gamer',
    icon: '🎮',
    colors: {
      background: '#0a0a0a',
      surface: '#141414',
      surfaceAlt: '#1e1e1e',
      card: '#1a1a1a',
      cardBorder: '#333333',
      primary: '#E53935',
      primaryGlow: 'rgba(229,57,53,0.3)',
      secondary: '#FF7043',
      accent: '#FFD600',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textMuted: '#555555',
      success: '#4CAF50',
      danger: '#F44336',
      warning: '#FFD600',
      tabBar: '#111111',
      tabBarBorder: '#2a2a2a',
      inputBg: '#1e1e1e',
      inputBorder: '#333333',
      overlay: 'rgba(0,0,0,0.92)',
      shadow: '#E53935',
      gradient1: '#E53935',
      gradient2: '#FF7043',
    },
    typography: {
      headingWeight: '700',
      bodyWeight: '400',
    },
    borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 100 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    effects: { glowEnabled: false, pixelStyle: false, glassEnabled: false },
  },
  retro: {
    key: 'retro',
    name: 'Arcade Retro',
    icon: '👾',
    colors: {
      background: '#0B0B1A',
      surface: '#12122A',
      surfaceAlt: '#1A1A3A',
      card: '#16163A',
      cardBorder: '#FF6B35',
      primary: '#FFD700',
      primaryGlow: 'rgba(255,215,0,0.4)',
      secondary: '#FF6B35',
      accent: '#00FF41',
      text: '#FFE066',
      textSecondary: '#FF6B35',
      textMuted: '#5555AA',
      success: '#00FF41',
      danger: '#FF2244',
      warning: '#FFD700',
      tabBar: '#0B0B1A',
      tabBarBorder: '#333366',
      inputBg: '#12122A',
      inputBorder: '#FF6B35',
      overlay: 'rgba(11,11,26,0.95)',
      shadow: '#FFD700',
      gradient1: '#FFD700',
      gradient2: '#FF6B35',
    },
    typography: {
      headingWeight: '900',
      bodyWeight: '500',
    },
    borderRadius: { sm: 0, md: 2, lg: 4, xl: 6, full: 4 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    effects: { glowEnabled: true, pixelStyle: true, glassEnabled: false },
  },
  glass: {
    key: 'glass',
    name: 'Glassmorphism',
    icon: '💎',
    colors: {
      background: '#1a1a2e',
      surface: 'rgba(255,255,255,0.08)',
      surfaceAlt: 'rgba(255,255,255,0.12)',
      card: 'rgba(255,255,255,0.1)',
      cardBorder: 'rgba(255,255,255,0.2)',
      primary: '#6C63FF',
      primaryGlow: 'rgba(108,99,255,0.4)',
      secondary: '#A78BFA',
      accent: '#34D399',
      text: '#FFFFFF',
      textSecondary: 'rgba(255,255,255,0.7)',
      textMuted: 'rgba(255,255,255,0.4)',
      success: '#34D399',
      danger: '#F87171',
      warning: '#FBBF24',
      tabBar: 'rgba(10,10,30,0.9)',
      tabBarBorder: 'rgba(255,255,255,0.1)',
      inputBg: 'rgba(255,255,255,0.08)',
      inputBorder: 'rgba(255,255,255,0.25)',
      overlay: 'rgba(26,26,46,0.92)',
      shadow: '#6C63FF',
      gradient1: '#6C63FF',
      gradient2: '#A78BFA',
    },
    typography: {
      headingWeight: '700',
      bodyWeight: '400',
    },
    borderRadius: { sm: 8, md: 16, lg: 20, xl: 24, full: 100 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    effects: { glowEnabled: false, pixelStyle: false, glassEnabled: true },
  },
};

export const defaultTheme = themes.cyberpunk;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};
