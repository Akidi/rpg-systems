import type { BaseSpell, IEnhancement, ISpellCosts, ISpellEffects, Character, IDamageSettings, StealSettings } from '../types';

export function calculateEnhancedSpell(baseSpell: BaseSpell, enhancements: IEnhancement[]): ISpellCosts {
  if (enhancements.length === 0) {
    return {
      totalAPCost: baseSpell.apCost,
      totalMPCost: baseSpell.mpCost,
      enhancementAPCost: 0,
      enhancementMPCost: 0
    };
  }

  const enhancementAPCost = enhancements.length;
  const enhancementMPCost = Math.ceil(baseSpell.mpCost * Math.pow(1.25, enhancements.length)) - baseSpell.mpCost;

  return {
    totalAPCost: baseSpell.apCost + enhancementAPCost,
    totalMPCost: baseSpell.mpCost + enhancementMPCost,
    enhancementAPCost,
    enhancementMPCost
  };
}

export function calculateSpellEffects(
  baseSpell: BaseSpell,
  enhancements: IEnhancement[],
  enemyCount: number,
  damageSettings: IDamageSettings,
  stealSettings: StealSettings
): ISpellEffects {
  let baseDamage = baseSpell.baseDamage;
  let critChance = 5;
  let critMultiplier = 2.0;
  let targets = 1;
  let defenseIgnore = 0;
  let hasDoT = false;
  let dotDuration = 0;
  let damageMultiplier = 1.0;
  let isMultiTarget = false;
  let lifeStealPercent = 0;
  let manaStealPercent = 0;

  const enhancementCounts: Record<string, number> = {};
  enhancements.forEach((enhancement) => {
    enhancementCounts[enhancement.name] = (enhancementCounts[enhancement.name] || 0) + 1;
  });

  if (enhancementCounts['Critical Hit Chance']) {
    critChance += enhancementCounts['Critical Hit Chance'] * 15;
  }

  if (enhancementCounts['Critical Hit Damage']) {
    critMultiplier *= Math.pow(1.5, enhancementCounts['Critical Hit Damage']);
  }

  if (enhancementCounts['Raw Damage']) {
    const damageBoostPercent = enhancementCounts['Raw Damage'] * damageSettings.rawDamagePercent;
    baseDamage = Math.ceil(baseDamage * (1 + damageBoostPercent / 100));
  }

  if (enhancementCounts['Multi-Target']) {
    isMultiTarget = true;
    targets = enemyCount;
    damageMultiplier = 0.5;
  }

  if (enhancementCounts['Penetration']) {
    defenseIgnore = Math.min(90, enhancementCounts['Penetration'] * 30);
  }

  if (enhancementCounts['Elemental Boost']) {
    hasDoT = true;
    dotDuration = 3 + enhancementCounts['Elemental Boost'] - 1;
  }

  if (enhancementCounts['Life Steal']) {
    lifeStealPercent = enhancementCounts['Life Steal'] * stealSettings.lifeStealPercent;
  }

  if (enhancementCounts['Mana Steal']) {
    manaStealPercent = enhancementCounts['Mana Steal'] * stealSettings.manaStealPercent;
  }

  const finalDamage = Math.ceil(baseDamage * damageMultiplier);
  const critDamage = Math.ceil(finalDamage * critMultiplier);
  const totalDamageOutput = finalDamage * targets;

  const lifeStealAmount = lifeStealPercent > 0 ? Math.ceil(totalDamageOutput * (lifeStealPercent / 100)) : 0;
  const manaStealAmount = manaStealPercent > 0 ? Math.ceil(totalDamageOutput * (manaStealPercent / 100)) : 0;
  const critLifeStealAmount = lifeStealPercent > 0 ? Math.ceil((critDamage * targets) * (lifeStealPercent / 100)) : 0;
  const critManaStealAmount = manaStealPercent > 0 ? Math.ceil((critDamage * targets) * (manaStealPercent / 100)) : 0;

  return {
    damage: finalDamage,
    critChance: Math.min(100, critChance),
    critDamage,
    targets,
    defenseIgnore,
    hasDoT,
    dotDuration,
    enhancementCounts,
    isMultiTarget,
    lifeStealPercent,
    manaStealPercent,
    lifeStealAmount,
    manaStealAmount,
    critLifeStealAmount,
    critManaStealAmount,
    totalDamageOutput,
    baseDamageAfterRaw: baseDamage
  };
}

export function calculateAPRecovery(character: Character, baseSpell: BaseSpell, enhancements: IEnhancement[]): number {
  if (enhancements.length === 0) return character.maxAP;

  const costs = calculateEnhancedSpell(baseSpell, enhancements);
  const enhancementAPCost = enhancements.length;
  const recoveryPercent = 30;
  const apRecovery = Math.ceil(enhancementAPCost * (recoveryPercent / 100));
  const remainingAP = Math.max(0, character.currentAP - costs.totalAPCost);

  return apRecovery + remainingAP;
}