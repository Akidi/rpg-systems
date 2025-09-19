<!-- src/lib/components/CurrencySystem/ItemCard.svelte -->
<script lang="ts">
	import type { SampleItem } from '$lib/types/currency.js';
	import CoinIcon from './CoinIcon.svelte';

	interface Props {
		item: SampleItem;
		canAfford: boolean;
		totalCopperCost: number;
		onBuy: (item: SampleItem) => void;
	}

	let { item, canAfford, totalCopperCost, onBuy }: Props = $props();

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	function capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Create array of non-zero currency amounts for display
	const priceComponents = $derived.by(() => {
		const components = [];
		if (item.price.platinum > 0) {
			components.push({ currency: 'platinum' as const, amount: item.price.platinum });
		}
		if (item.price.gold > 0) {
			components.push({ currency: 'gold' as const, amount: item.price.gold });
		}
		if (item.price.silver > 0) {
			components.push({ currency: 'silver' as const, amount: item.price.silver });
		}
		if (item.price.copper > 0) {
			components.push({ currency: 'copper' as const, amount: item.price.copper });
		}
		return components;
	});
</script>

<div class="item-card" class:affordable={canAfford} class:unaffordable={!canAfford}>
	<div class="item-name">{item.name}</div>
	<div class="item-category">{capitalizeFirst(item.category)}</div>
	
	<div class="item-price">
		{#if priceComponents.length > 0}
			<div class="price-components">
				{#each priceComponents as component, index}
					<div class="price-component">
						<CoinIcon currency={component.currency} size={32} />
						<span>{component.amount}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="price-component">
				<CoinIcon currency="copper" size={16} />
				<span>0 copper</span>
			</div>
		{/if}
	</div>
	
	<div class="item-copper">
		<CoinIcon currency="copper" size={12} />
		({formatNumber(totalCopperCost)} copper total)
	</div>
	
	<button 
		onclick={() => onBuy(item)}
		disabled={!canAfford}
		class="buy-btn"
		class:affordable={canAfford}
		class:unaffordable={!canAfford}
	>
		{canAfford ? 'Buy' : 'Cannot Afford'}
	</button>
</div>

<style>
	.item-card {
		padding: 12px;
		border: 1px solid;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.item-card.affordable {
		border-color: #10b981;
		background-color: #f0fdf4;
	}

	.item-card.unaffordable {
		border-color: #ef4444;
		background-color: #fef2f2;
	}

	.item-name {
		font-weight: 600;
		margin-bottom: 4px;
		font-size: 16px;
	}

	.item-category {
		font-size: 14px;
		color: #6b7280;
		margin-bottom: 8px;
	}

	.item-price {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
		color: #374151;
	}

	.price-components {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
	}

	.price-component {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.item-copper {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.buy-btn {
		width: 100%;
		padding: 6px 12px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.buy-btn.affordable {
		background-color: #10b981;
		color: white;
	}

	.buy-btn.unaffordable {
		background-color: #d1d5db;
		color: #6b7280;
		cursor: not-allowed;
	}

	.buy-btn:hover.affordable {
		background-color: #059669;
		transform: translateY(-1px);
	}
</style>