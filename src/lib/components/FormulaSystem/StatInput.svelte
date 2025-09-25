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
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 8px 10px;
		transition: var(--transition-theme);
	}

	.stat-group-compact:hover {
		border-color: var(--color-primary);
		box-shadow: 0 1px 3px var(--shadow-light);
	}

	.stat-label-compact {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		min-width: 28px;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.stat-input-compact {
		flex: 1;
		padding: 4px 6px;
		border: none;
		background: transparent;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.stat-input-compact:focus {
		outline: none;
		background-color: var(--bg-primary);
		border-radius: 4px;
		box-shadow: 0 0 0 2px rgba(var(--color-primary), 0.2);
	}

	.stat-input-compact::-webkit-outer-spin-button,
	.stat-input-compact::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.stat-input-compact[type=number] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>