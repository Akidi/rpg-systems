<!-- src/lib/components/AppLayout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { themeActions } from '$lib/stores/themes';
	import FloatingThemeSwitcher from './FloatingThemeSwitcher.svelte';
	import CalculatorNavigation from './CalculatorNavigation.svelte';
	
	interface Props {
		children: import('svelte').Snippet;
		showThemeSwitcher?: boolean;
		showCalculatorNav?: boolean;
		title?: string;
	}
	
	const { 
		children, 
		showThemeSwitcher = true,
		showCalculatorNav = true,
		title = 'Dungeon Crawler RPG' 
	}: Props = $props();
	
	// Initialize theme system on mount
	onMount(() => {
		themeActions.initialize();
	});
	
	// Show calculator nav only on demo/system pages
	const shouldShowCalculatorNav = $derived(
		showCalculatorNav && $page?.url?.pathname?.startsWith('/demo/system')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="A turn-based dungeon crawling RPG with deep character progression" />
</svelte:head>

<div class="app-layout">
	<!-- Floating Components -->
	{#if showThemeSwitcher}
		<FloatingThemeSwitcher />
	{/if}
	
	{#if shouldShowCalculatorNav}
		<CalculatorNavigation />
	{/if}

	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<div class="header-left">
				<a href="/" class="home-link">
					<h1 class="app-title">
						<span class="title-icon">⚔️</span>
						{title}
					</h1>
				</a>
			</div>
			
			<div class="header-right">
				<nav class="main-nav">
					<a href="/" class="nav-link">Home</a>
					<a href="/demo/system/currency" class="nav-link">Calculators</a>
					<a href="/docs" class="nav-link">Documentation</a>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="app-main">
		<div class="main-content">
			{@render children()}
		</div>
	</main>

	<!-- Footer -->
	<footer class="app-footer">
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
		z-index: 100;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-left {
		flex: 1;
	}

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
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: var(--transition-theme);
	}

	.title-icon {
		font-size: 2rem;
		filter: drop-shadow(0 2px 4px var(--shadow-medium));
	}

	.header-right {
		display: flex;
		align-items: center;
	}

	.main-nav {
		display: flex;
		gap: 1.5rem;
	}

	.nav-link {
		color: var(--text-primary);
		text-decoration: none;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: var(--transition-theme);
		position: relative;
	}

	.nav-link:hover {
		color: var(--color-primary);
		background-color: var(--bg-tertiary);
	}

	.nav-link:hover::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		transform: translateX(-50%);
		width: 20px;
		height: 2px;
		background-color: var(--color-primary);
		border-radius: 1px;
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
	@media (max-width: 768px) {
		.header-content {
			padding: 1rem;
			flex-direction: column;
			gap: 1rem;
		}
		
		.app-title {
			font-size: 1.5rem;
		}
		
		.main-nav {
			gap: 1rem;
		}
		
		.nav-link {
			padding: 0.375rem 0.75rem;
			font-size: 0.875rem;
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
			font-size: 1.25rem;
		}
		
		.title-icon {
			font-size: 1.5rem;
		}
		
		.main-nav {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>