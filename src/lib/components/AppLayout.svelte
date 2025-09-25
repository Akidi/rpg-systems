<!-- src/lib/components/AppLayout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore, themeActions } from '$lib/stores/themes';
	import { themeConfigs, getAllThemes } from '$lib/config/themes';
	import { page } from '$app/state';
	import type { ThemeVariant } from '$lib/types/layout.js';
	
	interface Props {
		children: import('svelte').Snippet;
		title?: string;
	}
	
	const { 
		children, 
		title = 'Dungeon Crawler RPG' 
	}: Props = $props();
	
	// Theme state
	let themeState = $state($themeStore);
	let isThemeDropdownOpen = $state(false);
	let isCalculatorDropdownOpen = $state(false);
	
	// Available themes
	const availableThemes = getAllThemes();
	
	// Calculator links
	const calculators = [
		{
			name: 'Enhancement System',
			href: '/demo/system/enhancements',
			icon: '✨',
			description: 'Test skill enhancement mechanics',
			status: 'ready'
		},
		{
			name: 'Currency System',
			href: '/demo/system/currency',
			icon: '💰',
			description: 'Multi-tier currency conversion',
			status: 'ready'
		},
		{
			name: 'AP Progression',
			href: '/demo/system/ap-progression',
			icon: '⚡',
			description: 'Action Point scaling formulas',
			status: 'ready'
		},
		{
			name: 'Turn System',
			href: '/demo/system/turn-system',
			icon: '🎯',
			description: 'Turn-based combat mechanics',
			status: 'wip'
		},
		{
			name: 'Formula Planner',
			href: '/demo/system/formula-planner',
			icon: '📊',
			description: 'Advanced formula testing',
			status: 'wip'
		},
		{
			name: 'Skill Planner',
			href: '/demo/system/skill-planner',
			icon: '🧠',
			description: 'Plan skill bonuses and costs',
			status: 'wip'
		}
	];
	
	// Derived values
	const currentTheme = $derived(themeState.theme);
	const currentMode = $derived(themeState.mode);
	const currentThemeConfig = $derived(themeConfigs[currentTheme]);
	const currentPath = $derived(page?.url?.pathname || '');
	
	// Theme icons
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
	
	// Initialize theme system
	onMount(() => {
		themeActions.initialize();
	});
	
	// Update local state when store changes
	themeStore.subscribe(value => {
		themeState = value;
	});
	
	// Event handlers
	const handleThemeChange = (theme: ThemeVariant) => {
		themeActions.setTheme(theme);
		isThemeDropdownOpen = false;
	};
	
	const handleModeToggle = () => {
		themeActions.toggleMode();
	};
	
	const toggleThemeDropdown = () => {
		isThemeDropdownOpen = !isThemeDropdownOpen;
		if (isThemeDropdownOpen) {
			isCalculatorDropdownOpen = false;
		}
	};
	
	const toggleCalculatorDropdown = () => {
		isCalculatorDropdownOpen = !isCalculatorDropdownOpen;
		if (isCalculatorDropdownOpen) {
			isThemeDropdownOpen = false;
		}
	};
	
	// Close dropdowns when clicking outside
	const handleClickOutside = (event: Event) => {
		const target = event.target as HTMLElement;
		if (!target.closest('.theme-dropdown-container')) {
			isThemeDropdownOpen = false;
		}
		if (!target.closest('.calculator-dropdown-container')) {
			isCalculatorDropdownOpen = false;
		}
	};
	
	// Check if calculator is active
	const isCalculatorActive = (href: string) => currentPath === href;
	const isCalculatorSectionActive = () => currentPath.startsWith('/demo/system');
	
	// Get status info for calculators
	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'ready':
				return { label: 'Ready', class: 'ready' };
			case 'wip':
				return { label: 'WIP', class: 'wip' };
			case 'planned':
				return { label: 'Coming Soon', class: 'planned' };
			default:
				return { label: 'Unknown', class: 'unknown' };
		}
	};
	
	// Close dropdowns on navigation
	$effect(() => {
		if (currentPath) {
			isThemeDropdownOpen = false;
			isCalculatorDropdownOpen = false;
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="A turn-based dungeon crawling RPG with deep character progression" />
</svelte:head>

<svelte:window onclick={handleClickOutside} />

<div class="app-layout">
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<!-- Left: Logo/Home -->
			<div class="header-left">
				<a href="/" class="home-link">
					<h1 class="app-title">
						<span class="title-icon">⚔️</span>
						{title}
					</h1>
				</a>
			</div>
			
			<!-- Center: Main Navigation -->
			<div class="header-center">
				<nav class="main-nav" aria-label="Main navigation">
					<a href="/" class="nav-link" class:active={currentPath === '/'}>
						Home
					</a>
					
					<!-- Calculator Dropdown -->
					<div class="calculator-dropdown-container">
						<button 
							onclick={toggleCalculatorDropdown}
							class="nav-link dropdown-trigger"
							class:active={isCalculatorSectionActive()}
							aria-expanded={isCalculatorDropdownOpen}
							aria-haspopup="true"
							aria-label="Calculator tools"
						>
							Calculators
							<span class="dropdown-arrow" class:rotated={isCalculatorDropdownOpen}>▼</span>
						</button>
						
						{#if isCalculatorDropdownOpen}
							<div class="dropdown-panel calculator-dropdown" role="menu">
								<div class="dropdown-header">
									<h3>System Calculators</h3>
									<p>Test game mechanics and formulas</p>
								</div>
								
								<div class="dropdown-content">
									{#each calculators as calc}
										{@const statusInfo = getStatusInfo(calc.status)}
										<a 
											href={calc.href}
											class="calculator-item"
											class:active={isCalculatorActive(calc.href)}
											class:disabled={calc.status === 'planned'}
											role="menuitem"
											tabindex={calc.status === 'planned' ? -1 : 0}
										>
											<div class="calc-header">
												<span class="calc-icon" aria-hidden="true">{calc.icon}</span>
												<span class="calc-status {statusInfo.class}">{statusInfo.label}</span>
											</div>
											<div class="calc-content">
												<div class="calc-name">{calc.name}</div>
												<div class="calc-description">{calc.description}</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>
					
					<a href="/docs" class="nav-link" class:active={currentPath.includes('/docs')}>
						Documentation
					</a>
				</nav>
			</div>
			
			<!-- Right: Theme Controls -->
			<div class="header-right">
				<div class="theme-controls">
					<!-- Mode Toggle -->
					<button 
						onclick={handleModeToggle}
						class="mode-toggle"
						title={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
						aria-label={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
					>
						<span aria-hidden="true">{modeIcons[currentMode]}</span>
					</button>
					
					<!-- Theme Dropdown -->
					<div class="theme-dropdown-container">
						<button 
							onclick={toggleThemeDropdown}
							class="theme-toggle"
							aria-expanded={isThemeDropdownOpen}
							aria-haspopup="true"
							aria-label="Change theme"
							title="Change theme"
						>
							<span class="theme-icon" aria-hidden="true">{themeIcons[currentTheme]}</span>
							<span class="dropdown-arrow" class:rotated={isThemeDropdownOpen}>▼</span>
						</button>
						
						{#if isThemeDropdownOpen}
							<div class="dropdown-panel theme-dropdown" role="menu">
								<div class="dropdown-header">
									<h3>Select Theme</h3>
								</div>
								
								<div class="theme-grid">
									{#each availableThemes as theme}
										<button
											onclick={() => handleThemeChange(theme)}
											class="theme-option"
											class:active={currentTheme === theme}
											role="menuitem"
											aria-label={`Select ${themeConfigs[theme].displayName} theme`}
										>
											<span class="theme-option-icon" aria-hidden="true">{themeIcons[theme]}</span>
											<span class="theme-option-name">{themeConfigs[theme].displayName}</span>
										</button>
									{/each}
								</div>
								
								<div class="current-theme-info">
									<div class="current-theme-name">{currentThemeConfig.displayName}</div>
									<div class="current-theme-mode">{currentMode} mode</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="app-main" >
		<div class="main-content">
			{@render children()}
		</div>
	</main>

	<!-- Footer -->
	<footer class="app-footer" >
		<div class="footer-content">
			<p class="footer-text">
				Built with Svelte 5 • 
				<a href="https://github.com" class="footer-link">Source Code</a> • 
				<span class="version">v0.1.0</span>
			</p>
		</div>
	</footer>
</div>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	/* Header Styles */
	.app-header {
		background-color: var(--bg-secondary);
		border-bottom: 2px solid var(--border-primary);
		box-shadow: 0 2px 4px var(--shadow-light);
		position: sticky;
		top: 0;
		z-index: 1000;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 2rem;
	}

	/* Header Sections */
	.header-left {
		display: flex;
		align-items: center;
	}

	.header-center {
		display: flex;
		justify-content: center;
	}

	.header-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	/* Logo */
	.home-link {
		text-decoration: none;
		color: inherit;
		transition: var(--transition-theme);
	}

	.home-link:hover .app-title {
		color: var(--color-primary-hover);
		transform: translateX(2px);
	}

	.app-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: var(--transition-theme);
	}

	.title-icon {
		font-size: 1.75rem;
		filter: drop-shadow(0 2px 4px var(--shadow-medium));
	}

	/* Navigation */
	.main-nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-link {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		transition: var(--transition-theme);
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		font-family: inherit;
	}

	.nav-link:hover,
	.nav-link.active {
		background-color: var(--bg-tertiary);
		color: var(--color-primary);
	}

	.nav-link:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Dropdown Components */
	.calculator-dropdown-container,
	.theme-dropdown-container {
		position: relative;
	}

	.dropdown-trigger {
		background: none !important;
	}

	.dropdown-arrow {
		font-size: 0.75rem;
		transition: transform 0.2s ease;
		margin-left: 0.25rem;
	}

	.dropdown-arrow.rotated {
		transform: rotate(180deg);
	}

	.dropdown-panel {
		position: absolute;
		top: 100%;
		margin-top: 0.5rem;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		box-shadow: 0 8px 24px var(--shadow-heavy);
		z-index: 1001;
		min-width: 280px;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-header {
		padding: 1rem 1rem 0.5rem;
		border-bottom: 1px solid var(--border-primary);
	}

	.dropdown-header h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.dropdown-header p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	/* Calculator Dropdown */
	.calculator-dropdown {
		right: 0;
		width: 320px;
	}

	.dropdown-content {
		padding: 0.5rem;
	}

	.calculator-item {
		display: block;
		padding: 1rem;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: var(--transition-theme);
		border: 1px solid transparent;
		margin-bottom: 0.25rem;
	}

	.calculator-item:last-child {
		margin-bottom: 0;
	}

	.calculator-item:hover:not(.disabled) {
		background-color: var(--bg-tertiary);
		border-color: var(--border-secondary);
	}

	.calculator-item.active {
		background-color: var(--color-primary);
		color: var(--text-inverse);
	}

	.calculator-item.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.calculator-item:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.calc-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.calc-icon {
		font-size: 1.25rem;
	}

	.calc-status {
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.calc-status.ready {
		background-color: var(--color-success);
		color: var(--text-inverse);
	}

	.calc-status.wip {
		background-color: var(--color-warning);
		color: var(--text-inverse);
	}

	.calc-status.planned {
		background-color: var(--color-secondary);
		color: var(--text-inverse);
	}

	.calc-content {
		text-align: left;
	}

	.calc-name {
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.calc-description {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.3;
	}

	.calculator-item.active .calc-description {
		color: inherit;
		opacity: 0.9;
	}

	/* Theme Controls */
	.theme-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mode-toggle,
	.theme-toggle {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 0.5rem;
		cursor: pointer;
		transition: var(--transition-theme);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 1rem;
	}

	.mode-toggle:hover,
	.theme-toggle:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
	}

	.mode-toggle:focus-visible,
	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.theme-icon {
		font-size: 1.25rem;
	}

	/* Theme Dropdown */
	.theme-dropdown {
		right: 0;
		width: 240px;
	}

	.theme-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.theme-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
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
	}

	.theme-option.active {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
	}

	.theme-option:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.theme-option-icon {
		font-size: 1.5rem;
	}

	.theme-option-name {
		font-weight: 500;
		text-align: center;
		line-height: 1.2;
	}

	.current-theme-info {
		text-align: center;
		padding: 0.75rem 1rem;
		background-color: var(--bg-tertiary);
		border-top: 1px solid var(--border-primary);
		margin: 0.5rem 0 0 0;
	}

	.current-theme-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.current-theme-mode {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: capitalize;
	}

	/* Main Content */
	.app-main {
		flex: 1;
		background-color: var(--bg-primary);
	}

	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* Footer */
	.app-footer {
		background-color: var(--bg-secondary);
		border-top: 1px solid var(--border-primary);
		margin-top: auto;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		text-align: center;
	}

	.footer-text {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.footer-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		transition: var(--transition-theme);
	}

	.footer-link:hover {
		color: var(--color-primary-hover);
		text-decoration: underline;
	}

	.version {
		color: var(--text-secondary);
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.header-content {
			gap: 1rem;
		}
		
		.app-title {
			font-size: 1.25rem;
		}
		
		.title-icon {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.header-content {
			grid-template-columns: 1fr auto;
			grid-template-areas: 
				"logo controls"
				"nav nav";
			gap: 1rem;
			padding: 1rem;
		}
		
		.header-left {
			grid-area: logo;
		}
		
		.header-center {
			grid-area: nav;
			justify-content: flex-start;
		}
		
		.header-right {
			grid-area: controls;
		}
		
		.main-nav {
			gap: 0.25rem;
			flex-wrap: wrap;
		}
		
		.nav-link {
			padding: 0.5rem 0.75rem;
			font-size: 0.875rem;
		}
		
		.dropdown-panel {
			left: 0;
			right: auto;
			min-width: 280px;
			max-width: calc(100vw - 2rem);
		}
		
		.calculator-dropdown {
			width: 300px;
		}
		
		.main-content {
			padding: 1rem;
		}
		
		.footer-content {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.app-title {
			font-size: 1.125rem;
		}
		
		.title-icon {
			font-size: 1.25rem;
		}
		
		.nav-link {
			padding: 0.375rem 0.5rem;
		}
		
		.theme-controls {
			gap: 0.25rem;
		}
		
		.mode-toggle,
		.theme-toggle {
			padding: 0.375rem;
		}
		
		.theme-grid {
			grid-template-columns: 1fr;
		}
	}
</style>