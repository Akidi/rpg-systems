// src/lib/composables/calculator.ts
import type { BaseSpell, IEnhancement, IDamageSettings, StealSettings, ISpellCosts, ISpellEffects, Character } from '$lib/types';

type CacheKey = string;
type CacheValue = ISpellCosts | ISpellEffects;

const cache = new Map<CacheKey, CacheValue>();

function generateCacheKey(...args: unknown[]): CacheKey {
  return JSON.stringify(args);
}

export function calculateEnhancedSpell(baseSpell: BaseSpell, enhancements: IEnhancement[]): ISpellCosts {
  const cacheKey = generateCacheKey(baseSpell, enhancements);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as ISpellCosts;
  }

  // Existing calculation logic
  const enhancementAPCost = enhancements.reduce((sum, enh) => sum + (enh.name === 'Multi-Target' ? 2 : 1), 0);
  const enhancementMPCost = enhancements.reduce((sum, enh) => sum + (enh.name === 'Elemental Boost' ? 50 : 25), 0);
  const result: ISpellCosts = {
    totalAPCost: baseSpell.apCost + enhancementAPCost,
    totalMPCost: baseSpell.mpCost + enhancementMPCost,
    enhancementAPCost,
    enhancementMPCost
  };

  cache.set(cacheKey, result);
  return result;
}

export function calculateSpellEffects(
  baseSpell: BaseSpell,
  enhancements: IEnhancement[],
  enemyCount: number,
  damageSettings: IDamageSettings,
  stealSettings: StealSettings
): ISpellEffects {
  const cacheKey = generateCacheKey(baseSpell, enhancements, enemyCount, damageSettings, stealSettings);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as ISpellEffects;
  }

  // Existing calculation logic (simplified example)
  const rawDamageMultiplier = 1 + (enhancements.filter(e => e.name === 'Raw Damage').length * damageSettings.rawDamagePercent / 100);
  const isMultiTarget = enhancements.some(e => e.name === 'Multi-Target');
  const result: ISpellEffects = {
    damage: isMultiTarget ? baseSpell.baseDamage * 0.5 : baseSpell.baseDamage * rawDamageMultiplier,
    critChance: enhancements.filter(e => e.name === 'Critical Hit Chance').length * 15,
    critDamage: baseSpell.baseDamage * (1 + enhancements.filter(e => e.name === 'Critical Hit Damage').length * 0.5),
    targets: isMultiTarget ? enemyCount : 1,
    defenseIgnore: Math.min(enhancements.filter(e => e.name === 'Penetration').length * 30, 90),
    hasDoT: enhancements.some(e => e.name === 'Elemental Boost'),
    dotDuration: enhancements.filter(e => e.name === 'Elemental Boost').length * 3,
    enhancementCounts: enhancements.reduce((acc, e) => ({ ...acc, [e.name]: (acc[e.name] || 0) + 1 }), {} as Record<string, number>),
    isMultiTarget,
    lifeStealPercent: enhancements.filter(e => e.name === 'Life Steal').length * stealSettings.lifeStealPercent,
    manaStealPercent: enhancements.filter(e => e.name === 'Mana Steal').length * stealSettings.manaStealPercent,
    lifeStealAmount: 0, // Simplified; add actual logic
    manaStealAmount: 0, // Simplified; add actual logic
    critLifeStealAmount: 0, // Simplified; add actual logic
    critManaStealAmount: 0, // Simplified; add actual logic
    totalDamageOutput: isMultiTarget ? baseSpell.baseDamage * 0.5 * enemyCount : baseSpell.baseDamage * rawDamageMultiplier,
    baseDamageAfterRaw: baseSpell.baseDamage * rawDamageMultiplier
  };

  cache.set(cacheKey, result);
  return result;
}

export function calculateAPRecovery(character: Character, baseSpell: BaseSpell, enhancements: IEnhancement[]): number {
  // Existing logic (example)
  const enhancementAPCost = enhancements.reduce((sum, enh) => sum + (enh.name === 'Multi-Target' ? 2 : 1), 0);
  return character.currentAP + Math.ceil(enhancementAPCost * 0.3);
}