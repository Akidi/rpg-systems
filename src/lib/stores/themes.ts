// src/lib/stores/theme.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeVariant, ThemeMode, ThemeStore } from '$lib/types/layout.js';

// Default theme settings
const defaultTheme: ThemeVariant = 'dungeon-classic';
const defaultMode: ThemeMode = 'dark';

// Initialize theme from localStorage or defaults
function initializeTheme(): ThemeStore {
	if (browser) {
		const savedTheme = localStorage.getItem('rpg-theme') as ThemeVariant;
		const savedMode = localStorage.getItem('rpg-theme-mode') as ThemeMode;

		return {
			theme: savedTheme && isValidTheme(savedTheme) ? savedTheme : defaultTheme,
			mode: savedMode && isValidMode(savedMode) ? savedMode : defaultMode
		};
	}

	return {
		theme: defaultTheme,
		mode: defaultMode
	};
}

// Type guards
function isValidTheme(theme: string): theme is ThemeVariant {
	return [
		'dungeon-classic',
		'shadow-realm',
		'crystal-caverns',
		'infernal-depths',
		'frost-keep',
		'verdant-ruins'
	].includes(theme as ThemeVariant);
}

function isValidMode(mode: string): mode is ThemeMode {
	return ['light', 'dark'].includes(mode as ThemeMode);
}

// Create the store
export const themeStore = writable<ThemeStore>(initializeTheme());

// Apply theme to document
function applyTheme(theme: ThemeVariant, mode: ThemeMode) {
	if (browser && document.documentElement) {
		document.documentElement.setAttribute('data-theme', theme);
		document.documentElement.setAttribute('data-mode', mode);
	}
}

// Theme manipulation functions
export const themeActions = {
	setTheme: (theme: ThemeVariant) => {
		themeStore.update((current) => {
			const newState = { ...current, theme };

			if (browser) {
				localStorage.setItem('rpg-theme', theme);
				applyTheme(newState.theme, newState.mode);
			}

			return newState;
		});
	},

	setMode: (mode: ThemeMode) => {
		themeStore.update((current) => {
			const newState = { ...current, mode };

			if (browser) {
				localStorage.setItem('rpg-theme-mode', mode);
				applyTheme(newState.theme, newState.mode);
			}

			return newState;
		});
	},

	toggleMode: () => {
		themeStore.update((current) => {
			const newMode: ThemeMode = current.mode === 'light' ? 'dark' : 'light';
			const newState = { ...current, mode: newMode };

			if (browser) {
				localStorage.setItem('rpg-theme-mode', newMode);
				applyTheme(newState.theme, newState.mode);
			}

			return newState;
		});
	},

	// Initialize theme on app start
	initialize: () => {
		const currentState = initializeTheme();
		themeStore.set(currentState);

		if (browser) {
			applyTheme(currentState.theme, currentState.mode);
		}
	}
};

// Auto-apply theme changes
if (browser) {
	themeStore.subscribe(({ theme, mode }) => {
		applyTheme(theme, mode);
	});
}

// Svelte 5 compatible reactive theme state
export function createThemeState() {
	let currentTheme = $state<ThemeStore>(initializeTheme());

	// Subscribe to store changes and update state
	if (browser) {
		themeStore.subscribe((value) => {
			currentTheme = value;
		});
	}

	return {
		get current() {
			return currentTheme;
		},
		get theme() {
			return currentTheme.theme;
		},
		get mode() {
			return currentTheme.mode;
		}
	};
}
