<!-- src/routes/currency/+page.svelte -->
<script lang="ts">
	import CurrencyInput from '$lib/components/CurrencySystem/CurrencyInput.svelte';
	import CurrencyDisplay from '$lib/components/CurrencySystem/CurrencyDisplay.svelte';
	import PresetButton from '$lib/components/CurrencySystem/PresetButton.svelte';
	import ItemCard from '$lib/components/CurrencySystem/ItemCard.svelte';
	import { 
		breakdownToCopper, 
		copperToBreakdown, 
		getCurrencyColor,
		createPrice,
		type CurrencyBreakdown,
		type CurrencyType,
		type SampleItem,
		type CurrencyConversion
	} from '$lib/types/currency';

	// Conversion rates: 20 Copper = 1 Silver, 60 Silver = 1 Gold, 180 Gold = 1 Platinum
	const conversionRates: CurrencyConversion = {
		copperToSilver: 20,
		silverToGold: 60,
		goldToPlatinum: 180
	};

	// Currency state using Svelte 5 runes
	let playerCurrency = $state<CurrencyBreakdown>({
		copper: 0,
		silver: 0,
		gold: 0,
		platinum: 0
	});

	// Calculate total copper value
	const totalCopperValue = $derived.by(() => {
		return breakdownToCopper(playerCurrency, conversionRates);
	});

	// Convert from total copper to each denomination
	const optimizedBreakdown = $derived.by(() => {
		return copperToBreakdown(totalCopperValue, conversionRates);
	});

	// Sample item prices with multi-currency support using createPrice for validation
	const sampleItems: SampleItem[] = [
		{ 
			name: "Health Potion", 
			price: createPrice(5), 
			category: "consumable" 
		},
		{ 
			name: "Basic Sword", 
			price: createPrice(15), 
			category: "weapon" 
		},
		{ 
			name: "Iron Armor", 
			price: createPrice(0, 8), 
			category: "armor" 
		},
		{ 
			name: "Magic Ring", 
			price: createPrice(15, 1), 
			category: "accessory" 
		},
		{ 
			name: "Epic Weapon", 
			price: createPrice(0, 0, 12), 
			category: "weapon" 
		},
		{ 
			name: "Legendary Armor", 
			price: createPrice(50, 25, 2), 
			category: "armor" 
		},
		{ 
			name: "Ascension Bonus", 
			price: createPrice(0, 0, 0, 2), 
			category: "meta" 
		},
		{ 
			name: "Premium Cosmetic", 
			price: createPrice(25, 10, 1, 1), // This will auto-optimize to remove excess copper
			category: "cosmetic" 
		}
	];

	// Convert item price to copper for comparison
	function getItemCopperCost(item: SampleItem): number {
		return breakdownToCopper(item.price, conversionRates);
	}

	// Check if player can afford item
	function canAffordItem(item: SampleItem): boolean {
		return totalCopperValue >= getItemCopperCost(item);
	}

	// Buy item function
	function buyItem(item: SampleItem): boolean {
		if (!canAffordItem(item)) return false;
		
		const itemCopperCost = getItemCopperCost(item);
		const newTotal = totalCopperValue - itemCopperCost;
		
		// Convert back to denominations
		const newBreakdown = copperToBreakdown(newTotal, conversionRates);
		playerCurrency = newBreakdown;
		
		return true;
	}

	// Convert up (e.g., 20 copper -> 1 silver)
	function convertUp(): void {
		playerCurrency = optimizedBreakdown;
	}

	// Add preset amounts for testing
	function addPresetAmount(amount: number, currency: CurrencyType): void {
		playerCurrency = {
			...playerCurrency,
			[currency]: playerCurrency[currency] + amount
		};
	}

	function resetCurrency(): void {
		playerCurrency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
	}

	// Format number with commas
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	// Currency input handlers
	function updateCurrency(currency: CurrencyType, value: number): void {
		playerCurrency = {
			...playerCurrency,
			[currency]: value
		};
	}
</script>

<svelte:head>
	<title>Currency Conversion Calculator</title>
	<meta name="description" content="Test the 3x scaling currency system for the Diablo-like web game" />
</svelte:head>

<div class="container">
	<h1>Currency Conversion Calculator</h1>
	
	<div class="grid">
		<!-- Currency Input -->
		<div class="card">
			<h2>Your Currency</h2>
			
			<div class="currency-inputs">
				<CurrencyInput 
					label="Copper"
					bind:value={playerCurrency.copper}
					currency="copper"
					color={getCurrencyColor('copper')}
					onInput={(value) => updateCurrency('copper', value)}
				/>
				
				<CurrencyInput 
					label="Silver"
					bind:value={playerCurrency.silver}
					currency="silver"
					color={getCurrencyColor('silver')}
					onInput={(value) => updateCurrency('silver', value)}
				/>
				
				<CurrencyInput 
					label="Gold"
					bind:value={playerCurrency.gold}
					currency="gold"
					color={getCurrencyColor('gold')}
					onInput={(value) => updateCurrency('gold', value)}
				/>
				
				<CurrencyInput 
					label="Platinum"
					bind:value={playerCurrency.platinum}
					currency="platinum"
					color={getCurrencyColor('platinum')}
					onInput={(value) => updateCurrency('platinum', value)}
				/>
			</div>
			
			<div class="button-group">
				<button onclick={convertUp} class="btn btn-primary">
					Convert Up
				</button>
				<button onclick={resetCurrency} class="btn btn-secondary">
					Reset
				</button>
			</div>
		</div>
		
		<!-- Conversion Info -->
		<div class="card">
			<h2>Conversion Rates</h2>
			
			<div class="conversion-rates">
				<div>1 Silver = {conversionRates.copperToSilver} Copper</div>
				<div>1 Gold = {conversionRates.silverToGold} Silver = {formatNumber(conversionRates.silverToGold * conversionRates.copperToSilver)} Copper</div>
				<div>1 Platinum = {conversionRates.goldToPlatinum} Gold = {formatNumber(conversionRates.goldToPlatinum * conversionRates.silverToGold * conversionRates.copperToSilver)} Copper</div>
			</div>
			
			<CurrencyDisplay 
				title="Total Value"
				breakdown={playerCurrency}
				totalCopper={totalCopperValue}
				variant="default"
			/>
			
			<CurrencyDisplay 
				title="Optimized Breakdown"
				breakdown={optimizedBreakdown}
				totalCopper={totalCopperValue}
				variant="optimized"
			/>
		</div>
		
		<!-- Quick Add Presets -->
		<div class="card">
			<h2>Quick Add</h2>
			
			<div class="preset-grid">
				<PresetButton amount={100} currency="copper" onClick={addPresetAmount} />
				<PresetButton amount={10} currency="silver" onClick={addPresetAmount} />
				<PresetButton amount={5} currency="gold" onClick={addPresetAmount} />
				<PresetButton amount={1} currency="platinum" onClick={addPresetAmount} />
			</div>
		</div>
		
		<!-- Sample Items -->
		<div class="card full-width">
			<h2>Sample Item Prices</h2>
			<p class="description">
				Items can now have mixed currency prices (e.g., "1 gold 15 silver 50 copper")
			</p>
			
			<div class="items-grid">
				{#each sampleItems as item}
					<ItemCard 
						{item}
						canAfford={canAffordItem(item)}
						totalCopperCost={getItemCopperCost(item)}
						onBuy={buyItem}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
		font-family: system-ui, sans-serif;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	h1 {
		font-size: 28px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 32px;
		color: #333;
	}

	h2 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 16px;
		color: #374151;
	}

	.description {
		font-size: 14px;
		color: #6b7280;
		margin-bottom: 16px;
		font-style: italic;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.card {
		background: white;
		border-radius: 8px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.currency-inputs {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.button-group {
		margin-top: 16px;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover {
		background-color: #2563eb;
	}

	.btn-secondary {
		background-color: #6b7280;
		color: white;
	}

	.btn-secondary:hover {
		background-color: #4b5563;
	}

	.conversion-rates {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
		margin-bottom: 16px;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 12px;
	}
</style>