// src/lib/types/currency.ts
export type CurrencyType = 'copper' | 'silver' | 'gold' | 'platinum';
export type ItemCategory = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'meta' | 'cosmetic';

export interface CurrencyBreakdown {
	copper: number;
	silver: number;
	gold: number;
	platinum: number;
}

export interface SampleItem {
	name: string;
	price: CurrencyBreakdown;
	category: ItemCategory;
}

export interface CurrencyConversion {
	copperToSilver: number;
	silverToGold: number;
	goldToPlatinum: number;
}

// Currency utility functions
export function breakdownToCopper(breakdown: CurrencyBreakdown, rates: CurrencyConversion): number {
	return (
		breakdown.copper +
		breakdown.silver * rates.copperToSilver +
		breakdown.gold * rates.silverToGold * rates.copperToSilver +
		breakdown.platinum * rates.goldToPlatinum * rates.silverToGold * rates.copperToSilver
	);
}

export function copperToBreakdown(
	totalCopper: number,
	rates: CurrencyConversion
): CurrencyBreakdown {
	let remaining = totalCopper;

	const platinum = Math.floor(
		remaining / (rates.goldToPlatinum * rates.silverToGold * rates.copperToSilver)
	);
	remaining %= rates.goldToPlatinum * rates.silverToGold * rates.copperToSilver;

	const gold = Math.floor(remaining / (rates.silverToGold * rates.copperToSilver));
	remaining %= rates.silverToGold * rates.copperToSilver;

	const silver = Math.floor(remaining / rates.copperToSilver);
	remaining %= rates.copperToSilver;

	const copper = remaining;

	return { copper, silver, gold, platinum };
}

export function getCurrencyColor(currency: CurrencyType): string {
	switch (currency) {
		case 'copper':
			return '#8B4513';
		case 'silver':
			return '#C0C0C0';
		case 'gold':
			return '#FFD700';
		case 'platinum':
			return '#E5E4E2';
	}
}

export function formatCurrencyBreakdown(breakdown: CurrencyBreakdown): string {
	const parts: string[] = [];
	if (breakdown.platinum > 0) parts.push(`${breakdown.platinum} platinum`);
	if (breakdown.gold > 0) parts.push(`${breakdown.gold} gold`);
	if (breakdown.silver > 0) parts.push(`${breakdown.silver} silver`);
	if (breakdown.copper > 0) parts.push(`${breakdown.copper} copper`);
	return parts.join(', ') || '0 copper';
}

export function createPrice(
	copper: number = 0,
	silver: number = 0,
	gold: number = 0,
	platinum: number = 0,
	rates: CurrencyConversion = { copperToSilver: 20, silverToGold: 60, goldToPlatinum: 180 }
): CurrencyBreakdown {
	// Validate inputs
	if (copper < 0 || silver < 0 || gold < 0 || platinum < 0) {
		throw new Error('Currency values cannot be negative');
	}

	// Convert to total copper for optimization
	const totalCopper =
		copper +
		silver * rates.copperToSilver +
		gold * rates.silverToGold * rates.copperToSilver +
		platinum * rates.goldToPlatinum * rates.silverToGold * rates.copperToSilver;

	// Convert back to optimized breakdown
	return copperToBreakdown(totalCopper, rates);
}
