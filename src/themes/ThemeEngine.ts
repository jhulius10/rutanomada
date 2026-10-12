// ThemeEngine - Motor de temas dinámicos por país
// Cada país tiene una paleta neón única que se aplica a toda la interfaz

export interface CountryTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  neonGlow: string;
  gradient: string;
  gradientSubtle: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  mapOverlay: string;
}

export const countryThemes: Record<string, CountryTheme> = {
  PE: {
    primary: '#ff1744',
    primaryLight: '#ff5252',
    primaryDark: '#d50000',
    secondary: '#ffffff',
    accent: '#ff8a80',
    neonGlow: '0 0 20px rgba(255, 23, 68, 0.5)',
    gradient: 'linear-gradient(135deg, #ff1744 0%, #d50000 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(213,0,0,0.05) 100%)',
    cardBg: 'rgba(30, 10, 15, 0.85)',
    cardBorder: 'rgba(255, 23, 68, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 23, 68, 0.05)',
  },
  AR: {
    primary: '#00e5ff',
    primaryLight: '#18ffff',
    primaryDark: '#00b8d4',
    secondary: '#ffffff',
    accent: '#ffea00',
    neonGlow: '0 0 20px rgba(0, 229, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(0,184,212,0.05) 100%)',
    cardBg: 'rgba(10, 20, 25, 0.85)',
    cardBorder: 'rgba(0, 229, 255, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(0, 229, 255, 0.05)',
  },
  CO: {
    primary: '#ffd600',
    primaryLight: '#ffff00',
    primaryDark: '#c6a700',
    secondary: '#2962ff',
    accent: '#ff1744',
    neonGlow: '0 0 20px rgba(255, 214, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #ffd600 0%, #ff6d00 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,214,0,0.1) 0%, rgba(41,98,255,0.05) 100%)',
    cardBg: 'rgba(25, 20, 5, 0.85)',
    cardBorder: 'rgba(255, 214, 0, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 214, 0, 0.05)',
  },
  CL: {
    primary: '#2979ff',
    primaryLight: '#448aff',
    primaryDark: '#0d47a1',
    secondary: '#ffffff',
    accent: '#ff1744',
    neonGlow: '0 0 20px rgba(41, 121, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #2979ff 0%, #0d47a1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(41,121,255,0.1) 0%, rgba(13,71,161,0.05) 100%)',
    cardBg: 'rgba(10, 15, 30, 0.85)',
    cardBorder: 'rgba(41, 121, 255, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(41, 121, 255, 0.05)',
  },
  BR: {
    primary: '#00e676',
    primaryLight: '#69f0ae',
    primaryDark: '#00c853',
    secondary: '#ffea00',
    accent: '#2979ff',
    neonGlow: '0 0 20px rgba(0, 230, 118, 0.5)',
    gradient: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(0,230,118,0.1) 0%, rgba(0,200,83,0.05) 100%)',
    cardBg: 'rgba(5, 20, 10, 0.85)',
    cardBorder: 'rgba(0, 230, 118, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(0, 230, 118, 0.05)',
  },
  EC: {
    primary: '#ffd600',
    primaryLight: '#ffff00',
    primaryDark: '#c6a700',
    secondary: '#2962ff',
    accent: '#ff1744',
    neonGlow: '0 0 20px rgba(255, 214, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #ffd600 0%, #2962ff 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,214,0,0.1) 0%, rgba(41,98,255,0.05) 100%)',
    cardBg: 'rgba(25, 20, 5, 0.85)',
    cardBorder: 'rgba(255, 214, 0, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 214, 0, 0.05)',
  },
  VE: {
    primary: '#ffd600',
    primaryLight: '#ffff00',
    primaryDark: '#c6a700',
    secondary: '#2962ff',
    accent: '#ff1744',
    neonGlow: '0 0 20px rgba(255, 214, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #ff1744 0%, #2962ff 50%, #ffd600 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,214,0,0.1) 0%, rgba(41,98,255,0.05) 100%)',
    cardBg: 'rgba(25, 20, 5, 0.85)',
    cardBorder: 'rgba(255, 214, 0, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 214, 0, 0.05)',
  },
  BO: {
    primary: '#ff1744',
    primaryLight: '#ff5252',
    primaryDark: '#d50000',
    secondary: '#ffd600',
    accent: '#00e676',
    neonGlow: '0 0 20px rgba(255, 23, 68, 0.5)',
    gradient: 'linear-gradient(135deg, #ff1744 0%, #ffd600 50%, #00e676 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(0,230,118,0.05) 100%)',
    cardBg: 'rgba(25, 10, 10, 0.85)',
    cardBorder: 'rgba(255, 23, 68, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 23, 68, 0.05)',
  },
  UY: {
    primary: '#2979ff',
    primaryLight: '#448aff',
    primaryDark: '#0d47a1',
    secondary: '#ffffff',
    accent: '#ffea00',
    neonGlow: '0 0 20px rgba(41, 121, 255, 0.5)',
    gradient: 'linear-gradient(135deg, #2979ff 0%, #0d47a1 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(41,121,255,0.1) 0%, rgba(13,71,161,0.05) 100%)',
    cardBg: 'rgba(10, 15, 30, 0.85)',
    cardBorder: 'rgba(41, 121, 255, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(41, 121, 255, 0.05)',
  },
  PY: {
    primary: '#ff1744',
    primaryLight: '#ff5252',
    primaryDark: '#d50000',
    secondary: '#ffffff',
    accent: '#2979ff',
    neonGlow: '0 0 20px rgba(255, 23, 68, 0.5)',
    gradient: 'linear-gradient(135deg, #ff1744 0%, #2979ff 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(41,121,255,0.05) 100%)',
    cardBg: 'rgba(25, 10, 15, 0.85)',
    cardBorder: 'rgba(255, 23, 68, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    mapOverlay: 'rgba(255, 23, 68, 0.05)',
  },
};

// Default theme (teal)
export const defaultTheme: CountryTheme = {
  primary: '#14b8a6',
  primaryLight: '#2dd4bf',
  primaryDark: '#0f766e',
  secondary: '#fbbf24',
  accent: '#34d399',
  neonGlow: '0 0 20px rgba(20, 184, 166, 0.5)',
  gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
  gradientSubtle: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(15,118,110,0.05) 100%)',
  cardBg: 'rgba(15, 23, 42, 0.85)',
  cardBorder: 'rgba(20, 184, 166, 0.2)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  mapOverlay: 'rgba(20, 184, 166, 0.05)',
};

export function getThemeForCountry(countryCode: string): CountryTheme {
  return countryThemes[countryCode] || defaultTheme;
}

export function applyThemeToCSS(theme: CountryTheme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-light', theme.primaryLight);
  root.style.setProperty('--theme-primary-dark', theme.primaryDark);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-neon-glow', theme.neonGlow);
  root.style.setProperty('--theme-gradient', theme.gradient);
  root.style.setProperty('--theme-gradient-subtle', theme.gradientSubtle);
  root.style.setProperty('--theme-card-bg', theme.cardBg);
  root.style.setProperty('--theme-card-border', theme.cardBorder);
  root.style.setProperty('--theme-text-primary', theme.textPrimary);
  root.style.setProperty('--theme-text-secondary', theme.textSecondary);
}
