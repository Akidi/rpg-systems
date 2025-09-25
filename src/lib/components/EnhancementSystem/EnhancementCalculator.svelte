<script lang="ts">
  import CharacterStats from './CharacterStats.svelte';
  import SpellConfiguration from './SpellConfiguration.svelte';
  import EnhancementSettings from './EnhancementSettings.svelte';
  import EnhancementSelector from './EnhancementSelector.svelte';
  import EnhancementStack from './EnhancementStack.svelte';
  import SpellEffects from './SpellEffects.svelte';
  import CostBreakdown from './CostBreakdown.svelte';
  import type { Character, BaseSpell, Enhancement, StealSettings, DamageSettings } from '$lib/types/enhancement';

  // Character state with runes
  let character = $state<Character>({
    maxAP: 10,
    currentAP: 10,
    maxHP: 1000,
    currentHP: 1000,
    maxMP: 1000,
    currentMP: 1000
  });

  // Base spell state
  let baseSpell = $state<BaseSpell>({
    name: "Fireball",
    apCost: 2,
    mpCost: 100,
    baseDamage: 50
  });

  // Settings states
  let stealSettings = $state<StealSettings>({
    lifeStealPercent: 2,
    manaStealPercent: 3
  });

  let damageSettings = $state<DamageSettings>({
    rawDamagePercent: 15
  });

  let apRecoverySettings = $state({
    recoveryPercent: 30 // Middle of 20-40% range from game design
  });

  // Enhancement and enemy states
  let enhancements = $state<Enhancement[]>([]);
  let enemyCount = $state<number>(3);
  let turnEnded = $state<boolean>(false); // Track if turn ended due to enhanced spell

  // Available enhancements - derived from settings
  let availableEnhancements = $derived<Enhancement[]>([
    { 
      name: "Critical Hit Chance", 
      effect: "+15% crit chance",
      stackable: true,
      description: "Each stack adds 15% crit chance"
    },
    { 
      name: "Critical Hit Damage", 
      effect: "+50% crit damage",
      stackable: true,
      description: "Each stack multiplies crit damage by 1.5x"
    },
    { 
      name: "Raw Damage", 
      effect: `+${damageSettings.rawDamagePercent}% damage`,
      stackable: true,
      description: `Each stack adds ${damageSettings.rawDamagePercent}% damage multiplier`
    },
    { 
      name: "Multi-Target", 
      effect: "Hit all enemies (50% damage)",
      stackable: false,
      description: "One-time enhancement: converts to AoE with 50% damage per target"
    },
    { 
      name: "Penetration", 
      effect: "Ignore 30% defense",
      stackable: true,
      description: "Each stack adds 30% defense ignore (max 90%)"
    },
    { 
      name: "Elemental Boost", 
      effect: "+Fire DoT (3 turns)",
      stackable: true,
      description: "Each stack extends duration and increases DoT damage"
    },
    { 
      name: "Range Extension", 
      effect: "+1 Range",
      stackable: true,
      description: "Each stack increases spell/skill range by 1"
    },
    { 
      name: "Life Steal", 
      effect: `+${stealSettings.lifeStealPercent}% life steal`,
      stackable: true,
      description: `Each stack adds ${stealSettings.lifeStealPercent}% of damage dealt as healing`
    },
    { 
      name: "Mana Steal", 
      effect: `+${stealSettings.manaStealPercent}% mana steal`,
      stackable: true,
      description: `Each stack adds ${stealSettings.manaStealPercent}% of damage dealt as mana recovery`
    }
  ]);

  // Derived calculations
  let costs = $derived.by(() => {
    if (enhancements.length === 0) {
      return {
        totalAPCost: baseSpell.apCost,
        totalMPCost: baseSpell.mpCost,
        enhancementAPCost: 0,
        enhancementMPCost: 0
      };
    }

    const enhancementAPCost = enhancements.length + (enhancements.find(e => e.name === 'Multi-Target') ? 1 : 0);
    const enhancementMPCost = Math.ceil(baseSpell.mpCost * Math.pow(1.25, enhancements.length)) - baseSpell.mpCost;
    
    return {
      totalAPCost: baseSpell.apCost + enhancementAPCost,
      totalMPCost: baseSpell.mpCost + enhancementMPCost,
      enhancementAPCost,
      enhancementMPCost: enhancementMPCost
    };
  });

  let spellEffects = $derived.by(() => {
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

    // Count enhancement stacks
    const enhancementCounts: Record<string, number> = {};
    enhancements.forEach(enhancement => {
      enhancementCounts[enhancement.name] = (enhancementCounts[enhancement.name] || 0) + 1;
    });

    // Apply enhancement effects
    if (enhancementCounts["Critical Hit Chance"]) {
      critChance += enhancementCounts["Critical Hit Chance"] * 15;
    }
    
    if (enhancementCounts["Critical Hit Damage"]) {
      critMultiplier *= Math.pow(1.5, enhancementCounts["Critical Hit Damage"]);
    }
    
    if (enhancementCounts["Raw Damage"]) {
      const damageBoostPercent = enhancementCounts["Raw Damage"] * damageSettings.rawDamagePercent;
      baseDamage = Math.ceil(baseDamage * (1 + damageBoostPercent / 100));
    }
    
    if (enhancementCounts["Multi-Target"]) {
      isMultiTarget = true;
      targets = enemyCount;
      damageMultiplier = 0.5;
    }
    
    if (enhancementCounts["Penetration"]) {
      defenseIgnore = Math.min(90, enhancementCounts["Penetration"] * 30);
    }
    
    if (enhancementCounts["Elemental Boost"]) {
      hasDoT = true;
      dotDuration = 3 + enhancementCounts["Elemental Boost"] - 1;
    }

    if (enhancementCounts["Range Extension"]) {
      // Range extension doesn't affect damage calculations but could be tracked
      // for UI purposes in the future
    }

    if (enhancementCounts["Life Steal"]) {
      lifeStealPercent = enhancementCounts["Life Steal"] * stealSettings.lifeStealPercent;
    }

    if (enhancementCounts["Mana Steal"]) {
      manaStealPercent = enhancementCounts["Mana Steal"] * stealSettings.manaStealPercent;
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
  });

  let apRecovery = $derived.by(() => {
    if (enhancements.length === 0) return Math.floor(character.maxAP * 0.6);
    
    const enhancementAPCost = enhancements.length;
    const apRecoveryAmount = Math.max(1,Math.floor(enhancementAPCost * (apRecoverySettings.recoveryPercent / 100)));
    
    return apRecoveryAmount;
  });

  let canCast = $derived(character.currentAP >= costs.totalAPCost && character.currentMP >= costs.totalMPCost && !turnEnded);

  // Actions
  function addEnhancement(enhancement: Enhancement): void {
    if (enhancement.name === "Multi-Target" && enhancements.some(e => e.name === "Multi-Target")) {
      return;
    }
    enhancements = [...enhancements, enhancement];
  }

  function removeEnhancement(index: number): void {
    enhancements = enhancements.filter((_, i) => i !== index);
  }

  function castSpell(): boolean {
    if (character.currentAP >= costs.totalAPCost && character.currentMP >= costs.totalMPCost) {
      character.currentAP -= costs.totalAPCost;
      character.currentMP -= costs.totalMPCost;
      if (enhancements.length > 0) turnEnded = true;
      return true;
    }
    console.log("Insufficient resources - AP:", character.currentAP, "needed:", costs.totalAPCost, "MP:", character.currentMP, "needed:", costs.totalMPCost);
    return false;
  }

  function nextTurn(): void {
    character.currentAP = Math.min(character.maxAP, character.currentAP + apRecovery);
    character.currentMP = character.maxMP;
    turnEnded = false;
    enhancements = [];
  }

  function resetCharacter(): void {
    character.currentAP = character.maxAP;
    character.currentHP = character.maxHP;
    character.currentMP = character.maxMP;
    turnEnded = false;
    enhancements = [];
  }
</script>

<div class="calculator-container">
  <h1 class="title">Enhancement System Calculator</h1>
  
  <!-- Desktop Layout -->
  <div class="desktop-layout">
    <div class="desktop-column">
      <CharacterStats 
        {character}
        {costs}
        {apRecovery}
        {resetCharacter}
        {nextTurn}
      />

      <SpellConfiguration 
        {baseSpell}
        bind:enemyCount
      />

      <EnhancementSettings 
        {damageSettings}
        {stealSettings}
        {apRecoverySettings}
      />
    </div>

    <div class="desktop-column">
      <EnhancementSelector 
        {availableEnhancements}
        {enhancements}
        {enemyCount}
        {addEnhancement}
      />

      <EnhancementStack 
        {enhancements}
        {removeEnhancement}
      />
    </div>

    <div class="desktop-column">
      <SpellEffects 
        {baseSpell}
        {spellEffects}
      />

      <CostBreakdown 
        {character}
        {baseSpell}
        {costs}
        {enhancements}
        {apRecovery}
        {apRecoverySettings}
        {canCast}
        {castSpell}
      />
    </div>
  </div>

  <!-- Mobile/Tablet Layout -->
  <div class="mobile-layout">
    <CharacterStats 
      {character}
      {costs}
      {apRecovery}
      {resetCharacter}
      {nextTurn}
    />

    <SpellConfiguration 
      {baseSpell}
      bind:enemyCount
    />

    <EnhancementSettings 
      {damageSettings}
      {stealSettings}
      {apRecoverySettings}
    />

    <EnhancementSelector 
      {availableEnhancements}
      {enhancements}
      {enemyCount}
      {addEnhancement}
    />

    <EnhancementStack 
      {enhancements}
      {removeEnhancement}
    />

    <div class="full-width">
      <SpellEffects 
        {baseSpell}
        {spellEffects}
      />
    </div>

    <div class="full-width">
      <CostBreakdown 
        {character}
        {baseSpell}
        {costs}
        {enhancements}
        {apRecovery}
        {apRecoverySettings}
        {canCast}
        {castSpell}
      />
    </div>
  </div>
</div>

<style>
  .calculator-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    background-color: var(--bg-primary);
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: var(--transition-theme);
  }

  .title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 32px;
    color: var(--text-primary);
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .desktop-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  /* Responsive breakpoints */
  @media (min-width: 1024px) {
    .mobile-layout {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 1280px) {
    .desktop-layout {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .mobile-layout {
      display: none;
    }
  }

  /* Global styles that child components will inherit */
  :global(.card) {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px var(--shadow-light);
    transition: var(--transition-theme);
  }

  :global(.card-title) {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  :global(.btn) {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-theme);
  }

  :global(.btn:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }

  :global(.btn-primary) {
    background-color: var(--color-primary);
    color: var(--text-inverse);
  }

  :global(.btn-primary:hover:not(:disabled)) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px var(--shadow-medium);
  }

  :global(.btn-secondary) {
    background-color: var(--color-secondary);
    color: var(--text-inverse);
  }

  :global(.btn-secondary:hover:not(:disabled)) {
    background-color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px var(--shadow-medium);
  }

  :global(.btn-danger) {
    background-color: var(--color-error);
    color: var(--text-inverse);
    font-size: 18px;
    padding: 16px 24px;
  }

  :global(.btn-danger:hover:not(:disabled)) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-medium);
  }

  :global(.btn-danger:disabled) {
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  :global(.form-group) {
    margin-bottom: 12px;
  }

  :global(.form-label) {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  :global(.form-input) {
    width: 100%;
    padding: 8px 12px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
    transition: var(--transition-theme);
  }

  :global(.form-input:focus) {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
  }

  :global(.form-hint) {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
</style>