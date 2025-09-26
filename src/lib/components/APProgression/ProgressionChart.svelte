<!-- src/lib/components/APProgression/ProgressionChart.svelte -->
<script lang="ts">
	import type {
		APConfig,
		Character,
		ScalingFormula,
		ProgressionPoint
	} from '$lib/types/apProgression';

	interface Props {
		progressionData: ProgressionPoint[];
		selectedFormula: ScalingFormula;
		character: Character;
		config: APConfig;
		chartMaxLevel: number;
	}

	let { progressionData, selectedFormula, character, config, chartMaxLevel }: Props = $props();

	// Format numbers for display
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	// Calculate chart dimensions and scales
	const maxAP = $derived(Math.max(...progressionData.map((d) => d.ap)));
	const minAP = $derived(Math.min(...progressionData.map((d) => d.ap)));

	// Sample data points for table (every ~20th point)
	const sampleData = $derived(
		progressionData.filter((_, i) => i % Math.max(1, Math.floor(progressionData.length / 20)) === 0)
	);

	// Calculate growth rates
	function getGrowthRate(
		currentPoint: ProgressionPoint,
		prevPoint: ProgressionPoint | null
	): string {
		if (!prevPoint) return '-';
		const growthRate = ((currentPoint.ap - prevPoint.ap) / prevPoint.ap) * 100;
		return growthRate > 0 ? `+${growthRate.toFixed(1)}%` : '-';
	}
</script>

<div class="chart-container">
	<div class="chart-header">
		<h3 class="chart-title">
			{selectedFormula.name} Scaling (Levels 1-{formatNumber(chartMaxLevel)})
		</h3>
		<p class="chart-subtitle">
			Dex: {character.dexterity} | Ascensions: {character.ascensions}
		</p>
		{#if selectedFormula.type === 'universal'}
			<div class="universal-note">
				<strong>Universal System:</strong> All characters reach {config.softCapAP} AP naturally at level
				{config.softCapLevel}
			</div>
		{/if}
	</div>

	<div class="chart-visualization">
		<div class="chart-y-axis">
			{#each [0, 25, 50, 75, 100] as percentage}
				{@const value = Math.round((maxAP * percentage) / 100)}
				<div class="y-label" style="bottom: {percentage}%">{value}</div>
			{/each}
		</div>

		<div class="chart-area">
			{#each progressionData as point, index}
				{@const height = (point.ap / maxAP) * 100}
				{@const left = (index / (progressionData.length - 1)) * 100}

				<div
					class="chart-point"
					style="left: {left}%; bottom: {height}%"
					title="Level {point.level}: {point.ap} AP"
					role="button"
					tabindex="0"
				></div>
			{/each}

			<!-- Chart line -->
			<svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
				<polyline
					fill="none"
					stroke="var(--color-primary)"
					stroke-width="0.5"
					points={progressionData
						.map((point, index) => {
							const x = (index / (progressionData.length - 1)) * 100;
							const y = 100 - (point.ap / maxAP) * 100;
							return `${x},${y}`;
						})
						.join(' ')}
				/>
			</svg>

			<!-- Soft cap indicator line for universal system -->
			{#if selectedFormula.type === 'universal' && chartMaxLevel >= config.softCapLevel}
				{@const softCapX = ((config.softCapLevel - 1) / (chartMaxLevel - 1)) * 100}
				<div
					class="soft-cap-line"
					style="left: {softCapX}%"
					title="Soft cap reached at level {config.softCapLevel}"
				></div>
			{/if}
		</div>

		<div class="chart-x-axis">
			{#each [0, 25, 50, 75, 100] as percentage}
				{@const level = Math.round((chartMaxLevel * percentage) / 100)}
				<div class="x-label" style="left: {percentage}%">{formatNumber(level)}</div>
			{/each}
		</div>
	</div>

	<!-- Chart Legend -->
	<div class="chart-legend">
		<div class="legend-item">
			<div class="legend-color" style="background-color: var(--color-primary)"></div>
			<span class="legend-label">AP Progression</span>
		</div>
		{#if selectedFormula.type === 'universal'}
			<div class="legend-item">
				<div class="legend-color soft-cap" style="background-color: var(--color-warning)"></div>
				<span class="legend-label">Soft Cap Level</span>
			</div>
		{/if}
	</div>
</div>

<!-- Data Table -->
<div class="data-table-container">
	<h3 class="table-title">Sample Data Points</h3>
	<div class="data-table">
		<div class="table-header">
			<div class="table-cell">Level</div>
			<div class="table-cell">Total AP</div>
			{#if selectedFormula.type === 'universal'}
				<div class="table-cell">Natural + Accel</div>
				<div class="table-cell">Post-Cap</div>
			{:else}
				<div class="table-cell">Level Bonus</div>
				<div class="table-cell">Growth Rate</div>
			{/if}
		</div>
		{#each sampleData as point, index}
			{@const prevPoint = index > 0 ? sampleData[index - 1] : null}
			<div class="table-row">
				<div class="table-cell">{formatNumber(point.level)}</div>
				<div class="ap-value table-cell">{point.ap}</div>
				{#if selectedFormula.type === 'universal'}
					<div class="table-cell">
						+{point.breakdown.naturalLevelBonus + point.breakdown.dexAcceleration}
					</div>
					<div class="table-cell">+{point.breakdown.postSoftCapBonus}</div>
				{:else}
					<div class="table-cell">+{point.breakdown.naturalLevelBonus}</div>
					<div class="table-cell">{getGrowthRate(point, prevPoint)}</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.chart-container {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.chart-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.chart-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.chart-subtitle {
		color: var(--text-muted);
		margin: 0;
		font-size: 0.875rem;
	}

	.universal-note {
		background-color: var(--bg-tertiary);
		border: 2px solid var(--color-info);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.875rem;
		margin-top: 1rem;
		display: inline-block;
	}

	.chart-visualization {
		position: relative;
		height: 400px;
		margin: 0 60px 60px 80px;
		border-left: 2px solid var(--border-primary);
		border-bottom: 2px solid var(--border-primary);
		background-color: var(--bg-primary);
		border-radius: 4px;
	}

	.chart-y-axis {
		position: absolute;
		left: -70px;
		top: 0;
		bottom: 0;
		width: 60px;
	}

	.y-label {
		position: absolute;
		right: 8px;
		font-size: 0.75rem;
		color: var(--text-muted);
		transform: translateY(50%);
		font-weight: 500;
	}

	.chart-x-axis {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -40px;
		height: 30px;
	}

	.x-label {
		position: absolute;
		font-size: 0.75rem;
		color: var(--text-muted);
		transform: translateX(-50%);
		font-weight: 500;
	}

	.chart-area {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.chart-line {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.chart-point {
		position: absolute;
		width: 6px;
		height: 6px;
		background-color: var(--color-primary);
		border: 2px solid var(--bg-primary);
		border-radius: 50%;
		transform: translate(-50%, 50%);
		cursor: pointer;
		z-index: 2;
		transition: var(--transition-theme);
	}

	.chart-point:hover {
		background-color: var(--color-accent);
		transform: translate(-50%, 50%) scale(1.5);
		box-shadow: 0 0 8px rgba(var(--color-primary), 0.5);
	}

	.soft-cap-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		background-color: var(--color-warning);
		opacity: 0.8;
		pointer-events: none;
		z-index: 1;
		border-radius: 2px;
	}

	.soft-cap-line::before {
		content: 'Soft Cap';
		position: absolute;
		top: -25px;
		left: 6px;
		font-size: 0.6875rem;
		color: var(--color-warning);
		font-weight: 700;
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.chart-legend {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-top: 1rem;
		padding: 1rem;
		background-color: var(--bg-tertiary);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		border: 1px solid var(--border-primary);
	}

	.legend-color.soft-cap {
		width: 3px;
		height: 16px;
		border-radius: 2px;
	}

	.legend-label {
		font-size: 0.875rem;
		color: var(--text-primary);
		font-weight: 500;
	}

	.data-table-container {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 2rem;
	}

	.table-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
		text-align: center;
	}

	.data-table {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 1px;
		background-color: var(--border-primary);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px var(--shadow-light);
	}

	.table-header {
		display: contents;
	}

	.table-header .table-cell {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		padding: 1rem 0.75rem;
		font-weight: 700;
		font-size: 0.875rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.table-row {
		display: contents;
	}

	.table-row:nth-child(even) .table-cell {
		background-color: var(--bg-tertiary);
	}

	.table-row:nth-child(odd) .table-cell {
		background-color: var(--bg-primary);
	}

	.table-cell {
		padding: 0.75rem;
		font-size: 0.875rem;
		color: var(--text-primary);
		text-align: center;
		transition: var(--transition-theme);
	}

	.ap-value {
		font-weight: 700;
		color: var(--color-primary);
		font-size: 1rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.chart-visualization {
			height: 300px;
			margin: 0 40px 40px 60px;
		}

		.chart-y-axis {
			left: -50px;
			width: 40px;
		}

		.chart-title {
			font-size: 1.25rem;
		}

		.chart-legend {
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}

		.data-table {
			grid-template-columns: 1fr 1fr;
			gap: 2px;
		}

		.table-header .table-cell:nth-child(n + 3),
		.table-row .table-cell:nth-child(n + 3) {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.chart-visualization {
			height: 250px;
			margin: 0 20px 30px 40px;
		}

		.chart-y-axis {
			left: -30px;
			width: 25px;
		}

		.y-label {
			font-size: 0.6875rem;
		}

		.x-label {
			font-size: 0.6875rem;
		}

		.chart-title {
			font-size: 1.125rem;
		}

		.data-table {
			grid-template-columns: 1fr;
		}

		.table-header .table-cell:nth-child(n + 2),
		.table-row .table-cell:nth-child(n + 2) {
			display: none;
		}
	}
</style>
