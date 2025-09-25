// src/lib/config/themes.ts
import type { ThemeVariant, ThemeConfig } from '$lib/types/layout.js';

export const themeConfigs: Record<ThemeVariant, ThemeConfig> = {
  'dungeon-classic': {
    name: 'dungeon-classic',
    displayName: 'Dungeon Classic',
    description: 'Traditional stone and earth tones with medieval atmosphere',
    lightMode: true,
    darkMode: true
  },
  
  'shadow-realm': {
    name: 'shadow-realm', 
    displayName: 'Shadow Realm',
    description: 'Gothic purples and mystical shadows for dark magic themes',
    lightMode: true,
    darkMode: true
  },
  
  'crystal-caverns': {
    name: 'crystal-caverns',
    displayName: 'Crystal Caverns',
    description: 'Bright cyan crystals and magical gem-like colors',
    lightMode: true,
    darkMode: true
  },
  
  'infernal-depths': {
    name: 'infernal-depths',
    displayName: 'Infernal Depths', 
    description: 'Fiery reds and oranges evoking lava and flames',
    lightMode: true,
    darkMode: true
  },
  
  'frost-keep': {
    name: 'frost-keep',
    displayName: 'Frost Keep',
    description: 'Cool blues and icy whites for winter and frost themes',
    lightMode: true,
    darkMode: true
  },
  
  'verdant-ruins': {
    name: 'verdant-ruins',
    displayName: 'Verdant Ruins',
    description: 'Lush greens and nature tones for overgrown ancient sites',
    lightMode: true,
    darkMode: true
  }
};

export const getThemeConfig = (theme: ThemeVariant): ThemeConfig => {
  return themeConfigs[theme];
};

export const getAllThemes = (): ThemeVariant[] => {
  return Object.keys(themeConfigs) as ThemeVariant[];
};