<!-- src/routes/ap-recovery/+page.svelte -->
<script lang="ts">
	import type { Character, TurnPattern, APRecoveryConfig, SimulationResult } from '$lib/types/turnSystem.js';
	import { DEFAULT_CONFIG, TURN_PATTERNS } from '$lib/types/turnSystem.js';
	import { simulateMultipleTurns } from '$lib/calculations/turnSystem.js';
	import { calculateTotalAP, SCALING_FORMULAS, type APConfig } from '$lib/types/apProgression.js';
	import TurnBuilder from '$lib/components/TurnBuilder.svelte';
	import TurnDisplay from '$lib/components/TurnDisplay.svelte';

	// Character configuration for AP calculation
	let character = $state<Character>({
		level: 20,
		dexterity: 40,
		ascensions: 0,
		maxAP: 5 // Will be calculated
	});

	// AP progression config (for calculating max AP)
	let apConfig = $state<APConfig>({
		baseAP: 3,
		softCapLevel: 50,
		softCapAP: 8,
		maxLevel: 100,
		dexBonus: 0,
		scalingType: 'universal',
		linearMultiplier: 0.5,
		logarithmicMultiplier: 2,
		softCapMultiplier: 1.5,
		milestoneInterval: 10,
		dexPerAP: 10,
		dexDiminishingThreshold: 50,
		dexDiminishingRatio: 2,
		postSoftCapDexBase: 50,
		postSoftCapDexMultiplier: 2.0
	});

	// Recovery configuration
	let recoveryConfig = $state<APRecoveryConfig>({
		...DEFAULT_CONFIG
	});

	// Current turn pattern
	let currentPattern = $state<TurnPattern>({
		...TURN_PATTERNS.conservative
	});

	// Simulation settings
	let numTurns = $state(8);
	let showDetailedTurns = $state(true);

	// Calculate max AP from progression system
	const maxAP = $derived.by(() => {
		const universalFormula = SCALING_FORMULAS[0];
		const result = calculateTotalAP(character, apConfig, universalFormula);
		return result.totalAP;
	});

	// Update character maxAP when it changes
	$effect(() => {
		character.maxAP = maxAP;
	});

	// Run simulation
	const simulationResult = $derived.by((): SimulationResult => {
		return simulateMultipleTurns(character, currentPattern, numTurns, recoveryConfig);
	});

	// Handle pattern updates
	function updatePattern(newPattern: TurnPattern) {
		currentPattern = newPattern;
	}

	// Load predefined patterns
	function loadPattern(patternKey: string) {
		const pattern = TURN_PATTERNS[patternKey];
		if (pattern) {
			currentPattern = { ...pattern };
		}
	}

	// Sustainability color
	const sustainabilityColor = $derived(() => {
		switch (simulationResult.sustainabilityRating) {
			case 'excellent': return '#10b981';
			case 'good': return '#3b82f6';
			case 'fair': return '#f59e0b';
			case 'poor': return '#ef4444';
			default: return '#6b7280';
		}
	});
</script>

<svelte:head>
	<title>Turn-Based AP Recovery Calculator</title>
	<meta name="description" content="Analyze turn-based AP recovery patterns with multiple actions per turn" />
</svelte:head>

<div class="container">
	<header class="page-header">
		<h1>Turn-Based AP Recovery Calculator</h1>
		<p class="subtitle">
			Design and test turn patterns with multiple actions. 
			See how different strategies affect AP sustainability over time.
		</p>
	</header>

	<div class="layout">
		<!-- Configuration Sidebar -->
		<aside class="sidebar">
			<div class="config-section">
				<h2>Character Setup</h2>
				
				<div class="form-group">
					<label for="level" class="form-label">Level:</label>
					<input 
						id="level"
						type="number" 
						bind:value={character.level}
						min="1"
						max="1000"
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="dexterity" class="form-label">Dexterity:</label>
					<input 
						id="dexterity"
						type="number" 
						bind:value={character.dexterity}
						min="0"
						max="1000"
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label for="ascensions" class="form-label">Ascensions:</label>
					<input 
						id="ascensions"
						type="number" 
						bind:value={character.ascensions}
						min="0"
						max="100"
						class="form-input"
					/>
				</div>

				<div class="ap-display">
					<div class="ap-value">{maxAP}</div>
					<div class="ap-label">Max AP</div>
				</div>
			</div>

			<div class="config-section">
				<h3>Recovery Settings</h3>
				
				<div class="form-group">
					<label for="fullRecovery" class="form-label">Full Recovery Rate:</label>
					<input 
						id="fullRecovery"
						type="number" 
						bind:value={recoveryConfig.fullRecoveryRate}
						min="0.1"
						max="1.0"
						step="0.05"
						class="form-input"
					/>
					<div class="form-hint">60% = 0.6</div>
				</div>

				<div class="form-group">
					<label for="minPartial" class="form-label">Min Partial Recovery:</label>
					<input 
						id="minPartial"
						type="number" 
						bind:value={recoveryConfig.minPartialRecovery}
						min="0.1"
						max="1.0"
						step="0.05"
						class="form-input"
					/>
					<div class="form-hint">20% = 0.2</div>
				</div>

				<div class="form-group">
					<label for="maxPartial" class="form-label">Max Partial Recovery:</label>
					<input 
						id="maxPartial"
						type="number" 
						bind:value={recoveryConfig.maxPartialRecovery}
						min="0.1"
						max="1.0"
						step="0.05"
						class="form-input"
					/>
					<div class="form-hint">40% = 0.4</div>
				</div>
			</div>

			<div class="config-section">
				<h3>Simulation</h3>
				
				<div class="form-group">
					<label for="numTurns" class="form-label">Number of Turns:</label>
					<input 
						id="numTurns"
						type="number" 
						bind:value={numTurns}
						min="3"
						max="20"
						class="form-input"
					/>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input 
							type="checkbox" 
							bind:checked={showDetailedTurns}
							class="checkbox"
						/>
						Show detailed turns
					</label>
				</div>

				<div class="preset-patterns">
					<h4>Quick Patterns:</h4>
					<button class="btn-preset" onclick={() => loadPattern('conservative')}>
						Conservative
					</button>
					<button class="btn-preset" onclick={() => loadPattern('balanced')}>
						Balanced
					</button>
					<button class="btn-preset" onclick={() => loadPattern('aggressive')}>
						Aggressive
					</button>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="main-content">
			<!-- Turn Pattern Builder -->
			<section class="pattern-section">
				<h2>Turn Pattern Builder</h2>
				<TurnBuilder 
					pattern={currentPattern}
					maxAP={maxAP}
					onPatternChange={updatePattern}
				/>
			</section>

			<!-- Simulation Results -->
			<section class="results-section">
				<div class="results-header">
					<h2>Simulation Results</h2>
					<div class="sustainability-badge" style="background-color: {sustainabilityColor()}">
						{simulationResult.sustainabilityRating}
					</div>
				</div>

				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-value">{simulationResult.averageAPPerTurn.toFixed(1)}</div>
						<div class="stat-label">Avg AP/Turn</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{simulationResult.totalTurns}</div>
						<div class="stat-label">Total Turns</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{((simulationResult.averageAPPerTurn / maxAP) * 100).toFixed(0)}%</div>
						<div class="stat-label">Efficiency</div>
					</div>
				</div>

				{#if showDetailedTurns}
					<div class="turns-container">
						<h3>Turn by Turn Results</h3>
						{#each simulationResult.turns as turn, index}
							<TurnDisplay 
								turn={turn}
								turnNumber={index + 1}
								maxAP={maxAP}
							/>
						{/each}
					</div>
				{:else}
					<div class="summary-only">
						<h3>Summary</h3>
						<p>
							Your <strong>{currentPattern.name}</strong> pattern averages 
							<strong>{simulationResult.averageAPPerTurn.toFixed(1)} AP per turn</strong> 
							with <strong style="color: {sustainabilityColor()}">{simulationResult.sustainabilityRating}</strong> 
							sustainability.
						</p>
						<p>
							This represents <strong>{((simulationResult.averageAPPerTurn / maxAP) * 100).toFixed(0)}%</strong> 
							efficiency of your maximum AP pool.
						</p>
					</div>
				{/if}
			</section>
		</main>
	</div>
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
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
		line-height: 1.5;
		max-width: 600px;
		margin: 0 auto;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		max-width: 1400px;
		margin: 0 auto;
		gap: 0;
		width: 100%;
	}

	.sidebar {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		order: 2;
	}

	.main-content {
		padding: 16px;
		order: 1;
	}

	.config-section {
		padding: 16px;
		border-bottom: 1px solid #f3f4f6;
	}

	.config-section:last-child {
		border-bottom: none;
	}

	.config-section h2, .config-section h3 {
		margin: 0 0 12px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.config-section h3 {
		font-size: 16px;
	}

	.form-group {
		margin-bottom: 12px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 4px;
		color: #374151;
	}

	.form-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
	}

	.form-hint {
		font-size: 12px;
		color: #6b7280;
		margin-top: 2px;
	}

	.checkbox-group {
		margin-bottom: 16px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #374151;
		cursor: pointer;
	}

	.checkbox {
		margin-right: 8px;
		width: 16px;
		height: 16px;
	}

	.ap-display {
		text-align: center;
		margin: 16px 0;
		padding: 16px;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		border-radius: 8px;
		border: 1px solid #bfdbfe;
	}

	.ap-value {
		font-size: 28px;
		font-weight: 700;
		color: #3b82f6;
		margin-bottom: 4px;
	}

	.ap-label {
		font-size: 14px;
		color: #6b7280;
	}

	.preset-patterns h4 {
		font-size: 14px;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #374151;
	}

	.btn-preset {
		display: block;
		width: 100%;
		margin-bottom: 6px;
		padding: 8px 12px;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		color: #374151;
		transition: all 0.2s;
	}

	.btn-preset:hover {
		background-color: #f3f4f6;
		border-color: #d1d5db;
	}

	.pattern-section, .results-section {
		margin-bottom: 24px;
	}

	.pattern-section h2, .results-section h2 {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #374151;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.sustainability-badge {
		padding: 6px 12px;
		border-radius: 20px;
		color: white;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}

	.stat-card {
		background: white;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		text-align: center;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #374151;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.turns-container h3, .summary-only h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.summary-only {
		background: white;
		padding: 20px;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.summary-only p {
		margin: 0 0 12px 0;
		line-height: 1.6;
		color: #374151;
	}

	.summary-only p:last-child {
		margin-bottom: 0;
	}

	/* Desktop Layout */
	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: 280px 1fr;
			gap: 24px;
			padding: 0 24px;
		}

		.sidebar {
			border-bottom: none;
			border-right: 1px solid #e5e7eb;
			order: 1;
			position: sticky;
			top: 0;
			height: 100vh;
			overflow-y: auto;
		}

		.main-content {
			order: 2;
			padding: 24px 0;
			max-width: none;
		}

		.config-section {
			padding: 20px;
		}

		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 16px;
		}

		.stat-card {
			padding: 20px;
		}

		.stat-value {
			font-size: 28px;
		}

		.results-header {
			margin-bottom: 24px;
		}

		.sustainability-badge {
			padding: 8px 16px;
			font-size: 14px;
		}
	}

	/* Large Desktop */
	@media (min-width: 1280px) {
		.layout {
			grid-template-columns: 320px 1fr;
			gap: 32px;
			padding: 0 32px;
		}

		.main-content {
			padding: 32px 0;
		}

		.page-header {
			padding: 32px 24px;
		}
	}

	/* Extra Large Desktop */
	@media (min-width: 1400px) {
		.layout {
			grid-template-columns: 360px 1fr;
			gap: 40px;
			padding: 0 40px;
		}
	}

	/* Mobile Enhancements */
	@media (max-width: 640px) {
		.results-header {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.sustainability-badge {
			text-align: center;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 8px;
		}

		.stat-card {
			padding: 12px;
		}

		.stat-value {
			font-size: 20px;
		}
	}

	/* Scrollbar styling */
	.sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar::-webkit-scrollbar-track {
		background: #f1f5f9;
	}

	.sidebar::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	.sidebar::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>