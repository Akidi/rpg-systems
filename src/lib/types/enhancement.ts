// types.ts
import type { Writable, Readable } from 'svelte/store';

export interface Character {
  maxAP: number;
  currentAP: number;
  maxHP: number;
  currentHP: number;
  maxMP: number;
  currentMP: number;
}

export interface BaseSpell {
  name: string;
  apCost: number;
  mpCost: number;
  baseDamage: number;
}

export interface Enhancement {
  name: string;
  effect: string;
  stackable: boolean;
  description: string;
}

export interface StealSettings {
  lifeStealPercent: number;
  manaStealPercent: number;
}

export interface DamageSettings {
  rawDamagePercent: number;
}

export interface Costs {
  totalAPCost: number;
  totalMPCost: number;
  enhancementAPCost: number;
  enhancementMPCost: number;
}

export interface EnhancementCounts {
  [key: string]: number;
}

export interface SpellEffects {
  damage: number;
  critChance: number;
  critDamage: number;
  targets: number;
  defenseIgnore: number;
  hasDoT: boolean;
  dotDuration: number;
  enhancementCounts: EnhancementCounts;
  isMultiTarget: boolean;
  lifeStealPercent: number;
  manaStealPercent: number;
  lifeStealAmount: number;
  manaStealAmount: number;
  critLifeStealAmount: number;
  critManaStealAmount: number;
  totalDamageOutput: number;
  baseDamageAfterRaw: number;
}

// Store interface for traditional Svelte stores
export interface EnhancementStore {
  // State stores
  character: Writable<Character>;
  baseSpell: Writable<BaseSpell>;
  stealSettings: Writable<StealSettings>;
  damageSettings: Writable<DamageSettings>;
  enhancements: Writable<Enhancement[]>;
  enemyCount: Writable<number>;
  // Derived stores
  availableEnhancements: Readable<Enhancement[]>;
  costs: Readable<Costs>;
  spellEffects: Readable<SpellEffects>;
  apRecovery: Readable<number>;
  canCast: Readable<boolean>;
  // Actions
  addEnhancement: (enhancement: Enhancement) => void;
  removeEnhancement: (index: number) => void;
  castSpell: () => boolean;
  nextTurn: () => void;
  resetCharacter: () => void;
}