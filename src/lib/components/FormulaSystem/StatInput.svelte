<!-- src/lib/components/FormulaSystem/StatInput.svelte -->
<script lang="ts">
	import type { CharacterStats } from '$lib/types/formulaPlanner.js';

	interface Props {
		statName: keyof CharacterStats;
		value: number;
		min: number;
		max: number;
		label: string;
		onStatUpdate: (statName: keyof CharacterStats, value: number) => void;
	}

	let { statName, value, min, max, label, onStatUpdate }: Props = $props();
</script>

<div class="stat-group-compact">
	<label for="{statName}-input" class="stat-label-compact">{label}</label>
	<input
		id="{statName}-input"
		type="number"
		{value}
		oninput={(e) => onStatUpdate(statName, parseInt((e.target as HTMLInputElement).value) || min)}
		{min}
		{max}
		class="stat-input-compact"
		aria-label="{label} stat"
	/>
</div>

<style>
	.stat-group-compact {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 8px 10px;
	}

	.stat-label-compact {
		font-size: 12px;
		font-weight: 600;
		color: #4b5563;
		min-width: 28px;
		text-align: center;
	}

	.stat-input-compact {
		flex: 1;
		padding: 4px 6px;
		border: none;
		background: transparent;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		color: #374151;
	}

	.stat-input-compact:focus {
		outline: none;
		background: white;
		border-radius: 4px;
	}

	@media (prefers-color-scheme: dark) {
		.stat-group-compact {
			background: #111827;
			border-color: #4b5563;
		}

		.stat-label-compact {
			color: #d1d5db;
		}

		.stat-input-compact {
			color: #f9fafb;
		}

		.stat-input-compact:focus {
			background: #374151;
		}
	}
</style>