<!-- src/routes/formula-planner/+page.svelte -->
<script lang="ts">
	import type { 
		CharacterStats, 
		DerivedStats, 
		FormulaSet, 
		CharacterBuild
	} from '$lib/types/formulaPlanner.js';
	import { DEFAULT_FORMULAS, EXAMPLE_BUILDS } from '$lib/types/formulaPlanner.js';
	import FormulaCalculator from '$lib/components/FormulaSystem/FormulaCalculator.svelte';
	import MathReference from '$lib/components/FormulaSystem/MathReference.svelte';

	// Current tab
	let activeTab = $state<'planner' | 'reference'>('planner');

	// Formula state
	let currentFormulas = $state<FormulaSet>({ ...DEFAULT_FORMULAS });
	let selectedBuild = $state<CharacterBuild>({ ...EXAMPLE_BUILDS[0] });

	// Calculate derived stats using formulas
	function calculateDerivedStats(stats: CharacterStats, formulas: Record<keyof DerivedStats, string>): DerivedStats | null {
		try {
			// Create context with both full names and abbreviations
			const context = {
				level: stats.level,
				strength: stats.strength, STR: stats.strength,
				dexterity: stats.dexterity, DEX: stats.dexterity,
				intelligence: stats.intelligence, INT: stats.intelligence,
				constitution: stats.constitution, CON: stats.constitution,
				wisdom: stats.wisdom, WIS: stats.wisdom,
				charisma: stats.charisma, CHA: stats.charisma,
				// Math functions
				Math: Math,
				// Helper functions
				min: Math.min,
				exp: Math.exp,
				max: Math.max,
				floor: Math.floor,
				ceil: Math.ceil,
				round: Math.round,
				pow: Math.pow,
				sqrt: Math.sqrt,
				log: Math.log
			};

			const result: Partial<DerivedStats> = {};

			for (const [key, formula] of Object.entries(formulas)) {
				try {
					// Create a function that evaluates the formula in the context
					const func = new Function(...Object.keys(context), `return ${formula}`);
					const value = func(...Object.values(context));
					
					if (typeof value === 'number' && !isNaN(value)) {
						result[key as keyof DerivedStats] = Math.round(value * 100) / 100; // Round to 2 decimals
					} else {
						return null; // Invalid result
					}
				} catch {
					return null; // Formula error
				}
			}

			return result as DerivedStats;
		} catch {
			return null;
		}
	}

	// Reactive calculation of current character's derived stats
	const derivedStats = $derived.by(() => {
		return calculateDerivedStats(selectedBuild.stats, currentFormulas.formulas);
	});

	// Event handlers
	function handleFormulaUpdate(statName: keyof DerivedStats, formula: string) {
		currentFormulas.formulas[statName] = formula;
		currentFormulas = { ...currentFormulas };
	}

	function handleBuildLoad(buildIndex: number) {
		selectedBuild = { ...EXAMPLE_BUILDS[buildIndex] };
	}

	function handleStatUpdate(statName: keyof CharacterStats, value: number) {
		selectedBuild.stats[statName] = value;
		selectedBuild = { ...selectedBuild };
	}
</script>

<svelte:head>
	<title>Formula Planner - RPG Stat Calculator</title>
	<meta name="description" content="Design and test mathematical formulas for RPG game statistics with real-time preview and visual feedback" />
</svelte:head>

<main class="app">
	<header class="hero">
		<div class="hero-content">
			<h1 class="hero-title">Formula Planner</h1>
			<p class="hero-subtitle">Design balanced mathematical formulas for RPG stat systems</p>
		</div>
	</header>

	<nav class="navigation">
		<div class="nav-container">
			<button 
				class="nav-tab {activeTab === 'planner' ? 'active' : ''}"
				onclick={() => activeTab = 'planner'}
			>
				<span class="nav-icon">🔧</span>
				<span class="nav-text">Formula Builder</span>
			</button>
			<button 
				class="nav-tab {activeTab === 'reference' ? 'active' : ''}"
				onclick={() => activeTab = 'reference'}
			>
				<span class="nav-icon">📚</span>
				<span class="nav-text">Math Reference</span>
			</button>
		</div>
	</nav>

	<div class="content">
		{#if activeTab === 'planner'}
			<FormulaCalculator 
				{currentFormulas}
				{selectedBuild}
				{derivedStats}
				onFormulaUpdate={handleFormulaUpdate}
				onBuildLoad={handleBuildLoad}
				onStatUpdate={handleStatUpdate}
			/>
		{:else}
			<MathReference />
		{/if}
	</div>
</main>

<style>
	.app {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: system-ui, -apple-system, sans-serif;
	}

	/* Hero Section */
	.hero {
		padding: 40px 20px;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		z-index: 0;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		margin: 0 0 12px 0;
		font-size: clamp(32px, 6vw, 48px);
		font-weight: 800;
		color: white;
		text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		margin: 0;
		font-size: clamp(16px, 3vw, 20px);
		color: rgba(255, 255, 255, 0.9);
		font-weight: 400;
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
	}

	/* Navigation */
	.navigation {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0 20px;
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		gap: 2px;
	}

	.nav-tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 24px;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.8);
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		border-radius: 12px 12px 0 0;
		transition: all 0.3s ease;
		position: relative;
	}

	.nav-tab:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		transform: translateY(-2px);
	}

	.nav-tab.active {
		background: white;
		color: #667eea;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
	}

	.nav-tab.active:hover {
		transform: none;
	}

	.nav-icon {
		font-size: 20px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	/* Content Area */
	.content {
		background: #f8fafc;
		min-height: calc(100vh - 200px);
		border-radius: 20px 20px 0 0;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 1;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero {
			padding: 24px 16px;
		}

		.navigation {
			padding: 0 16px;
		}

		.nav-tab {
			padding: 12px 16px;
			font-size: 14px;
		}

		.nav-icon {
			font-size: 18px;
		}

		.nav-text {
			display: none;
		}

		.content {
			border-radius: 16px 16px 0 0;
		}
	}

	@media (max-width: 480px) {
		.nav-container {
			justify-content: center;
		}

		.nav-tab {
			flex: 1;
			justify-content: center;
			max-width: 120px;
		}
	}

	/* Dark Mode */
	@media (prefers-color-scheme: dark) {
		.app {
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		}

		.content {
			background: #111827;
		}

		.hero::before {
			background: rgba(0, 0, 0, 0.2);
		}

		.navigation {
			background: rgba(0, 0, 0, 0.3);
			border-bottom-color: rgba(255, 255, 255, 0.1);
		}

		.nav-tab:hover {
			background: rgba(255, 255, 255, 0.05);
		}

		.nav-tab.active {
			background: #1f2937;
			color: #a855f7;
		}
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hero-content {
		animation: fadeInUp 0.6s ease-out;
	}

	.navigation {
		animation: fadeInUp 0.6s ease-out 0.1s both;
	}

	.content {
		animation: fadeInUp 0.6s ease-out 0.2s both;
	}
</style>