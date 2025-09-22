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
	let activeTab = $state<'planner' | 'math'>('planner');

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
	<title>Formula Planner - Game Stat Calculator</title>
	<meta name="description" content="Design and test mathematical formulas for game stats with real-time preview" />
</svelte:head>

<div class="container">
	<header class="page-header">
		<h1>Formula Planner</h1>
		<p class="subtitle">Design and test mathematical formulas for game statistics</p>
	</header>

	<div class="tabs">
		<button 
			class="tab {activeTab === 'planner' ? 'active' : ''}"
			onclick={() => activeTab = 'planner'}
		>
			Formula Editor
		</button>
		<button 
			class="tab {activeTab === 'math' ? 'active' : ''}"
			onclick={() => activeTab = 'math'}
		>
			Math Reference
		</button>
	</div>

	{#if activeTab === 'planner'}
		<FormulaCalculator 
			{currentFormulas}
			{selectedBuild}
			{derivedStats}
			onFormulaUpdate={handleFormulaUpdate}
			onBuildLoad={handleBuildLoad}
			onStatUpdate={handleStatUpdate}
		/>
	{:else if activeTab === 'math'}
		<MathReference />
	{/if}
</div>

<style>
	.container {
		min-height: 100vh;
		background-color: #f8fafc;
		font-family: system-ui, sans-serif;
	}

	.page-header {
		text-align: center;
		padding: 24px 16px;
		background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
		color: white;
	}

	.page-header h1 {
		margin: 0 0 8px 0;
		font-size: clamp(24px, 5vw, 32px);
		font-weight: 700;
	}

	.subtitle {
		margin: 0;
		font-size: clamp(14px, 3vw, 16px);
		opacity: 0.9;
	}

	.tabs {
		display: flex;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		max-width: 1400px;
		margin: 0 auto;
	}

	.tab {
		flex: 1;
		padding: 16px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		font-weight: 500;
		color: #6b7280;
		border-bottom: 3px solid transparent;
		transition: all 0.2s;
	}

	.tab.active {
		color: #8b5cf6;
		border-bottom-color: #8b5cf6;
		background-color: #faf5ff;
	}

	.tab:hover:not(.active) {
		background-color: #f9fafb;
		color: #374151;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.container {
			background-color: #111827;
			color: #f9fafb;
		}

		.page-header {
			background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		}

		.tabs {
			background: #1f2937;
			border-bottom-color: #374151;
		}

		.tab {
			color: #9ca3af;
		}

		.tab.active {
			color: #a855f7;
			background-color: #1e1b4b;
		}

		.tab:hover:not(.active) {
			background-color: #374151;
			color: #f3f4f6;
		}
	}
</style>