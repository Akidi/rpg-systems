<script lang="ts">
	import type { Enhancement } from '$lib/types/enhancement';

	interface Props {
		availableEnhancements: Enhancement[];
		enhancements: Enhancement[];
		enemyCount: number;
		addEnhancement: (enhancement: Enhancement) => void;
	}

	let { availableEnhancements, enhancements, enemyCount, addEnhancement }: Props = $props();

	// Filter available enhancements based on conditions
	let filteredEnhancements = $derived<Enhancement[]>(
		availableEnhancements.filter((enhancement) => {
			if (enhancement.name === 'Multi-Target') {
				return enemyCount >= 2 && !enhancements.some((e) => e.name === 'Multi-Target');
			}
			return true;
		})
	);
</script>

<div class="card">
	<h2 class="card-title">Available Enhancements</h2>
	<div class="enhancement-list">
		{#each filteredEnhancements as enhancement}
			<button onclick={() => addEnhancement(enhancement)} class="enhancement-item">
				<div class="enhancement-name">{enhancement.name}</div>
				<div class="enhancement-effect">{enhancement.effect}</div>
				<div class="enhancement-description">{enhancement.description}</div>
				{#if !enhancement.stackable}
					<div class="enhancement-note">One-time enhancement</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.enhancement-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 400px;
		overflow-y: auto;
	}

	.enhancement-item {
		width: 100%;
		text-align: left;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		padding: 12px;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.enhancement-item:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	.enhancement-name {
		font-weight: 600;
		margin-bottom: 4px;
	}

	.enhancement-effect {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 4px;
		transition: var(--transition-theme);
	}

	.enhancement-item:hover .enhancement-effect {
		color: var(--text-inverse);
	}

	.enhancement-description {
		font-size: 12px;
		color: var(--text-muted);
		transition: var(--transition-theme);
	}

	.enhancement-item:hover .enhancement-description {
		color: var(--text-inverse);
	}

	.enhancement-note {
		font-size: 12px;
		color: var(--color-info);
		margin-top: 4px;
		transition: var(--transition-theme);
	}

	.enhancement-item:hover .enhancement-note {
		color: var(--text-inverse);
	}
</style>
