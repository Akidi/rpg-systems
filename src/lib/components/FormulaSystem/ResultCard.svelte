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
		background: linear-gradient(135deg, #f8fafc, #f1f5f9);
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 8px 6px;
		text-align: center;
		transition: all 0.2s ease;
	}

	.result-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.result-name {
		font-size: 10px;
		font-weight: 500;
		color: #6b7280;
		margin-bottom: 2px;
		line-height: 1.2;
	}

	.result-value {
		font-size: 14px;
		font-weight: 700;
		color: #374151;
	}

	@media (prefers-color-scheme: dark) {
		.result-card {
			background: linear-gradient(135deg, #111827, #1f2937);
			border-color: #4b5563;
		}

		.result-name {
			color: #9ca3af;
		}

		.result-value {
			color: #f9fafb;
		}
	}
</style>