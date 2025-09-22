// src/lib/types/formulaPlanner.ts

export interface CharacterStats {
	level: number;
	strength: number;
	dexterity: number;
	intelligence: number;
	constitution: number;
	wisdom: number;
	charisma: number;
}

export interface DerivedStats {
	health: number;
	mana: number;
	physicalDamage: number;
	magicalDamage: number;
	rangedDamage: number;
	physicalDefense: number;
	magicalDefense: number;
	accuracy: number; // displayed as percentage
	evasion: number; // displayed as percentage
	initiative: number;
}

export interface FormulaSet {
	name: string;
	description: string;
	formulas: Record<keyof DerivedStats, string>;
}

export interface CharacterBuild {
	name: string;
	level: number;
	statDistribution: 'balanced' | 'warrior' | 'mage' | 'rogue' | 'custom';
	stats: CharacterStats;
}

// Default formula set with simple linear scaling
export const DEFAULT_FORMULAS: FormulaSet = {
	name: 'Linear Scaling',
	description: 'Simple linear formulas for testing',
	formulas: {
		health: 'floor(CON * 5 + level * 2)',
		mana: 'floor(INT * 3 + level * 1)',
		physicalDamage: 'floor(STR * 2 + level)',
		magicalDamage: 'floor(INT * 2 + level)',
		rangedDamage: 'floor(DEX * 2 + level)',
		physicalDefense: 'floor(CON + STR * 0.5)',
		magicalDefense: 'floor(WIS + INT * 0.5)',
		accuracy: 'floor(75 + DEX * 0.5)',
		evasion: 'floor(DEX * 0.3)',
		initiative: 'floor(DEX + level * 0.5)'
	}
};

// Example builds for testing
export const EXAMPLE_BUILDS: CharacterBuild[] = [
	{
		name: 'Balanced',
		level: 10,
		statDistribution: 'balanced',
		stats: { level: 10, strength: 15, dexterity: 15, intelligence: 15, constitution: 15, wisdom: 15, charisma: 15 }
	},
	{
		name: 'Warrior',
		level: 10,
		statDistribution: 'warrior',
		stats: { level: 10, strength: 25, dexterity: 10, intelligence: 5, constitution: 20, wisdom: 10, charisma: 10 }
	},
	{
		name: 'Mage',
		level: 10,
		statDistribution: 'mage',
		stats: { level: 10, strength: 5, dexterity: 10, intelligence: 25, constitution: 10, wisdom: 20, charisma: 10 }
	},
	{
		name: 'Rogue',
		level: 10,
		statDistribution: 'rogue',
		stats: { level: 10, strength: 10, dexterity: 25, intelligence: 10, constitution: 10, wisdom: 15, charisma: 10 }
	}
];

// Math examples for the reference guide
export interface MathExample {
	name: string;
	description: string;
	formula: string;
	explanation: string;
	usage: string;
}

export const MATH_EXAMPLES: MathExample[] = [
	{
		name: 'Linear Scaling',
		description: 'Simple proportional growth',
		formula: 'STR * 2',
		explanation: 'Every point of Strength adds exactly 2 damage. Predictable and easy to balance.',
		usage: 'Good for core stats where you want consistent, understandable progression.'
	},
	{
		name: 'Logarithmic (Diminishing Returns)',
		description: 'Fast early growth, then slows down',
		formula: 'log(STR + 1) * 20',
		explanation: 'First 10 STR gives big benefits, next 50 STR gives smaller gains. Prevents overpowered builds.',
		usage: 'Perfect for defensive stats like armor or resistance where you want soft caps.'
	},
	{
		name: 'Square Root Scaling',
		description: 'Moderate diminishing returns',
		formula: 'sqrt(STR) * 10',
		explanation: 'Middle ground between linear and logarithmic. Common in RPGs for damage reduction.',
		usage: 'Armor, magic resistance, or any stat where you want meaningful but controlled scaling.'
	},
	{
		name: 'Exponential Growth',
		description: 'Slow start, then accelerates',
		formula: 'pow(level, 1.3) * 10',
		explanation: 'Each level gives proportionally more than the last. Creates power spikes at high levels.',
		usage: 'Enemy health, late-game content difficulty, or prestige bonuses.'
	},
	{
		name: 'Soft Cap with Breakpoint',
		description: 'Different rates before/after threshold',
		formula: 'STR <= 50 ? STR * 3 : 150 + (STR - 50) * 1.5',
		explanation: 'Full value up to 50 STR, then half value after. Rewards specialization but limits extremes.',
		usage: 'Critical hit chance, accuracy, or any stat where you want a "sweet spot".'
	},
	{
		name: 'Percentage Modifier',
		description: 'Multiplicative bonuses',
		formula: '100 * (1 + STR / 100)',
		explanation: 'Each point of STR adds 1% more damage. Scales with base damage automatically.',
		usage: 'Damage multipliers, speed bonuses, or any enhancement that should scale with base values.'
	},
	{
		name: 'Sigmoid Curve (S-Curve)',
		description: 'Natural floor and ceiling',
		formula: '100 / (1 + pow(2.718, -(DEX - 50) / 10))',
		explanation: 'Creates natural 0-100% range with smooth transitions. Never quite reaches extremes.',
		usage: 'Hit chance, critical chance, status effect resistance - anything with natural limits.'
	},
	{
		name: 'Compound Formula',
		description: 'Multiple stats working together',
		formula: 'min(95, 50 + DEX * 0.5 + sqrt(WIS) * 2)',
		explanation: 'Combines multiple stats with different scaling, plus a hard cap to prevent 100% rates.',
		usage: 'Complex derived stats like critical hit chance that should benefit from multiple attributes.'
	},
	{
		name: 'Stepped Progression',
		description: 'Different rates at different stages',
		formula: 'level <= 20 ? level * 10 : 200 + (level - 20) * 5',
		explanation: 'Fast growth early game, slower progression in late game. Creates distinct power phases.',
		usage: 'Experience requirements, skill costs, or any system with early/mid/late game phases.'
	},
	{
		name: 'Multi-Breakpoint System',
		description: 'Multiple progression phases',
		formula: 'level <= 10 ? level * 50 : level <= 30 ? 500 + (level - 10) * 25 : 1000 + (level - 30) * 10',
		explanation: 'Three distinct phases with different growth rates. Allows fine-tuned progression curves.',
		usage: 'Complex progression systems, multi-tier content, or games with distinct difficulty phases.'
	},
	{
		name: 'Synergy Bonus',
		description: 'Stats that boost each other',
		formula: '(STR + DEX) * (1 + WIS / 100)',
		explanation: 'Base value from two stats, multiplied by wisdom bonus. Encourages balanced builds.',
		usage: 'Hybrid abilities, teamwork bonuses, or mechanics that reward diverse stat investment.'
	},
	{
		name: 'Conditional Scaling',
		description: 'Bonuses that activate at thresholds',
		formula: 'STR * 2 + (STR > 20 ? DEX * 0.5 : 0)',
		explanation: 'Basic STR scaling plus DEX bonus only if STR exceeds 20. Rewards specialization.',
		usage: 'Elite abilities, mastery bonuses, or advanced techniques that require stat prerequisites.'
	},
	{
		name: 'Weighted Average',
		description: 'Multiple stats with different importance',
		formula: '(STR * 0.6 + CON * 0.3 + level * 0.1) * 5',
		explanation: 'Combines three factors with different weights. Strength matters most, level least.',
		usage: 'Combat ratings, overall power scores, or any composite stat with clear priorities.'
	},
	{
		name: 'Asymptotic Curve',
		description: 'Approaches but never reaches a limit',
		formula: '100 * (1 - pow(2.718, -STR / 20))',
		explanation: 'Gets closer to 100 as STR increases but never quite reaches it. Natural soft cap.',
		usage: 'Damage reduction percentages, success rates, or any stat that should have a practical maximum.'
	},
	{
		name: 'Resource Regeneration',
		description: 'Multi-factor regeneration system',
		formula: '(INT * 2 + WIS) * (1 + level / 50)',
		explanation: 'Base regen from two stats, boosted by level. Both immediate and long-term scaling.',
		usage: 'Mana/stamina regeneration, healing rates, or any renewable resource system.'
	},
	{
		name: 'Risk/Reward Balance',
		description: 'Scaling with built-in risk assessment',
		formula: '(DEX * 3) / (DEX * 3 + 100) * 95',
		explanation: 'Diminishing returns formula capped at 95%. High effectiveness but never guaranteed.',
		usage: 'Dodge chance, critical rates, or abilities where 100% success would break gameplay.'
	}
];