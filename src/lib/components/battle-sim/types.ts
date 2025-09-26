import type { ComponentType } from 'svelte';

export type PlayerKey = 'player';
export type EnemyKey = 'enemy1' | 'enemy2';
export type CharacterKey = PlayerKey | EnemyKey;

export type EnhancementId = 'power' | 'crit' | 'multi';

export type SelectedEnhancements = Partial<Record<EnhancementId, number>>;

type BaseEffect = {
	name: string;
};

type DotEffect = BaseEffect & {
	type: 'dot';
	damage: number;
	startAction: number;
	nextTick: number;
	hasFirstTick: boolean;
	hasFinalTick: boolean;
};

type BuffEffect = BaseEffect & {
	type: 'buff';
	effect: 'damage_reduction';
	value: number;
	duration: number;
};

export type Effect = DotEffect | BuffEffect;

export type Character = {
	name: string;
	maxHp: number;
	hp: number;
	maxMana: number;
	mana: number;
	maxAp: number;
	ap: number;
	focus: number;
	maxFocus: number;
	focusDecay: number;
	effects: Effect[];
	baseDamage: number;
	baseHealing: number;
};

export type CharactersState = Record<CharacterKey, Character>;

export type IconComponent = ComponentType;

export type ActionType = 'damage' | 'healing' | 'focus' | 'defend';

export type ActionDefinition = {
	id: string;
	name: string;
	apCost: number;
	type: ActionType;
	icon: IconComponent;
	dot?: boolean;
};

export type Enhancement = {
	id: EnhancementId;
	name: string;
	description: string;
	cost: number;
};

export type TelegraphedAction = {
	actionId: string;
	enhancements: SelectedEnhancements;
	caster: CharacterKey;
	targetKey?: CharacterKey;
};

export type CombatLogCategory =
	| 'damage'
	| 'healing'
	| 'focus'
	| 'effect'
	| 'resource'
	| 'system';

export type CombatLogEntry = {
	id: string;
	turn: number;
	actionNumber: number;
	category: CombatLogCategory;
	message: string;
	actor?: string;
	target?: string;
	action?: string;
	source?: string;
	amount?: number;
	critical?: boolean;
	detail?: string;
	tags?: string[];
};
