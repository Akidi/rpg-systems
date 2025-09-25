<!-- src/routes/demo/system/currency/+page.svelte -->
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

<div class="currency-calculator">
	<header class="page-header">
		<h1 class="page-title">
			<span class="title-icon">💰</span>
			Currency Conversion Calculator
		</h1>
		<p class="page-description">
			Test the multi-tier currency system with automatic conversion and item pricing
		</p>
	</header>
	
	<div class="calculator-grid">
		<!-- Currency Input Panel -->
		<section class="panel currency-panel">
			<h2 class="panel-title">
				<span class="panel-icon">🏦</span>
				Your Currency
			</h2>
			
			<div class="currency-inputs">
				<CurrencyInput 
					label="Copper"
					bind:value={playerCurrency.copper}
					currency="copper"
					onInput={(value) => updateCurrency('copper', value)}
				/>
				
				<CurrencyInput 
					label="Silver"
					bind:value={playerCurrency.silver}
					currency="silver"
					onInput={(value) => updateCurrency('silver', value)}
				/>
				
				<CurrencyInput 
					label="Gold"
					bind:value={playerCurrency.gold}
					currency="gold"
					onInput={(value) => updateCurrency('gold', value)}
				/>
				
				<CurrencyInput 
					label="Platinum"
					bind:value={playerCurrency.platinum}
					currency="platinum"
					onInput={(value) => updateCurrency('platinum', value)}
				/>
			</div>
			
			<div class="action-buttons">
				<button onclick={convertUp} class="btn btn-primary">
					⚡ Convert Up
				</button>
				<button onclick={resetCurrency} class="btn btn-secondary">
					🔄 Reset
				</button>
			</div>
		</section>
		
		<!-- Conversion Info Panel -->
		<section class="panel info-panel">
			<h2 class="panel-title">
				<span class="panel-icon">⚖️</span>
				Conversion Rates
			</h2>
			
			<div class="conversion-info">
				<div class="rate-item">
					<strong>1 Silver</strong> = {conversionRates.copperToSilver} Copper
				</div>
				<div class="rate-item">
					<strong>1 Gold</strong> = {conversionRates.silverToGold} Silver = {formatNumber(conversionRates.silverToGold * conversionRates.copperToSilver)} Copper
				</div>
				<div class="rate-item">
					<strong>1 Platinum</strong> = {conversionRates.goldToPlatinum} Gold = {formatNumber(conversionRates.goldToPlatinum * conversionRates.silverToGold * conversionRates.copperToSilver)} Copper
				</div>
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
		</section>
		
		<!-- Quick Add Presets Panel -->
		<section class="panel preset-panel">
			<h2 class="panel-title">
				<span class="panel-icon">⚡</span>
				Quick Add
			</h2>
			
			<div class="preset-grid">
				<PresetButton amount={100} currency="copper" onClick={addPresetAmount} />
				<PresetButton amount={10} currency="silver" onClick={addPresetAmount} />
				<PresetButton amount={5} currency="gold" onClick={addPresetAmount} />
				<PresetButton amount={1} currency="platinum" onClick={addPresetAmount} />
			</div>
			
			<div class="preset-shortcuts">
				<button onclick={() => addPresetAmount(1000, 'copper')} class="shortcut-btn">
					+1K Copper
				</button>
				<button onclick={() => addPresetAmount(100, 'silver')} class="shortcut-btn">
					+100 Silver
				</button>
			</div>
		</section>
		
		<!-- Sample Items Panel -->
		<section class="panel items-panel">
			<h2 class="panel-title">
				<span class="panel-icon">🛍️</span>
				Sample Item Prices
			</h2>
			<p class="panel-description">
				Items can have mixed currency prices. Purchase them to test the conversion system!
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
		</section>
	</div>
</div>

<style>
	.currency-calculator {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--bg-primary);
		min-height: 100vh;
		transition: var(--transition-theme);
	}

	/* Header Styles */
	.page-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		box-shadow: 0 4px 8px var(--shadow-light);
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		color: var(--color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.title-icon {
		font-size: 3rem;
		filter: drop-shadow(0 2px 4px var(--shadow-medium));
	}

	.page-description {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	/* Grid Layout */
	.calculator-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 0.7fr;
		gap: 2rem;
	}

	/* Panel Styles */
	.panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px var(--shadow-light);
		transition: var(--transition-theme);
	}

	.panel:hover {
		box-shadow: 0 4px 12px var(--shadow-medium);
		transform: translateY(-2px);
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-icon {
		font-size: 1.5rem;
	}

	.panel-description {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	/* Currency Panel */
	.currency-inputs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* Info Panel */
	.conversion-info {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		border: 1px solid var(--border-secondary);
	}

	.rate-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-primary);
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.rate-item:last-child {
		border-bottom: none;
	}

	/* Preset Panel */
	.preset-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.preset-shortcuts {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.shortcut-btn {
		padding: 0.5rem 1rem;
		background-color: var(--color-accent);
		color: var(--text-inverse);
		border: none;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition-theme);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.shortcut-btn:hover {
		background-color: var(--color-primary);
		transform: translateY(-1px);
	}

	/* Items Panel */
	.items-panel {
		grid-column: 1 / -1;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	/* Button Styles */
	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 600;
		transition: var(--transition-theme);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		box-shadow: 0 2px 4px var(--shadow-light);
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px var(--shadow-medium);
	}

	.btn-secondary {
		background-color: var(--color-secondary);
		color: var(--text-inverse);
		box-shadow: 0 2px 4px var(--shadow-light);
	}

	.btn-secondary:hover {
		background-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px var(--shadow-medium);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.currency-calculator {
			padding: 1rem;
		}

		.page-header {
			padding: 1.5rem;
			margin-bottom: 2rem;
		}

		.page-title {
			font-size: 2rem;
			flex-direction: column;
			gap: 0.5rem;
		}

		.title-icon {
			font-size: 2.5rem;
		}

		.calculator-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.panel {
			padding: 1rem;
		}

		.preset-grid {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			flex-direction: column;
		}

		.items-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.page-title {
			font-size: 1.75rem;
		}

		.btn {
			padding: 0.625rem 1.25rem;
			font-size: 0.8125rem;
		}
	}

	/* Special theme-aware enhancements */
	.currency-panel {
		border-left: 4px solid var(--color-gold);
	}

	.info-panel {
		border-left: 4px solid var(--color-info);
	}

	.preset-panel {
		border-left: 4px solid var(--color-accent);
	}

	.items-panel {
		border-left: 4px solid var(--color-success);
	}
</style>