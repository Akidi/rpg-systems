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

	// Determine rarity class based on category
	const rarityClass = $derived.by(() => {
		switch (item.category) {
			case 'consumable':
				return 'rarity-common';
			case 'weapon':
				return 'rarity-uncommon';
			case 'armor':
				return 'rarity-rare';
			case 'accessory':
				return 'rarity-epic';
			case 'meta':
				return 'rarity-legendary';
			case 'cosmetic':
				return 'rarity-legendary';
			default:
				return 'rarity-common';
		}
	});
</script>

<div class="item-card" class:affordable={canAfford} class:unaffordable={!canAfford}>
	<div class="item-header">
		<div class="item-name {rarityClass}">{item.name}</div>
		<div class="item-category">{capitalizeFirst(item.category)}</div>
	</div>

	<div class="item-price">
		{#if priceComponents.length > 0}
			<div class="price-components">
				{#each priceComponents as component, index}
					<div class="price-component">
						<CoinIcon currency={component.currency} size={24} />
						<span class="price-amount">{component.amount}</span>
					</div>
					{#if index < priceComponents.length - 1}
						<span class="price-separator">+</span>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="price-component">
				<CoinIcon currency="copper" size={16} />
				<span class="price-amount">0</span>
			</div>
		{/if}
	</div>

	<div class="item-copper">
		<CoinIcon currency="copper" size={12} />
		<span>({formatNumber(totalCopperCost)} copper total)</span>
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
		padding: 16px;
		background-color: var(--bg-secondary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		transition: var(--transition-theme);
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
	}

	.item-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px var(--shadow-medium);
	}

	.item-card.affordable {
		border-color: var(--color-success);
		background-color: var(--bg-secondary);
	}

	.item-card.affordable::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background-color: var(--color-success);
		border-radius: 8px 8px 0 0;
	}

	.item-card.unaffordable {
		border-color: var(--color-error);
		background-color: var(--bg-tertiary);
		opacity: 0.7;
	}

	.item-card.unaffordable::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background-color: var(--color-error);
		border-radius: 8px 8px 0 0;
	}

	.item-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.item-name {
		font-weight: 700;
		font-size: 16px;
		transition: var(--transition-theme);
	}

	.item-category {
		font-size: 12px;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
		transition: var(--transition-theme);
	}

	.item-price {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.price-components {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.price-component {
		display: flex;
		align-items: center;
		gap: 4px;
		background-color: var(--bg-tertiary);
		padding: 4px 8px;
		border-radius: 6px;
		border: 1px solid var(--border-secondary);
	}

	.price-amount {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 14px;
	}

	.price-separator {
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 12px;
	}

	.item-copper {
		font-size: 12px;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		gap: 4px;
		font-style: italic;
	}

	.buy-btn {
		width: 100%;
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		transition: var(--transition-theme);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.buy-btn.affordable {
		background-color: var(--color-success);
		color: var(--text-inverse);
	}

	.buy-btn.affordable:hover {
		background-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	.buy-btn.unaffordable {
		background-color: var(--bg-tertiary);
		color: var(--text-muted);
		cursor: not-allowed;
		border: 1px solid var(--border-primary);
	}

	.buy-btn:disabled {
		transform: none;
		box-shadow: none;
	}
</style>
