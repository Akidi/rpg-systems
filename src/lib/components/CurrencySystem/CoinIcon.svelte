<!-- src/lib/components/CurrencySystem/CoinIcon.svelte -->
<script lang="ts">
	import type { CurrencyType } from '$lib/types/currency.js';
	import { getCurrencyColor } from '$lib/types/currency.js';

	interface Props {
		currency: CurrencyType;
		size?: number;
	}

	let { currency, size = 16 }: Props = $props();

	const color = getCurrencyColor(currency);
	
	// Darker color for the border/shadow
	const borderColor = $derived.by(() => {
		switch(currency) {
			case 'copper': return '#654321';
			case 'silver': return '#808080';
			case 'gold': return '#B8860B';
			case 'platinum': return '#9A9A9A';
		}
	});

	// Inner circle color - darker shade for light coins, lighter shade for dark coins
	const innerCircleColor = $derived.by(() => {
		switch(currency) {
			case 'copper': return 'rgba(255, 255, 255, 0.4)'; // Lighter for dark coin
			case 'silver': return 'rgba(128, 128, 128, 0.6)'; // Darker for light coin
			case 'gold': return 'rgba(184, 134, 11, 0.7)'; // Darker for light coin
			case 'platinum': return 'rgba(154, 154, 154, 0.7)'; // Darker for light coin
		}
	});
</script>

<svg 
	width={size} 
	height={size} 
	viewBox="0 0 24 24" 
	class="coin-icon"
	role="img"
	aria-label="{currency} coin"
>
	<!-- Coin shadow/depth -->
	<circle 
		cx="12" 
		cy="13" 
		r="10" 
		fill={borderColor}
		opacity="0.3"
	/>
	
	<!-- Main coin body -->
	<circle 
		cx="12" 
		cy="12" 
		r="10" 
		fill={color}
		stroke={borderColor}
		stroke-width="1"
	/>
	
	<!-- Inner highlight circle -->
	<circle 
		cx="12" 
		cy="12" 
		r="7" 
		fill="none"
		stroke={innerCircleColor}
		stroke-width="1.5"
	/>
	
	<!-- Center symbol -->
	<text 
		x="12" 
		y="16" 
		text-anchor="middle" 
		font-family="serif"
		font-size="10"
		font-weight="900"
		fill={currency === 'copper' ? 'white' : borderColor}
		stroke={currency === 'copper' ? borderColor : 'none'}
		stroke-width={currency === 'copper' ? '0.5' : '0'}
	>
		{currency.charAt(0).toUpperCase()}
	</text>
</svg>

<style>
	.coin-icon {
		flex-shrink: 0;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}
</style>