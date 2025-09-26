<script lang="ts">
	export let logs: string[] = [];
</script>

<div class="combat-log">
	<h3 class="log-title">Combat Log</h3>
	<div class="log-entries">
		{#if logs.length === 0}
			<div class="log-empty">The battlefield awaits your command...</div>
		{:else}
			{#each logs as log, idx (idx)}
				<div class="log-line">{log}</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.combat-log {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 1rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		box-shadow: 0 8px 24px var(--shadow-light);
		min-height: 100%;
	}

	.log-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.log-entries {
		height: 16rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 0.8rem;
		color: var(--text-primary);
		padding-right: 0.25rem;
	}

	.log-empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.log-line {
		color: var(--text-secondary);
		padding: 0.25rem 0.35rem;
		border-left: 2px solid color-mix(in oklab, var(--color-primary) 55%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 85%, var(--color-primary) 15%);
		border-radius: 0.35rem;
	}

	.log-entries::-webkit-scrollbar {
		width: 0.35rem;
	}

	.log-entries::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: 1rem;
	}

	.log-entries::-webkit-scrollbar-thumb {
		background: color-mix(in oklab, var(--border-secondary) 75%, var(--color-primary) 25%);
		border-radius: 1rem;
	}

	.log-entries::-webkit-scrollbar-thumb:hover {
		background: color-mix(in oklab, var(--border-secondary) 60%, var(--color-primary) 40%);
	}
</style>
