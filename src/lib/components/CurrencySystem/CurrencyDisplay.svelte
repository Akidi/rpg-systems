<!-- src/lib/components/CurrencySystem/CurrencyDisplay.svelte -->
<script lang="ts">
	import type { CurrencyBreakdown } from '$lib/types/currency.js';
	import CoinIcon from './CoinIcon.svelte';

	interface Props {
		title: string;
		breakdown: CurrencyBreakdown;
		totalCopper: number;
		variant?: 'default' | 'optimized';
	}

	let { title, breakdown, totalCopper, variant = 'default' }: Props = $props();

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}
</script>

<div class="currency-display" class:optimized={variant === 'optimized'}>
	<div class="label">{title}:</div>
	{#if variant === 'default'}
		<div class="amount">
			<CoinIcon currency="copper" size={18} />
			<span class="gold-text">{formatNumber(totalCopper)} Copper</span>
		</div>
	{:else}
		<div class="breakdown-list">
			{#if breakdown.platinum > 0}
				<div class="breakdown-item">
					<CoinIcon currency="platinum" size={16} />
					<span>{breakdown.platinum} Platinum</span>
				</div>
			{/if}
			{#if breakdown.gold > 0}
				<div class="breakdown-item">
					<CoinIcon currency="gold" size={16} />
					<span>{breakdown.gold} Gold</span>
				</div>
			{/if}
			{#if breakdown.silver > 0}
				<div class="breakdown-item">
					<CoinIcon currency="silver" size={16} />
					<span>{breakdown.silver} Silver</span>
				</div>
			{/if}
			{#if breakdown.copper > 0}
				<div class="breakdown-item">
					<CoinIcon currency="copper" size={16} />
					<span>{breakdown.copper} Copper</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.currency-display {
		padding: 12px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		margin-bottom: 12px;
		transition: var(--transition-theme);
	}

	.currency-display.optimized {
		background-color: var(--bg-secondary);
		border-color: var(--color-success);
		box-shadow: 0 0 0 1px rgba(var(--color-success), 0.2);
	}

	.label {
		font-weight: 600;
		margin-bottom: 8px;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.amount {
		font-size: 18px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.breakdown-list {
		font-size: 14px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.breakdown-item span {
		font-weight: 500;
	}
</style>