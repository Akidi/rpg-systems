<!-- src/lib/components/CalculatorNavigation.svelte -->
<script lang="ts">
	import { page } from '$app/stores';

	interface Calculator {
		name: string;
		href: string;
		icon: string;
		description: string;
		status: 'ready' | 'wip' | 'planned';
		color: string;
	}

	const calculators: Calculator[] = [
		{
			name: 'Enhancement System',
			href: '/demo/system/enhancements',
			icon: '✨',
			description: 'Test skill enhancement mechanics and mana costs',
			status: 'ready',
			color: 'var(--color-accent)'
		},
		{
			name: 'Currency System',
			href: '/demo/system/currency',
			icon: '💰',
			description: 'Multi-tier currency conversion and pricing',
			status: 'ready',
			color: 'var(--color-gold)'
		},
		{
			name: 'AP Progression',
			href: '/demo/system/ap-progression',
			icon: '⚡',
			description: 'Action Point scaling formulas and dex investment',
			status: 'ready',
			color: 'var(--color-primary)'
		},
		{
			name: 'Turn System',
			href: '/demo/system/turn-system',
			icon: '🎯',
			description: 'Turn-based combat mechanics and timing',
			status: 'wip',
			color: 'var(--color-info)'
		},
		{
			name: 'Formula Planner',
			href: '/demo/system/formula-planner',
			icon: '📊',
			description: 'Advanced formula testing and comparison tools',
			status: 'wip',
			color: 'var(--color-secondary)'
		}
	];

	// Component state
	let isExpanded = $state(false);

	// Toggle navigation
	const toggleNavigation = () => {
		isExpanded = !isExpanded;
	};

	// Close when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.calculator-navigation')) {
			isExpanded = false;
		}
	}

	// Get current page to highlight active calculator
	const currentPath = $derived($page?.url?.pathname || '');

	// Check if calculator is active
	const isActive = (calc: Calculator) => currentPath === calc.href;

	// Get status badge info
	const getStatusInfo = (status: Calculator['status']) => {
		switch (status) {
			case 'ready':
				return { label: 'Ready', class: 'ready' };
			case 'wip':
				return { label: 'WIP', class: 'wip' };
			case 'planned':
				return { label: 'Planned', class: 'planned' };
			default:
				return { label: 'Unknown', class: 'unknown' };
		}
	};
</script>

<svelte:window onclick={handleClickOutside} />

<nav class="calculator-navigation" class:expanded={isExpanded}>
	<!-- Compact Toggle Button -->
	<button
		onclick={toggleNavigation}
		class="nav-toggle"
		title="Calculator Navigation"
		aria-label="Open calculator navigation"
	>
		<span class="nav-icon">🧮</span>
		<span class="expand-arrow" class:rotated={isExpanded}>▼</span>
	</button>

	<!-- Navigation Panel -->
	{#if isExpanded}
		<div class="nav-panel">
			<div class="nav-header">
				<h3 class="nav-title">System Calculators</h3>
				<p class="nav-subtitle">Test game mechanics and formulas</p>
			</div>

			<div class="nav-content">
				<div class="nav-grid">
					{#each calculators as calc}
						{@const statusInfo = getStatusInfo(calc.status)}
						<a
							href={calc.href}
							class="calc-card"
							class:active={isActive(calc)}
							class:disabled={calc.status === 'planned'}
							style="--calc-color: {calc.color}"
						>
							<div class="card-header">
								<span class="card-icon">{calc.icon}</span>
								<div class="card-status">
									<span class="status-badge {statusInfo.class}">
										{statusInfo.label}
									</span>
								</div>
							</div>

							<div class="card-content">
								<h4 class="card-title">{calc.name}</h4>
								<p class="card-description">{calc.description}</p>
							</div>

							{#if isActive(calc)}
								<div class="active-indicator"></div>
							{/if}
						</a>
					{/each}
				</div>

				<div class="nav-footer">
					<div class="status-legend">
						<div class="legend-item">
							<span class="status-badge ready"></span>
							<span class="legend-label">Available</span>
						</div>
						<div class="legend-item">
							<span class="status-badge wip"></span>
							<span class="legend-label">In Progress</span>
						</div>
						<div class="legend-item">
							<span class="status-badge planned"></span>
							<span class="legend-label">Coming Soon</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</nav>

<style>
	.calculator-navigation {
		position: fixed;
		top: 80px;
		left: 20px;
		z-index: 900;
		transition: var(--transition-theme);
	}

	.nav-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		width: 44px;
		height: 44px;
		padding: 0;
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border: 1px solid var(--border-primary);
		border-radius: 50%;
		cursor: pointer;
		transition: var(--transition-theme);
		box-shadow: 0 2px 8px var(--shadow-medium);
		position: relative;
	}

	.nav-toggle:hover {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		color: var(--text-inverse);
		transform: scale(1.05);
		box-shadow: 0 4px 12px var(--shadow-heavy);
	}

	.nav-icon {
		font-size: 1.125rem;
	}

	.expand-arrow {
		position: absolute;
		bottom: -2px;
		right: -2px;
		font-size: 0.625rem;
		color: var(--text-muted);
		background-color: var(--bg-primary);
		border-radius: 50%;
		width: 14px;
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.expand-arrow.rotated {
		transform: rotate(180deg);
	}

	.nav-toggle:hover .expand-arrow {
		color: var(--text-inverse);
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.nav-panel {
		position: absolute;
		top: 0;
		left: 55px;
		width: 340px;
		max-height: 80vh;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 0;
		box-shadow: 0 8px 24px var(--shadow-heavy);
		animation: slideIn 0.2s ease-out;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.nav-header {
		padding: 1rem;
		margin-bottom: 0;
		text-align: center;
		border-bottom: 1px solid var(--border-primary);
		flex-shrink: 0;
	}

	.nav-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
	}

	.nav-subtitle {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.nav-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.nav-grid {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.calc-card {
		display: block;
		position: relative;
		padding: 1rem;
		background-color: var(--bg-tertiary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: var(--transition-theme);
		overflow: hidden;
	}

	.calc-card:hover:not(.disabled) {
		border-color: var(--calc-color);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px var(--shadow-medium);
	}

	.calc-card.active {
		border-color: var(--calc-color);
		background-color: var(--bg-primary);
		box-shadow: 0 0 0 1px var(--calc-color);
	}

	.calc-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
		pointer-events: none;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.card-icon {
		font-size: 1.5rem;
	}

	.card-status {
		display: flex;
		align-items: center;
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.status-badge.ready {
		background-color: rgba(var(--color-success), 0.2);
		color: var(--color-success);
		border: 1px solid var(--color-success);
	}

	.status-badge.wip {
		background-color: rgba(var(--color-warning), 0.2);
		color: var(--color-warning);
		border: 1px solid var(--color-warning);
	}

	.status-badge.planned {
		background-color: rgba(var(--color-secondary), 0.2);
		color: var(--color-secondary);
		border: 1px solid var(--color-secondary);
	}

	.card-content {
		text-align: left;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
	}

	.card-description {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.active-indicator {
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--calc-color);
		border-radius: 0 2px 2px 0;
	}

	.nav-footer {
		border-top: 1px solid var(--border-primary);
		padding-top: 1rem;
		margin-top: auto;
	}

	.status-legend {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.calculator-navigation {
			top: 70px;
			left: 10px;
		}

		.nav-panel {
			width: calc(100vw - 80px);
			max-width: 320px;
		}

		.nav-toggle {
			width: 40px;
			height: 40px;
		}

		.nav-icon {
			font-size: 1rem;
		}

		.expand-arrow {
			width: 12px;
			height: 12px;
			font-size: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.calculator-navigation {
			top: 60px;
			left: 8px;
		}

		.nav-panel {
			width: calc(100vw - 60px);
			max-width: 280px;
		}

		.nav-toggle {
			width: 36px;
			height: 36px;
		}

		.nav-icon {
			font-size: 0.875rem;
		}
	}
</style>
