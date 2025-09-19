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
			{formatNumber(totalCopper)} Copper
		</div>
	{:else}
		<div class="breakdown-list">
			{#if breakdown.platinum > 0}
				<div class="breakdown-item">
					<CoinIcon currency="platinum" size={16} />
					{breakdown.platinum} Platinum
				</div>
			{/if}
			{#if breakdown.gold > 0}
				<div class="breakdown-item">
					<CoinIcon currency="gold" size={16} />
					{breakdown.gold} Gold
				</div>
			{/if}
			{#if breakdown.silver > 0}
				<div class="breakdown-item">
					<CoinIcon currency="silver" size={16} />
					{breakdown.silver} Silver
				</div>
			{/if}
			{#if breakdown.copper > 0}
				<div class="breakdown-item">
					<CoinIcon currency="copper" size={16} />
					{breakdown.copper} Copper
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.currency-display {
		padding: 12px;
		background-color: #f9fafb;
		border-radius: 6px;
		margin-bottom: 12px;
	}

	.currency-display.optimized {
		background-color: #f0fdf4;
	}

	.label {
		font-weight: 600;
		margin-bottom: 8px;
	}

	.amount {
		font-size: 18px;
		color: #8B4513;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.breakdown-list {
		font-size: 14px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}
</style>