// src/lib/types/apProgression.ts

export interface APConfig {
	baseAP: number;
	softCapLevel: number; // Level where soft cap is reached naturally
	softCapAP: number; // AP value at soft cap
	maxLevel: number;
	dexBonus: number;
	scalingType: ScalingType;
	// Formula parameters
	linearMultiplier: number;
	logarithmicMultiplier: number;
	softCapMultiplier: number;
	milestoneInterval: number;
	// Dexterity configuration for early acceleration
	dexPerAP: number;
	dexDiminishingThreshold: number;
	dexDiminishingRatio: number;
	// Post-soft-cap dex requirements (exponential scaling)
	postSoftCapDexBase: number;
	postSoftCapDexMultiplier: number;
}

export interface Character {
	level: number;
	dexterity: number;
	ascensions: number;
}

export interface APResult {
	baseAP: number;
	naturalLevelBonus: number;
	dexAcceleration: number;
	postSoftCapBonus: number;
	ascensionBonus: number;
	totalAP: number;
	formula: string;
	reachedSoftCap: boolean;
	levelsAheadOfNatural: number;
	effectiveLevel: number;
}

// Missing type that components expect
export interface ProgressionPoint {
	level: number;
	ap: number;
	breakdown: APResult;
}

export type ScalingType = 'universal' | 'linear' | 'logarithmic' | 'softCap' | 'milestone';

export interface ScalingFormula {
	name: string;
	type: ScalingType;
	description: string;
	parameters: string[];
	calculate: (level: number, config: APConfig, ascensions?: number) => number;
}

// Updated scaling formulas including the new universal progression
export const SCALING_FORMULAS: ScalingFormula[] = [
	{
		name: 'Universal Progression (Recommended)',
		type: 'universal',
		description:
			'Natural progression to soft cap at level 50 (8 AP), with dex providing early acceleration',
		parameters: ['softCapLevel', 'softCapAP'],
		calculate: (level: number, config: APConfig) => {
			// Natural progression from baseAP to softCapAP over softCapLevel levels
			if (level >= config.softCapLevel) {
				return config.softCapAP;
			}

			// Linear interpolation from base to soft cap
			const progressRatio = (level - 1) / (config.softCapLevel - 1);
			const naturalBonus = (config.softCapAP - config.baseAP) * progressRatio;
			return config.baseAP + naturalBonus;
		}
	},
	{
		name: 'Linear',
		type: 'linear',
		description: 'Simple linear growth: baseAP + (level * multiplier)',
		parameters: ['linearMultiplier'],
		calculate: (level: number, config: APConfig) => {
			return config.baseAP + level * config.linearMultiplier;
		}
	},
	{
		name: 'Logarithmic',
		type: 'logarithmic',
		description: 'Slow growth that tapers off: baseAP + log(level + 1) * multiplier',
		parameters: ['logarithmicMultiplier'],
		calculate: (level: number, config: APConfig) => {
			return config.baseAP + Math.log(level + 1) * config.logarithmicMultiplier;
		}
	},
	{
		name: 'Soft Cap',
		type: 'softCap',
		description: 'Fast early growth, then slows: baseAP + sqrt(level) * multiplier',
		parameters: ['softCapMultiplier'],
		calculate: (level: number, config: APConfig) => {
			return config.baseAP + Math.sqrt(level) * config.softCapMultiplier;
		}
	},
	{
		name: 'Milestone',
		type: 'milestone',
		description: 'AP increases at specific level intervals',
		parameters: ['milestoneInterval'],
		calculate: (level: number, config: APConfig) => {
			const interval = config.milestoneInterval;
			const milestones = Math.floor(level / interval);
			return config.baseAP + milestones;
		}
	}
];

// Calculate what level a character with given dex "acts like" for natural progression
function calculateEffectiveLevel(character: Character, config: APConfig): number {
	if (character.dexterity === 0) {
		return character.level;
	}

	// Pre-soft-cap acceleration: dex can push you ahead of natural progression
	const dexAccelerationLevels = Math.floor(character.dexterity / config.dexPerAP);
	const effectiveLevel = Math.min(character.level + dexAccelerationLevels, config.softCapLevel);

	return effectiveLevel;
}

// Dexterity acceleration calculation (pre-soft-cap only)
export function calculateDexAcceleration(character: Character, config: APConfig): number {
	if (character.level >= config.softCapLevel) {
		return 0; // No acceleration needed once natural progression reaches soft cap
	}

	const effectiveLevel = calculateEffectiveLevel(character, config);

	// Convert acceleration levels to AP using natural progression curve
	const naturalAP = SCALING_FORMULAS[0].calculate(character.level, config);
	const acceleratedAP = SCALING_FORMULAS[0].calculate(effectiveLevel, config);

	return acceleratedAP - naturalAP;
}

// Post-soft-cap dex bonus calculation (exponential scaling)
export function calculatePostSoftCapBonus(character: Character, config: APConfig): number {
	if (
		character.level < config.softCapLevel &&
		character.dexterity < config.softCapLevel * config.dexPerAP
	) {
		return 0; // Not eligible for post-soft-cap bonuses yet
	}

	// Calculate "excess" dex beyond what's needed for soft cap acceleration
	const dexForSoftCap = Math.max(0, (config.softCapLevel - character.level) * config.dexPerAP);
	const excessDex = Math.max(0, character.dexterity - dexForSoftCap);

	if (excessDex === 0) return 0;

	// Exponential scaling for post-soft-cap AP
	let bonusAP = 0;
	let remainingDex = excessDex;
	let currentCost = config.postSoftCapDexBase;

	while (remainingDex >= currentCost) {
		bonusAP += 1;
		remainingDex -= currentCost;
		currentCost = Math.floor(currentCost * config.postSoftCapDexMultiplier);
	}

	return bonusAP;
}

// Legacy dex bonus calculation for non-universal formulas
export function calculateLegacyDexBonus(dexterity: number, config: APConfig): number {
	// Base calculation: every X dex gives 1 AP bonus
	const baseDexBonus = Math.floor(dexterity / config.dexPerAP);

	if (dexterity <= config.dexDiminishingThreshold) {
		return baseDexBonus;
	}

	// Diminishing returns: additional dex above threshold gives less bonus
	const excessDex = dexterity - config.dexDiminishingThreshold;
	const diminishedBonus = Math.floor(excessDex / (config.dexPerAP * config.dexDiminishingRatio));

	return baseDexBonus + diminishedBonus;
}

// Ascension bonus calculation
export function calculateAscensionBonus(ascensions: number): number {
	if (ascensions === 0) return 0;

	// First few ascensions give more, then it tapers off
	return Math.floor(ascensions * 2 + Math.log(ascensions + 1));
}

// Main AP calculation function
export function calculateTotalAP(
	character: Character,
	config: APConfig,
	formula: ScalingFormula
): APResult {
	const baseAP = config.baseAP;

	// Calculate natural level progression
	const naturalAP = formula.calculate(character.level, config, character.ascensions);
	const naturalLevelBonus = naturalAP - baseAP;

	// Calculate dex bonuses
	let dexAcceleration = 0;
	let postSoftCapBonus = 0;
	let effectiveLevel = character.level;
	let levelsAheadOfNatural = 0;

	if (formula.type === 'universal') {
		effectiveLevel = calculateEffectiveLevel(character, config);
		levelsAheadOfNatural = effectiveLevel - character.level;
		dexAcceleration = calculateDexAcceleration(character, config);
		postSoftCapBonus = calculatePostSoftCapBonus(character, config);
	} else {
		// For other formulas, use old dex system as fallback
		dexAcceleration = calculateLegacyDexBonus(character.dexterity, config);
	}

	const ascensionBonus = calculateAscensionBonus(character.ascensions);

	const totalAP = Math.floor(
		baseAP + naturalLevelBonus + dexAcceleration + postSoftCapBonus + ascensionBonus
	);

	// Check if soft cap is reached
	const reachedSoftCap =
		formula.type === 'universal'
			? character.level >= config.softCapLevel || effectiveLevel >= config.softCapLevel
			: false;

	return {
		baseAP,
		naturalLevelBonus: Math.floor(naturalLevelBonus),
		dexAcceleration: Math.floor(dexAcceleration),
		postSoftCapBonus,
		ascensionBonus,
		totalAP,
		formula:
			formula.type === 'universal'
				? `${baseAP} base + ${Math.floor(naturalLevelBonus)} level + ${Math.floor(dexAcceleration)} dex accel + ${postSoftCapBonus} post-cap + ${ascensionBonus} ascension`
				: `${baseAP} base + ${Math.floor(naturalLevelBonus)} level + ${Math.floor(dexAcceleration)} dex + ${ascensionBonus} ascension`,
		reachedSoftCap,
		levelsAheadOfNatural,
		effectiveLevel
	};
}

// Helper function to generate progression data for charting
export function generateProgressionData(
	config: APConfig,
	formula: ScalingFormula,
	maxLevel: number = 100,
	dexterity: number = 0,
	ascensions: number = 0
): ProgressionPoint[] {
	const data: ProgressionPoint[] = [];

	for (let level = 1; level <= maxLevel; level++) {
		const character: Character = { level, dexterity, ascensions };
		const breakdown = calculateTotalAP(character, config, formula);

		data.push({
			level,
			ap: breakdown.totalAP,
			breakdown
		});
	}

	return data;
}
