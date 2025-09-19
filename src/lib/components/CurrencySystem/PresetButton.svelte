<!-- src/lib/components/CurrencySystem/PresetButton.svelte -->
<script lang="ts">
	import type { CurrencyType } from '$lib/types/currency.js';
	import { getCurrencyColor } from '$lib/types/currency.js';
	import CoinIcon from './CoinIcon.svelte';

	interface Props {
		amount: number;
		currency: CurrencyType;
		onClick: (amount: number, currency: CurrencyType) => void;
	}

	let { amount, currency, onClick }: Props = $props();

	function getTextColor(currency: CurrencyType): string {
		return currency === 'silver' || currency === 'gold' || currency === 'platinum' ? 'black' : 'white';
	}

	function capitalizeFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
</script>

<button 
	onclick={() => onClick(amount, currency)} 
	class="preset-btn"
	style="background-color: {getCurrencyColor(currency)}; color: {getTextColor(currency)}"
>
	<CoinIcon {currency} size={14} />
	+{amount} {capitalizeFirst(currency)}
</button>

<style>
	.preset-btn {
		padding: 8px 12px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		transition: filter 0.2s ease;
		display: flex;
		align-items: center;
		gap: 6px;
		justify-content: center;
	}

	.preset-btn:hover {
		filter: brightness(0.9);
	}

	.preset-btn:active {
		transform: translateY(1px);
	}
</style>