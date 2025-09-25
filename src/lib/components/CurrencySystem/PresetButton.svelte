<!-- src/lib/components/CurrencySystem/PresetButton.svelte -->
<script lang="ts">
	import type { CurrencyType } from '$lib/types/currency.js';
	import CoinIcon from './CoinIcon.svelte';

	interface Props {
		amount: number;
		currency: CurrencyType;
		onClick: (amount: number, currency: CurrencyType) => void;
	}

	let { amount, currency, onClick }: Props = $props();

	function capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Map currency to CSS class for special styling
	const currencyClass = $derived(`currency-${currency}`);
</script>

<button 
	onclick={() => onClick(amount, currency)} 
	class="preset-btn {currencyClass}"
>
	<CoinIcon {currency} size={14} />
	<span>+{amount} {capitalizeFirst(currency)}</span>
</button>

<style>
	.preset-btn {
		padding: 8px 12px;
		background-color: var(--color-secondary);
		color: var(--text-inverse);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		transition: var(--transition-theme);
		display: flex;
		align-items: center;
		gap: 6px;
		justify-content: center;
	}

	.preset-btn:hover {
		background-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	.preset-btn:active {
		transform: translateY(0);
		box-shadow: 0 1px 2px var(--shadow-light);
	}

	/* Currency-specific styling using theme variables */
	.currency-copper {
		background-color: var(--color-secondary);
	}

	.currency-silver {
		background-color: var(--color-accent);
	}

	.currency-gold {
		background-color: var(--color-gold);
		color: var(--text-primary);
	}

	.currency-platinum {
		background-color: var(--color-primary);
		border-color: var(--color-accent);
	}

	.preset-btn span {
		font-weight: 600;
	}
</style>