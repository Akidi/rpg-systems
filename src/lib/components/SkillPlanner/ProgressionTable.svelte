<!-- $lib/components/SkillPlanner/ProgressionTable.svelte -->
<script lang="ts">
	import type { Skill, ProgressionStep } from '$lib/types/skill-planner';
	import { SkillCalculator } from '$lib/utils/skill-calculator';

	type Props = {
		skill: Skill;
		calculator: SkillCalculator;
	};

	let { skill = $bindable(), calculator }: Props = $props();

	let progression = $derived.by(() => calculator.generateProgression(skill));

	function formatValue(effectId: string, value: number, unit: string): string {
		const effect = skill.effects.find((e) => e.id === effectId);
		if (!effect) return `${value}${unit}`;

		if (effect.type === 'percentage' || effect.type === 'chance') {
			return `${value.toFixed(1)}${unit}`;
		}
		return `${Math.round(value)}${unit}`;
	}

	function formatIncrement(
		effectId: string,
		increment: number,
		unit: string,
		isRankComplete: boolean,
		totalValue: number
	): string {
		if (increment === 0) return '-';

		const effect = skill.effects.find((e) => e.id === effectId);
		if (!effect) return `+${increment}${unit}`;

		const sign = increment > 0 ? '+' : '';
		let incrementText = '';

		if (effect.type === 'percentage' || effect.type === 'chance') {
			incrementText = `${sign}${increment.toFixed(1)}${unit}`;
		} else {
			incrementText = `${sign}${Math.round(increment)}${unit}`;
		}

		// Add cumulative total for rank completions
		if (isRankComplete && increment !== 0) {
			const totalText =
				effect.type === 'percentage' || effect.type === 'chance'
					? `${totalValue.toFixed(1)}${unit}`
					: `${Math.round(totalValue)}${unit}`;
			incrementText += ` (Total: ${totalText})`;
		}

		return incrementText;
	}

	function getRankClass(step: ProgressionStep): string {
		if (step.pointsInCurrentRank === 0) return 'rank-complete';
		return 'rank-partial';
	}

	function getBinaryEffectsText(step: ProgressionStep): string {
		if (step.unlockedBinaries.length === 0) return '-';
		return step.unlockedBinaries.map((b) => b.name).join(', ');
	}

	function isNewBinaryUnlocked(step: ProgressionStep, prevStep: ProgressionStep | null): boolean {
		if (!prevStep) return step.unlockedBinaries.length > 0;
		return step.unlockedBinaries.length > prevStep.unlockedBinaries.length;
	}
</script>

<div class="progression-table">
	<h4>Complete Progression Table</h4>

	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Points</th>
					<th>Rank</th>
					<th>Progress</th>
					{#each skill.effects as effect}
						<th>
							{effect.name}
							<span class="unit">({effect.unit})</span>
						</th>
					{/each}
					{#if skill.binaryEffects.length > 0}
						<th>Unlocked Abilities</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each progression as step, index}
					{@const prevStep = index > 0 ? progression[index - 1] : null}
					<tr
						class={getRankClass(step)}
						class:new-binary={isNewBinaryUnlocked(step, prevStep)}
						class:tier-boundary={step.pointsInCurrentRank === 0 && step.rank > 0}
					>
						<td class="points-cell">{step.pointsSpent}</td>
						<td class="rank-cell">
							{#if step.pointsInCurrentRank === 0}
								<strong>{step.rank}</strong>
							{:else}
								<span class="rank-partial-text">
									{step.rank} + {step.pointsInCurrentRank}/{step.totalPointsForRank}
								</span>
							{/if}
						</td>
						<td class="progress-cell">
							{#if step.totalPointsForRank > 0}
								<div class="mini-progress">
									<div
										class="mini-progress-fill"
										style="width: {(step.pointsInCurrentRank / step.totalPointsForRank) * 100}%"
									></div>
								</div>
								<span class="progress-percent">
									{((step.pointsInCurrentRank / step.totalPointsForRank) * 100).toFixed(0)}%
								</span>
							{:else}
								<span class="complete-mark">✓</span>
							{/if}
						</td>

						{#each skill.effects as effect}
							<td class="effect-cell">
								<div class="effect-value">
									{formatValue(effect.id, step.effects[effect.id] || 0, effect.unit)}
								</div>
								{#if step.incrementFromPrevious[effect.id] !== 0}
									{@const isRankComplete = step.pointsInCurrentRank === 0 && step.rank > 0}
									<div
										class="effect-increment"
										class:positive={step.incrementFromPrevious[effect.id] > 0}
									>
										{formatIncrement(
											effect.id,
											step.incrementFromPrevious[effect.id] || 0,
											effect.unit,
											isRankComplete,
											step.effects[effect.id] || 0
										)}
									</div>
								{/if}
							</td>
						{/each}

						{#if skill.binaryEffects.length > 0}
							<td class="binary-cell" class:has-new-binary={isNewBinaryUnlocked(step, prevStep)}>
								{getBinaryEffectsText(step)}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.progression-table {
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 0;
		margin-bottom: 1.5rem;
		transition: var(--transition-theme);
		box-shadow: 0 8px 32px var(--shadow-light);
		overflow: hidden;
		position: relative;
	}

	.progression-table::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-secondary),
			var(--color-accent)
		);
		border-radius: 16px 16px 0 0;
	}

	.progression-table h4 {
		margin: 0;
		padding: 1.5rem 2rem;
		font-size: 1.5rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-inverse);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		position: relative;
		overflow: hidden;
	}

	.progression-table h4::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			45deg,
			transparent,
			transparent 20px,
			rgba(255, 255, 255, 0.05) 20px,
			rgba(255, 255, 255, 0.05) 40px
		);
		animation: tableHeaderShine 30s linear infinite;
	}

	@keyframes tableHeaderShine {
		0% {
			transform: translateX(-40px);
		}
		100% {
			transform: translateX(40px);
		}
	}

	.table-container {
		max-height: 60vh;
		overflow: auto;
		background: var(--bg-primary);
		position: relative;
	}

	.table-container::-webkit-scrollbar {
		width: 12px;
		height: 12px;
	}

	.table-container::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: 6px;
	}

	.table-container::-webkit-scrollbar-thumb {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		border-radius: 6px;
		border: 2px solid var(--bg-primary);
	}

	.table-container::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
	}

	.table-container::-webkit-scrollbar-corner {
		background: var(--bg-tertiary);
	}

	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.85rem;
		position: relative;
	}

	thead {
		position: sticky;
		top: 0;
		z-index: 50;
	}

	th {
		padding: 1rem 0.75rem;
		text-align: left;
		font-weight: 800;
		font-size: 0.8rem;
		color: var(--text-inverse);
		background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-bottom: 2px solid var(--color-primary);
		position: relative;
		overflow: hidden;
	}

	th::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			90deg,
			transparent,
			transparent 10px,
			rgba(255, 255, 255, 0.05) 10px,
			rgba(255, 255, 255, 0.05) 20px
		);
	}

	th:first-child {
		border-radius: 0;
	}

	th:last-child {
		border-radius: 0;
	}

	.unit {
		font-weight: 400;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.7rem;
		display: block;
		margin-top: 0.25rem;
	}

	tbody tr {
		border-bottom: 1px solid var(--border-primary);
		transition: var(--transition-theme);
		position: relative;
	}

	tbody tr:hover {
		background: linear-gradient(
			90deg,
			var(--bg-tertiary) 0%,
			var(--bg-secondary) 50%,
			var(--bg-tertiary) 100%
		);
		box-shadow: 0 2px 8px var(--shadow-light);
	}

	.rank-complete {
		background: linear-gradient(
			90deg,
			rgba(var(--color-success), 0.15) 0%,
			rgba(var(--color-success), 0.05) 100%
		) !important;
		border-left: 4px solid var(--color-success);
		position: relative;
	}

	.rank-complete::before {
		content: '✓';
		position: absolute;
		left: -2px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-success);
		font-weight: 900;
		font-size: 1.2rem;
		text-shadow: 0 0 4px var(--color-success);
	}

	.rank-complete:hover {
		background: linear-gradient(
			90deg,
			rgba(var(--color-success), 0.25) 0%,
			rgba(var(--color-success), 0.1) 100%
		) !important;
	}

	.tier-boundary {
		border-top: 3px solid var(--color-primary);
		position: relative;
	}

	.tier-boundary::after {
		content: '';
		position: absolute;
		top: -3px;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
		box-shadow: 0 0 8px var(--color-primary);
	}

	.new-binary {
		background: linear-gradient(
			90deg,
			rgba(var(--color-warning), 0.2) 0%,
			rgba(var(--color-warning), 0.05) 100%
		) !important;
		border-left: 4px solid var(--color-warning);
		position: relative;
	}

	.new-binary::before {
		content: '⚡';
		position: absolute;
		left: -2px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-warning);
		font-size: 1.1rem;
		text-shadow: 0 0 4px var(--color-warning);
	}

	.new-binary:hover {
		background: linear-gradient(
			90deg,
			rgba(var(--color-warning), 0.3) 0%,
			rgba(var(--color-warning), 0.1) 100%
		) !important;
	}

	td {
		padding: 0.875rem 0.75rem;
		vertical-align: middle;
		color: var(--text-primary);
		border-bottom: 1px solid var(--border-primary);
	}

	.points-cell {
		font-family: 'Courier New', monospace;
		font-weight: 900;
		font-size: 1rem;
		color: var(--color-primary);
		text-align: center;
		min-width: 70px;
		background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
		position: relative;
	}

	.rank-cell {
		min-width: 100px;
		text-align: center;
		font-weight: 700;
		background: var(--bg-tertiary);
	}

	.rank-partial-text {
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 500;
	}

	.progress-cell {
		min-width: 120px;
		text-align: center;
		padding: 0.5rem;
	}

	.mini-progress {
		width: 80px;
		height: 8px;
		background: var(--bg-tertiary);
		border: 2px solid var(--border-secondary);
		border-radius: 6px;
		overflow: hidden;
		margin: 0 auto 0.5rem;
		position: relative;
		box-shadow: inset 0 2px 4px var(--shadow-light);
	}

	.mini-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-success));
		border-radius: 4px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		box-shadow: 0 0 8px rgba(var(--color-primary), 0.4);
	}

	.mini-progress-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			45deg,
			transparent 25%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 75%
		);
		background-size: 12px 12px;
		animation: miniProgressShine 2s linear infinite;
	}

	@keyframes miniProgressShine {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.progress-percent {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.complete-mark {
		color: var(--color-success);
		font-weight: 900;
		font-size: 1.5rem;
		text-shadow: 0 0 4px var(--color-success);
		animation: completePulse 2s ease-in-out infinite;
	}

	@keyframes completePulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
	}

	.effect-cell {
		text-align: center;
		min-width: 120px;
		background: var(--bg-tertiary);
		position: relative;
	}

	.effect-value {
		font-family: 'Courier New', monospace;
		font-weight: 900;
		font-size: 1.1rem;
		color: var(--color-primary);
		text-shadow: 0 1px 2px var(--shadow-light);
	}

	.effect-increment {
		font-size: 0.7rem;
		font-weight: 700;
		margin-top: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		display: inline-block;
	}

	.effect-increment.positive {
		color: var(--color-success);
		background: rgba(var(--color-success), 0.1);
		border: 1px solid var(--color-success);
	}

	.binary-cell {
		max-width: 200px;
		font-size: 0.8rem;
		line-height: 1.4;
		padding: 1rem 0.75rem;
	}

	.has-new-binary {
		font-weight: 700;
		color: var(--color-warning);
		background: rgba(var(--color-warning), 0.1);
		border-radius: 4px;
		padding: 0.5rem;
		border: 1px solid var(--color-warning);
	}

	/* Empty state */
	.table-container:empty::before {
		content: 'No progression data available. Configure your skill to see the complete progression table.';
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: var(--text-muted);
		font-style: italic;
		background: var(--bg-tertiary);
		margin: 1rem;
		border-radius: 8px;
		border: 2px dashed var(--border-secondary);
	}

	/* Mobile responsive */
	@media (max-width: 1024px) {
		.table-container {
			max-height: 50vh;
		}

		th,
		td {
			padding: 0.75rem 0.5rem;
		}

		.progression-table h4 {
			padding: 1.25rem 1.5rem;
			font-size: 1.25rem;
		}
	}

	@media (max-width: 768px) {
		.table-container {
			font-size: 0.8rem;
			max-height: 40vh;
		}

		th,
		td {
			padding: 0.625rem 0.375rem;
		}

		.unit {
			display: inline;
			margin-left: 0.25rem;
		}

		.mini-progress {
			width: 60px;
			height: 6px;
		}

		.effect-value {
			font-size: 1rem;
		}

		.points-cell {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 640px) {
		.progression-table h4 {
			padding: 1rem;
			font-size: 1.125rem;
		}

		.binary-cell {
			max-width: 150px;
			font-size: 0.75rem;
		}

		.effect-increment {
			font-size: 0.65rem;
			padding: 0.2rem 0.4rem;
		}
	}
</style>
