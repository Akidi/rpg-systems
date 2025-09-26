<script lang="ts">
	type TelegraphEntry = {
		id: string;
		text: string;
	};

	type Props = {
		turnCount: number;
		currentCharacterName: string;
		globalActionCount: number;
		telegraphEntries?: TelegraphEntry[];
	};

	let {
		turnCount,
		currentCharacterName,
		globalActionCount,
		telegraphEntries = []
	}: Props = $props();
</script>

<div class="battle-header">
	<h1 class="battle-title">Combat Simulator</h1>
	<div class="battle-turn-meta">
		<span>Turn {turnCount}</span>
		<span class="separator" aria-hidden="true"></span>
		<span class="current-turn">{currentCharacterName}'s Turn</span>
		<span class="separator" aria-hidden="true"></span>
		<span class="global-actions">Global Actions: {globalActionCount}</span>
	</div>
	{#if telegraphEntries.length > 0}
		<div class="telegraph-row">
			{#each telegraphEntries as entry (entry.id)}
				<span class="telegraph-pill">{entry.text}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.battle-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.battle-title {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
		text-shadow: 0 4px 20px var(--shadow-medium);
	}

	.battle-turn-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.battle-turn-meta .current-turn {
		color: var(--color-warning);
		font-weight: 600;
	}

	.battle-turn-meta .global-actions {
		color: var(--color-info);
		font-weight: 500;
	}

	.battle-turn-meta .separator::before {
		content: '•';
		color: var(--text-muted);
	}

	.telegraph-row {
		margin-top: 0.75rem;
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.telegraph-pill {
		background: color-mix(in srgb, var(--color-warning) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-warning) 35%, transparent);
		color: var(--color-warning);
		font-size: 0.85rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		box-shadow: 0 4px 12px var(--shadow-light);
	}
</style>
