<!-- src/routes/demo/system/ap-progression/+page.svelte -->
<script lang="ts">
	import {
		SCALING_FORMULAS,
		calculateTotalAP,
		generateProgressionData,
		type APConfig,
		type Character,
		type ScalingFormula
	} from '$lib/types/apProgression.js';

	import ConfigPanel from '$lib/components/APProgression/ConfigPanel.svelte';
	import CharacterPanel from '$lib/components/APProgression/CharacterPanel.svelte';
	import ResultsPanel from '$lib/components/APProgression/ResultsPanel.svelte';
	import ProgressionChart from '$lib/components/APProgression/ProgressionChart.svelte';
	import ExamplesGrid from '$lib/components/APProgression/ExamplesGrid.svelte';

	// Configuration state with updated defaults for universal system
	let config = $state<APConfig>({
		baseAP: 3,
		softCapLevel: 50,
		softCapAP: 8,
		maxLevel: 100,
		dexBonus: 0,
		scalingType: 'universal',
		// Formula parameters with defaults
		linearMultiplier: 0.5,
		logarithmicMultiplier: 2,
		softCapMultiplier: 1.5,
		milestoneInterval: 10,
		// Dexterity configuration with updated defaults
		dexPerAP: 10,
		dexDiminishingThreshold: 50,
		dexDiminishingRatio: 2,
		// Post-soft-cap dex requirements
		postSoftCapDexBase: 50,
		postSoftCapDexMultiplier: 2.0
	});

	// Character state
	let character = $state<Character>({
		level: 1,
		dexterity: 0,
		ascensions: 0
	});

	// Selected formula - default to universal
	let selectedFormula = $state<ScalingFormula>(SCALING_FORMULAS[0]); // Universal by default

	// Display settings
	let chartMaxLevel = $state(100);

	// Calculate current character's AP
	const currentAP = $derived.by(() => {
		return calculateTotalAP(character, config, selectedFormula);
	});

	// Generate progression data for visualization
	const progressionData = $derived.by(() => {
		return generateProgressionData(
			config,
			selectedFormula,
			chartMaxLevel,
			character.dexterity,
			character.ascensions
		);
	});

	// Event handlers
	function handleConfigChange(newConfig: APConfig) {
		config = newConfig;
	}

	function handleFormulaChange(newFormula: ScalingFormula) {
		selectedFormula = newFormula;
	}

	function handleCharacterChange(newCharacter: Character) {
		character = newCharacter;
	}

	function handleChartMaxLevelChange(newLevel: number) {
		chartMaxLevel = newLevel;
	}
</script>

<svelte:head>
	<title>AP Progression Simulator</title>
	<meta
		name="description"
		content="Test AP scaling formulas including universal progression for the Diablo-like web game"
	/>
</svelte:head>

<div class="ap-simulator">
	<header class="page-header">
		<h1 class="page-title">
			<span class="title-icon">⚡</span>
			AP Progression Simulator
		</h1>
		<p class="page-description">
			Test different AP scaling formulas including the new universal progression system
		</p>
	</header>

	<div class="simulator-grid">
		<!-- Configuration Panel -->
		<ConfigPanel
			{config}
			{selectedFormula}
			{chartMaxLevel}
			onConfigChange={handleConfigChange}
			onFormulaChange={handleFormulaChange}
			onChartMaxLevelChange={handleChartMaxLevelChange}
		/>

		<!-- Character Settings -->
		<CharacterPanel {character} {selectedFormula} onCharacterChange={handleCharacterChange} />

		<!-- Current Result -->
		<ResultsPanel result={currentAP} {character} {config} {selectedFormula} />

		<!-- Progression Visualization -->
		<div class="chart-section">
			<ProgressionChart {progressionData} {selectedFormula} {character} {config} {chartMaxLevel} />
		</div>

		<!-- Universal System Examples -->
		{#if selectedFormula.type === 'universal'}
			<ExamplesGrid {config} {selectedFormula} />
		{/if}
	</div>
</div>

<style>
	.ap-simulator {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--bg-primary);
		min-height: 100vh;
		transition: var(--transition-theme);
	}

	/* Header Styles */
	.page-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		box-shadow: 0 4px 8px var(--shadow-light);
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		color: var(--color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.title-icon {
		font-size: 3rem;
		filter: drop-shadow(0 2px 4px var(--shadow-medium));
	}

	.page-description {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Grid Layout */
	.simulator-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.chart-section {
		grid-column: 1 / -1;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.ap-simulator {
			padding: 1rem;
		}

		.page-header {
			padding: 1.5rem;
			margin-bottom: 2rem;
		}

		.page-title {
			font-size: 2rem;
			flex-direction: column;
			gap: 0.5rem;
		}

		.title-icon {
			font-size: 2.5rem;
		}

		.simulator-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.page-title {
			font-size: 1.75rem;
		}

		.title-icon {
			font-size: 2rem;
		}

		.page-description {
			font-size: 1rem;
		}
	}
</style>
