// src/lib/types/layout.ts

export type ThemeMode = 'light' | 'dark';

export type ThemeVariant = 
  | 'dungeon-classic'    // Traditional stone/medieval
  | 'shadow-realm'       // Dark mystical/gothic
  | 'crystal-caverns'    // Bright gems/magical
  | 'infernal-depths'    // Fire/lava themed
  | 'frost-keep'         // Ice/winter themed
  | 'verdant-ruins';     // Nature/overgrown

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  lightMode: boolean;
  darkMode: boolean;
}

export interface ThemeContextType {
  currentTheme: ThemeVariant;
  currentMode: ThemeMode;
  availableThemes: Record<ThemeVariant, ThemeConfig>;
  setTheme: (theme: ThemeVariant) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export interface ThemeStore {
  theme: ThemeVariant;
  mode: ThemeMode;
}