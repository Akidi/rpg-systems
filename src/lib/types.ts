// src/lib/types.ts
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

export interface StealSettings {
  lifeStealPercent: number;
  manaStealPercent: number;
}

export interface IDamageSettings {
  rawDamagePercent: number;
}

export interface IEnhancement {
  name: string;
  effect: string;
  stackable: boolean;
  description: string;
}

export interface ISpellCosts {
  totalAPCost: number;
  totalMPCost: number;
  enhancementAPCost: number;
  enhancementMPCost: number;
}

export interface ISpellEffects {
  damage: number;
  critChance: number;
  critDamage: number;
  targets: number;
  defenseIgnore: number;
  hasDoT: boolean;
  dotDuration: number;
  enhancementCounts: Record<string, number>;
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