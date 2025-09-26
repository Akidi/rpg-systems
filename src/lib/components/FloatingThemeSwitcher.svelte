<!-- src/lib/components/FloatingThemeSwitcher.svelte -->
<script lang="ts">
	import { themeStore, themeActions } from '$lib/stores/themes';
	import { themeConfigs, getAllThemes } from '$lib/config/themes';
	import type { ThemeVariant } from '$lib/types/layout.js';

	// Get current theme state
	let themeState = $state($themeStore);

	// Derived values
	const currentTheme = $derived(themeState.theme);
	const currentMode = $derived(themeState.mode);
	const currentThemeConfig = $derived(themeConfigs[currentTheme]);

	// Get available themes
	const availableThemes = getAllThemes();

	// Component state
	let isExpanded = $state(false);

	// Theme change handlers
	const handleThemeChange = (theme: ThemeVariant) => {
		themeActions.setTheme(theme);
		isExpanded = false; // Collapse after selection
	};

	const handleModeToggle = () => {
		themeActions.toggleMode();
	};

	const toggleExpanded = () => {
		isExpanded = !isExpanded;
	};

	// Update local state when store changes
	themeStore.subscribe((value) => {
		themeState = value;
	});

	// Close when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.floating-theme-switcher')) {
			isExpanded = false;
		}
	}

	// Icons for themes
	const themeIcons = {
		'dungeon-classic': '🏰',
		'shadow-realm': '🌙',
		'crystal-caverns': '💎',
		'infernal-depths': '🔥',
		'frost-keep': '❄️',
		'verdant-ruins': '🌿'
	};

	// Mode icons
	const modeIcons = {
		light: '☀️',
		dark: '🌙'
	};
</script>

<svelte:window onclick={handleClickOutside} />

<div class="floating-theme-switcher" class:expanded={isExpanded}>
	<!-- Compact Toggle Button -->
	<button
		onclick={toggleExpanded}
		class="theme-toggle"
		title="Change Theme"
		aria-label="Open theme selector"
	>
		<span class="theme-icon">{themeIcons[currentTheme]}</span>
		<span class="expand-icon" class:rotated={isExpanded}>⚙️</span>
	</button>

	<!-- Expanded Panel -->
	{#if isExpanded}
		<div class="theme-panel">
			<div class="panel-header">
				<h3 class="panel-title">Themes</h3>
				<button
					onclick={handleModeToggle}
					class="mode-toggle"
					title={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
				>
					{modeIcons[currentMode]}
				</button>
			</div>

			<div class="theme-grid">
				{#each availableThemes as theme}
					<button
						onclick={() => handleThemeChange(theme)}
						class="theme-option"
						class:active={currentTheme === theme}
						title={themeConfigs[theme].description}
					>
						<span class="option-icon">{themeIcons[theme]}</span>
						<span class="option-name">{themeConfigs[theme].displayName}</span>
					</button>
				{/each}
			</div>

			<div class="current-theme-info">
				<div class="info-title">{currentThemeConfig.displayName}</div>
				<div class="info-mode">{currentMode} mode</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.floating-theme-switcher {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		transition: var(--transition-theme);
	}

	.theme-toggle {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		border: 2px solid var(--border-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: var(--transition-theme);
		box-shadow: 0 2px 8px var(--shadow-medium);
	}

	.theme-toggle:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px var(--shadow-heavy);
	}

	.theme-icon {
		font-size: 1.5rem;
		position: absolute;
	}

	.expand-icon {
		font-size: 1rem;
		position: absolute;
		bottom: -2px;
		right: -2px;
		background-color: var(--bg-primary);
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.expand-icon.rotated {
		transform: rotate(180deg);
	}

	.theme-panel {
		position: absolute;
		top: 70px;
		right: 0;
		width: 280px;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 8px 24px var(--shadow-heavy);
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-primary);
	}

	.panel-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.mode-toggle {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: var(--transition-theme);
	}

	.mode-toggle:hover {
		background-color: var(--bg-tertiary);
	}

	.theme-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.theme-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		cursor: pointer;
		transition: var(--transition-theme);
		font-size: 0.75rem;
	}

	.theme-option:hover {
		background-color: var(--color-secondary);
		color: var(--text-inverse);
		transform: translateY(-1px);
	}

	.theme-option.active {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
	}

	.option-icon {
		font-size: 1.25rem;
	}

	.option-name {
		font-weight: 500;
		text-align: center;
		line-height: 1.2;
	}

	.current-theme-info {
		text-align: center;
		padding: 0.75rem;
		background-color: var(--bg-tertiary);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
	}

	.info-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.info-mode {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: capitalize;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.floating-theme-switcher {
			top: 10px;
			right: 10px;
		}

		.theme-toggle {
			width: 48px;
			height: 48px;
		}

		.theme-icon {
			font-size: 1.25rem;
		}

		.expand-icon {
			width: 16px;
			height: 16px;
			font-size: 0.75rem;
		}

		.theme-panel {
			width: 260px;
		}

		.theme-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
