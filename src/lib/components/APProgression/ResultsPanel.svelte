<!-- src/lib/components/APProgression/ResultsPanel.svelte -->
<script lang="ts">
	import type { APResult, Character, APConfig, ScalingFormula } from '$lib/types/apProgression.js';

	interface Props {
		result: APResult;
		character: Character;
		config: APConfig;
		selectedFormula: ScalingFormula;
	}

	let { result, character, config, selectedFormula }: Props = $props();

	// Get next post-soft-cap cost for display
	function getNextPostSoftCapCost(): number {
		const dexForSoftCap = Math.max(0, (config.softCapLevel - character.level) * config.dexPerAP);
		const excessDex = Math.max(0, character.dexterity - dexForSoftCap);

		let currentCost = config.postSoftCapDexBase;
		let usedDex = 0;

		while (usedDex + currentCost <= excessDex) {
			usedDex += currentCost;
			currentCost = Math.floor(currentCost * config.postSoftCapDexMultiplier);
		}

		return dexForSoftCap + usedDex + currentCost;
	}
</script>

<div class="results-panel">
	<h2 class="panel-title">
		<span class="panel-icon">📊</span>
		Current Character AP
	</h2>

	<div class="ap-display">
		<div class="ap-total">{result.totalAP} AP</div>
		<div class="ap-formula">{result.formula}</div>
	</div>

	{#if selectedFormula.type === 'universal'}
		<!-- Universal System Status -->
		<div class="status-indicator {result.reachedSoftCap ? 'reached' : 'not-reached'}">
			{#if result.reachedSoftCap}
				<span class="status-icon">✅</span>
				Soft cap reached! (Acting like level {result.effectiveLevel})
			{:else}
				<span class="status-icon">⏳</span>
				{config.softCapLevel - result.effectiveLevel} effective levels to soft cap
			{/if}
		</div>

		<div class="ap-breakdown">
			<h3 class="breakdown-title">AP Breakdown</h3>
			<div class="breakdown-grid">
				<div class="breakdown-item base">
					<span class="breakdown-label">Base AP</span>
					<span class="breakdown-value">{result.baseAP}</span>
				</div>
				<div class="breakdown-item natural">
					<span class="breakdown-label">Natural Level Bonus</span>
					<span class="breakdown-value">+{result.naturalLevelBonus}</span>
				</div>
				<div class="breakdown-item acceleration">
					<span class="breakdown-label">Dex Acceleration</span>
					<span class="breakdown-value">+{result.dexAcceleration}</span>
				</div>
				<div class="breakdown-item post-cap">
					<span class="breakdown-label">Post-Soft-Cap Bonus</span>
					<span class="breakdown-value">+{result.postSoftCapBonus}</span>
				</div>
				<div class="breakdown-item ascension">
					<span class="breakdown-label">Ascension Bonus</span>
					<span class="breakdown-value">+{result.ascensionBonus}</span>
				</div>
			</div>
		</div>

		<!-- Dex Efficiency Information -->
		<div class="efficiency-info">
			<h4 class="efficiency-title">Dexterity Investment Analysis</h4>
			{#if character.level >= config.softCapLevel}
				<div class="efficiency-section post-cap">
					<div class="efficiency-label">Post-Soft-Cap Progression:</div>
					<div class="efficiency-details">
						<div>
							Next AP costs: <strong>{getNextPostSoftCapCost().toLocaleString()}</strong> total dex
						</div>
						<div>Each additional AP becomes exponentially more expensive</div>
						<div class="cost-warning">⚠️ Extreme investment required for further gains</div>
					</div>
				</div>
			{:else}
				<div class="efficiency-section pre-cap">
					<div class="efficiency-label">Acceleration Status:</div>
					<div class="efficiency-details">
						<div>
							Acting like level <strong>{result.effectiveLevel}</strong>
							({result.levelsAheadOfNatural} levels ahead)
						</div>
						<div>
							Dex needed for early soft cap: <strong
								>{Math.max(
									0,
									(config.softCapLevel - character.level) * config.dexPerAP - character.dexterity
								).toLocaleString()}</strong
							> more
						</div>
						{#if result.levelsAheadOfNatural > 0}
							<div class="acceleration-benefit">
								🚀 Dex investment paying off - ahead of natural progression!
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Legacy System Breakdown -->
		<div class="ap-breakdown">
			<h3 class="breakdown-title">AP Breakdown</h3>
			<div class="breakdown-grid">
				<div class="breakdown-item base">
					<span class="breakdown-label">Base AP</span>
					<span class="breakdown-value">{result.baseAP}</span>
				</div>
				<div class="breakdown-item natural">
					<span class="breakdown-label">Level Bonus</span>
					<span class="breakdown-value">+{result.naturalLevelBonus}</span>
				</div>
				<div class="breakdown-item acceleration">
					<span class="breakdown-label">Dex Bonus</span>
					<span class="breakdown-value">+{result.dexAcceleration}</span>
				</div>
				<div class="breakdown-item ascension">
					<span class="breakdown-label">Ascension Bonus</span>
					<span class="breakdown-value">+{result.ascensionBonus}</span>
				</div>
			</div>
		</div>

		<!-- Legacy system efficiency info -->
		<div class="efficiency-info">
			<h4 class="efficiency-title">Legacy System Analysis</h4>
			<div class="efficiency-section">
				<div class="efficiency-details">
					<div>
						Dex efficiency: <strong
							>{((result.dexAcceleration / Math.max(1, character.dexterity)) * 100).toFixed(
								2
							)}%</strong
						> AP per dex point
					</div>
					<div>
						Next AP cost: <strong
							>{config.dexPerAP *
								(character.dexterity >= config.dexDiminishingThreshold
									? config.dexDiminishingRatio
									: 1)}</strong
						> dex
					</div>
					{#if character.dexterity >= config.dexDiminishingThreshold}
						<div class="diminishing-warning">
							⚠️ Diminishing returns active - {config.dexDiminishingRatio}x cost
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Power Level Assessment -->
	<div class="power-assessment">
		<h4 class="assessment-title">Power Level Assessment</h4>
		<div class="power-level">
			{#if result.totalAP <= 5}
				<span class="power-badge novice">Novice</span>
				<span class="power-description">Just starting the journey</span>
			{:else if result.totalAP <= 8}
				<span class="power-badge competent">Competent</span>
				<span class="power-description">Solid tactical options</span>
			{:else if result.totalAP <= 12}
				<span class="power-badge advanced">Advanced</span>
				<span class="power-description">High-level tactical control</span>
			{:else if result.totalAP <= 16}
				<span class="power-badge elite">Elite</span>
				<span class="power-description">Exceptional combat prowess</span>
			{:else}
				<span class="power-badge legendary">Legendary</span>
				<span class="power-description">Transcendent power levels</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.results-panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-left: 4px solid var(--color-accent);
		border-radius: 8px;
		padding: 1.5rem;
		transition: var(--transition-theme);
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-icon {
		font-size: 1.5rem;
	}

	.ap-display {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary));
		border-radius: 12px;
		border: 2px solid var(--color-primary);
	}

	.ap-total {
		font-size: 3rem;
		font-weight: 800;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
		text-shadow: 0 2px 4px var(--shadow-medium);
	}

	.ap-formula {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-family: 'Monaco', 'Consolas', monospace;
	}

	.status-indicator {
		padding: 1rem;
		border-radius: 8px;
		margin: 1.5rem 0;
		font-weight: 600;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.status-indicator.reached {
		background-color: var(--bg-tertiary);
		color: var(--color-success);
		border: 2px solid var(--color-success);
	}

	.status-indicator.not-reached {
		background-color: var(--bg-tertiary);
		color: var(--color-warning);
		border: 2px solid var(--color-warning);
	}

	.status-icon {
		font-size: 1.25rem;
	}

	.breakdown-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
	}

	.breakdown-grid {
		display: grid;
		gap: 0.75rem;
	}

	.breakdown-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.breakdown-item.base {
		background-color: var(--bg-primary);
	}

	.breakdown-item.natural {
		background-color: rgba(var(--color-info), 0.1);
		border-color: var(--color-info);
	}

	.breakdown-item.acceleration {
		background-color: rgba(var(--color-warning), 0.1);
		border-color: var(--color-warning);
	}

	.breakdown-item.post-cap {
		background-color: rgba(var(--color-accent), 0.1);
		border-color: var(--color-accent);
	}

	.breakdown-item.ascension {
		background-color: rgba(var(--color-success), 0.1);
		border-color: var(--color-success);
	}

	.breakdown-label {
		font-weight: 500;
		color: var(--text-primary);
	}

	.breakdown-value {
		font-weight: 700;
		color: var(--color-primary);
		font-size: 1.125rem;
	}

	.efficiency-info {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		margin: 1.5rem 0;
	}

	.efficiency-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
	}

	.efficiency-section {
		margin-bottom: 1rem;
	}

	.efficiency-section:last-child {
		margin-bottom: 0;
	}

	.efficiency-label {
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.efficiency-details {
		font-size: 0.875rem;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.efficiency-details > div {
		margin-bottom: 0.25rem;
	}

	.cost-warning,
	.diminishing-warning {
		color: var(--color-warning);
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.acceleration-benefit {
		color: var(--color-success);
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.power-assessment {
		background: linear-gradient(135deg, var(--bg-primary), var(--bg-tertiary));
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-accent);
		margin-top: 1.5rem;
	}

	.assessment-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
		text-align: center;
	}

	.power-level {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.power-badge {
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 700;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		align-self: center;
	}

	.power-badge.novice {
		background-color: var(--color-secondary);
		color: var(--text-inverse);
	}

	.power-badge.competent {
		background-color: var(--color-info);
		color: var(--text-inverse);
	}

	.power-badge.advanced {
		background-color: var(--color-success);
		color: var(--text-inverse);
	}

	.power-badge.elite {
		background-color: var(--color-warning);
		color: var(--text-primary);
	}

	.power-badge.legendary {
		background-color: var(--color-accent);
		color: var(--text-inverse);
		box-shadow: 0 0 15px rgba(var(--color-accent), 0.5);
	}

	.power-description {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.ap-total {
			font-size: 2.5rem;
		}

		.status-indicator {
			flex-direction: column;
			gap: 0.25rem;
		}

		.breakdown-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>
