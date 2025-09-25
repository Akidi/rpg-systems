<!-- src/lib/components/CurrencySystem/CurrencyInput.svelte -->
<script lang="ts">
	import type { CurrencyType } from '$lib/types/currency.js';
	import CoinIcon from './CoinIcon.svelte';

	interface Props {
		label: string;
		value: number;
		currency: CurrencyType;
		onInput: (value: number) => void;
	}

	let { label, value = $bindable(), currency, onInput }: Props = $props();

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;
		value = newValue;
		onInput(newValue);
	}
</script>

<div class="currency-row">
	<div class="currency-label-container">
		<CoinIcon {currency} size={20} />
		<span class="currency-label">{label}:</span>
	</div>
	<input 
		type="number" 
		{value}
		oninput={handleInput}
		min="0"
		class="currency-input"
	/>
</div>

<style>
	.currency-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.currency-label-container {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 120px;
	}

	.currency-label {
		font-weight: 600;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.currency-input {
		flex: 1;
		padding: 8px 12px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		transition: var(--transition-theme);
	}

	.currency-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
	}

	.currency-input:hover {
		border-color: var(--color-secondary);
	}
</style>