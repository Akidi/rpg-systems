<!-- src/lib/components/APProgression/ExamplesGrid.svelte -->
<script lang="ts">
	import { calculateTotalAP, type APConfig, type ScalingFormula } from '$lib/types/apProgression.js';

	interface Props {
		config: APConfig;
		selectedFormula: ScalingFormula;
	}

	let { config, selectedFormula }: Props = $props();

	// Example scenarios for universal system
	const scenarios = [
		{ level: 10, dex: 0, name: "No Dex Investment", description: "Pure natural progression" },
		{ level: 10, dex: 50, name: "Heavy Dex Investment", description: "Early game dex focus" },
		{ level: 25, dex: 0, name: "Mid-Game Natural", description: "Halfway to soft cap" },
		{ level: 25, dex: 100, name: "Mid-Game with Dex", description: "Accelerated progression" },
		{ level: 50, dex: 0, name: "Soft Cap Natural", description: "Universal baseline reached" },
		{ level: 50, dex: 150, name: "Soft Cap + Post-Cap Push", description: "Beyond natural limits" },
		{ level: 100, dex: 500, name: "Endgame Whale", description: "Maximum investment build" }
	];

	// Calculate results for each scenario
	const scenarioResults = $derived.by(() => {
		return scenarios.map(scenario => {
			const testChar = { level: scenario.level, dexterity: scenario.dex, ascensions: 0 };
			const result = calculateTotalAP(testChar, config, selectedFormula);
			return {
				...scenario,
				result
			};
		});
	});
</script>

<div class="examples-section">
	<h2 class="section-title">
		<span class="section-icon">🎯</span>
		Universal System Examples
	</h2>
	<p class="section-description">
		See how different character builds perform under the universal AP progression system
	</p>
	
	<div class="examples-grid">
		{#each scenarioResults as scenario}
			<div class="example-card">
				<div class="card-header">
					<h3 class="card-title">{scenario.name}</h3>
					<p class="card-description">{scenario.description}</p>
				</div>
				
				<div class="card-stats">
					<div class="stat-item">
						<span class="stat-label">Level:</span>
						<span class="stat-value">{scenario.level}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Dexterity:</span>
						<span class="stat-value">{scenario.dex}</span>
					</div>
				</div>
				
				<div class="card-result">
					<div class="ap-display">
						<span class="ap-value">{scenario.result.totalAP}</span>
						<span class="ap-label">AP</span>
					</div>
				</div>
				
				<div class="card-status">
					{#if scenario.result.reachedSoftCap}
						<div class="status-badge reached">
							<span class="status-icon">✅</span>
							Soft cap reached
						</div>
						{#if scenario.result.postSoftCapBonus > 0}
							<div class="bonus-info">
								+{scenario.result.postSoftCapBonus} post-cap AP
							</div>
						{/if}
					{:else}
						<div class="status-badge not-reached">
							<span class="status-icon">⏳</span>
							{config.softCapLevel - scenario.result.effectiveLevel} levels to cap
						</div>
						{#if scenario.result.levelsAheadOfNatural > 0}
							<div class="bonus-info">
								{scenario.result.levelsAheadOfNatural} levels ahead
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/each}
	</div>
	
	<!-- Key Insights -->
	<div class="insights-section">
		<h3 class="insights-title">Key Insights</h3>
		<div class="insights-grid">
			<div class="insight-card">
				<div class="insight-icon">🎯</div>
				<div class="insight-content">
					<h4 class="insight-title">Build Flexibility</h4>
					<p class="insight-text">
						Zero dex builds reach {config.softCapAP} AP naturally, while dex investment provides acceleration or post-cap scaling
					</p>
				</div>
			</div>
			
			<div class="insight-card">
				<div class="insight-icon">⚡</div>
				<div class="insight-content">
					<h4 class="insight-title">Early vs Late Investment</h4>
					<p class="insight-text">
						Early dex investment accelerates progression to soft cap, late investment enables transcendent power levels
					</p>
				</div>
			</div>
			
			<div class="insight-card">
				<div class="insight-icon">🔄</div>
				<div class="insight-content">
					<h4 class="insight-title">Ascension Synergy</h4>
					<p class="insight-text">
						Multiple ascensions make extreme dex investments more viable through accumulated stat bonuses
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.examples-section {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-left: 4px solid var(--color-success);
		border-radius: 12px;
		padding: 2rem;
		grid-column: 1 / -1;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-icon {
		font-size: 2rem;
	}

	.section-description {
		color: var(--text-secondary);
		margin: 0 0 2rem 0;
		font-size: 1rem;
		line-height: 1.5;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.example-card {
		background-color: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		transition: var(--transition-theme);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.example-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px var(--shadow-medium);
		border-color: var(--color-primary);
	}

	.card-header {
		text-align: center;
	}

	.card-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.card-description {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
		font-style: italic;
	}

	.card-stats {
		display: flex;
		justify-content: space-between;
		background-color: var(--bg-tertiary);
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		font-weight: 500;
	}

	.stat-value {
		font-size: 1rem;
		color: var(--text-primary);
		font-weight: 700;
	}

	.card-result {
		text-align: center;
		padding: 1rem;
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border-radius: 8px;
		border: 1px solid var(--color-primary);
	}

	.ap-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.ap-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-primary);
	}

	.ap-label {
		font-size: 1rem;
		color: var(--text-secondary);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.card-status {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.status-badge {
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.status-badge.reached {
		background-color: rgba(var(--color-success), 0.1);
		color: var(--color-success);
		border: 1px solid var(--color-success);
	}

	.status-badge.not-reached {
		background-color: rgba(var(--color-warning), 0.1);
		color: var(--color-warning);
		border: 1px solid var(--color-warning);
	}

	.status-icon {
		font-size: 1rem;
	}

	.bonus-info {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.insights-section {
		background-color: var(--bg-tertiary);
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--border-secondary);
		margin-top: 2rem;
	}

	.insights-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: var(--text-primary);
		text-align: center;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.insight-card {
		background-color: var(--bg-primary);
		padding: 1.25rem;
		border-radius: 8px;
		border: 1px solid var(--border-primary);
		display: flex;
		gap: 1rem;
		transition: var(--transition-theme);
	}

	.insight-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 8px var(--shadow-light);
	}

	.insight-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.insight-content {
		flex: 1;
	}

	.insight-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.insight-text {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.examples-grid {
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
			gap: 1rem;
		}

		.insights-grid {
			grid-template-columns: 1fr;
		}

		.insight-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.examples-section {
			padding: 1rem;
		}

		.example-card {
			padding: 1rem;
		}

		.section-title {
			font-size: 1.25rem;
			flex-direction: column;
			gap: 0.5rem;
		}

		.ap-value {
			font-size: 1.75rem;
		}
	}
</style>