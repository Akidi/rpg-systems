<!-- src/lib/components/FormulaSystem/ResultCard.svelte -->
<script lang="ts">
	interface Props {
		name: string;
		value: string | number;
	}

	let { name, value }: Props = $props();
</script>

<div class="result-card">
	<div class="result-name">{name}</div>
	<div class="result-value">{value}</div>
</div>

<style>
	.result-card {
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 8px 6px;
		text-align: center;
		transition: var(--transition-theme);
		box-shadow: 0 1px 3px var(--shadow-light);
	}

	.result-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px var(--shadow-medium);
		border-color: var(--color-primary);
	}

	.result-name {
		font-size: 10px;
		font-weight: 500;
		color: var(--text-muted);
		margin-bottom: 2px;
		line-height: 1.2;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.result-value {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}
</style>
