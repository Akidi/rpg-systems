<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import CharacterStats from '$lib/components/CharacterStats.svelte';
  import SpellConfig from '$lib/components/SpellConfig.svelte';
  import EnhancementSettings from '$lib/components/EnhancementSettings.svelte';
  import EnhancementList from '$lib/components/EnhancementList.svelte';
  import EnhancementStack from '$lib/components/EnhancementStack.svelte';
  import SpellEffects from '$lib/components/SpellEffects.svelte';
  import SpellCosts from '$lib/components/SpellCosts.svelte';
  import { calculateEnhancedSpell, calculateSpellEffects } from '$lib/composables/calculator';
  import type { Character, BaseSpell, StealSettings, IDamageSettings, IEnhancement, ISpellCosts, ISpellEffects } from '$lib/types';

  // Load initial state from localStorage or use defaults
  let character = $state<Character>(
    JSON.parse(localStorage.getItem('character') || 'null') || {
      maxAP: 12, currentAP: 12, maxHP: 1000, currentHP: 1000,
      maxMP: 1000, currentMP: 1000
    }
  );
  let baseSpell = $state<BaseSpell>(
    JSON.parse(localStorage.getItem('baseSpell') || 'null') || {
      name: 'Fireball', apCost: 2, mpCost: 100, baseDamage: 50
    }
  );
  let stealSettings = $state<StealSettings>(
    JSON.parse(localStorage.getItem('stealSettings') || 'null') || {
      lifeStealPercent: 2, manaStealPercent: 3
    }
  );
  let damageSettings = $state<IDamageSettings>(
    JSON.parse(localStorage.getItem('damageSettings') || 'null') || {
      rawDamagePercent: 15
    }
  );
  let enhancements = $state<IEnhancement[]>(
    JSON.parse(localStorage.getItem('enhancements') || 'null') || []
  );
  let enemyCount = $state<number>(
    JSON.parse(localStorage.getItem('enemyCount') || 'null') || 3
  );

  // Save state to localStorage on changes
  $effect(() => {
    localStorage.setItem('character', JSON.stringify(character));
    localStorage.setItem('baseSpell', JSON.stringify(baseSpell));
    localStorage.setItem('stealSettings', JSON.stringify(stealSettings));
    localStorage.setItem('damageSettings', JSON.stringify(damageSettings));
    localStorage.setItem('enhancements', JSON.stringify(enhancements));
    localStorage.setItem('enemyCount', JSON.stringify(enemyCount));
  });

  let availableEnhancements = $state<IEnhancement[]>([
    { name: 'Critical Hit Chance', category:"Utility", effect: '+15% crit chance', stackable: true, description: 'Each stack adds 15% crit chance' },
    { name: 'Critical Hit Damage', category: "Damage", effect: '+50% crit damage', stackable: true, description: 'Each stack multiplies crit damage by 1.5x' },
    { name: 'Raw Damage', category: "Damage", effect: '', stackable: true, description: 'Each stack adds 15% damage multiplier' },
    { name: 'Multi-Target', category:"Utility", effect: 'Hit all enemies (50% damage)', stackable: false, description: 'One-time enhancement: converts to AoE with 50% damage per target' },
    { name: 'Penetration', category: "Damage", effect: 'Ignore 30% defense', stackable: true, description: 'Each stack adds 30% defense ignore (max 90%)' },
    { name: 'Elemental Boost', category: "Damage", effect: '+Fire DoT (3 turns)', stackable: true, description: 'Each stack extends duration and increases DoT damage' },
    { name: 'Life Steal', category:"Utility", effect: '', stackable: true, description: 'Each stack adds 2% of damage dealt as healing' },
    { name: 'Mana Steal', category: "Utility", effect: '', stackable: true, description: 'Each stack adds 3% of damage dealt as mana recovery' }
  ]);

  let displayedAvailableEnhancements: IEnhancement[] = $derived.by(() => availableEnhancements.map(enh => ({
    ...enh,
    effect: enh.name === 'Raw Damage' ? `+${damageSettings.rawDamagePercent}% damage` :
            enh.name === 'Life Steal' ? `+${stealSettings.lifeStealPercent}% life steal` :
            enh.name === 'Mana Steal' ? `+${stealSettings.manaStealPercent}% mana steal` :
            enh.effect
  })));

  let displayedEnhancements: IEnhancement[] = $derived.by(() => enhancements.map(enh => ({
    ...enh,
    effect: enh.name === 'Raw Damage' ? `+${damageSettings.rawDamagePercent}% damage` :
            enh.name === 'Life Steal' ? `+${stealSettings.lifeStealPercent}% life steal` :
            enh.name === 'Mana Steal' ? `+${stealSettings.manaStealPercent}% mana steal` :
            enh.effect
  })));

  let costs: ISpellCosts = $derived.by(() => calculateEnhancedSpell(baseSpell, enhancements));

  let spellEffects: ISpellEffects = $derived.by(() => calculateSpellEffects(baseSpell, enhancements, enemyCount, damageSettings, stealSettings));

  let canCast = $derived(character.currentAP >= costs.totalAPCost && character.currentMP >= costs.totalMPCost);

  function addEnhancement(enhancement: IEnhancement) {
    if (enhancement.name === 'Multi-Target' && enhancements.some(e => e.name === 'Multi-Target')) return;
    enhancements = [...enhancements, { ...enhancement }];
  }

  function removeEnhancement(index: number) {
    enhancements = enhancements.filter((_, i) => i !== index);
  }

  function castSpell() {
    if (canCast) {
      character.currentAP = 0;
      character.currentMP -= costs.totalMPCost;
    } else {
      console.log('Insufficient resources');
    }
  }

  function resetEnhancements() {
    enhancements = [];
  }

  function nextTurnEnhancements() {
    enhancements = [];
  }
</script>

<div class="calculator-container">
  <h1 class="title">Enhancement System Calculator</h1>
  <div class="calculator-container">
    <h1 class="title">Enhancement System Calculator</h1>
    <Button variant="secondary" onClick={() => localStorage.clear()}>Clear Saved Settings</Button>
    <!-- Rest of the template remains the same -->
  </div>
  <!-- Desktop Layout -->
  <div class="desktop-layout">
    <div class="desktop-column">
      <CharacterStats bind:character {baseSpell} {enhancements} {costs} {resetEnhancements} {nextTurnEnhancements} />
      <SpellConfig {baseSpell} {enemyCount} />
      <EnhancementSettings {damageSettings} {stealSettings} />
    </div>
    <div class="desktop-column">
      <EnhancementList availableEnhancements={displayedAvailableEnhancements} enhancements={displayedEnhancements} {enemyCount} {addEnhancement} />
      <EnhancementStack enhancements={displayedEnhancements} {removeEnhancement} />
    </div>
    <div class="desktop-column">
      <SpellEffects {baseSpell} {enhancements} {enemyCount} {damageSettings} {stealSettings} className="full-width" />
      <SpellCosts {baseSpell} {enhancements} {character} {costs} {canCast} {castSpell} className="full-width" />
    </div>
  </div>

  <!-- Mobile Layout -->
  <div class="mobile-layout">
    <CharacterStats bind:character {baseSpell} {enhancements} {costs} {resetEnhancements} {nextTurnEnhancements} />
    <SpellConfig {baseSpell} {enemyCount} />
    <EnhancementSettings {damageSettings} {stealSettings} />
    <EnhancementList availableEnhancements={displayedAvailableEnhancements} enhancements={displayedEnhancements} {enemyCount} {addEnhancement} />
    <EnhancementStack enhancements={displayedEnhancements} {removeEnhancement} />
    <SpellEffects {baseSpell} {enhancements} {enemyCount} {damageSettings} {stealSettings} className="full-width" />
    <SpellCosts {baseSpell} {enhancements} {character} {costs} {canCast} {castSpell} className="full-width" />
  </div>
</div>

<style>
  .calculator-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    background-color: #f5f5f5;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 32px;
    color: #333;
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }


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

    .desktop-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }
</style>