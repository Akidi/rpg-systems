import type { ComponentType } from 'svelte';

export type CharacterKey = 'player' | 'enemy1' | 'enemy2';

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
