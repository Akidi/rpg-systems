<script lang="ts">
  import Card from './Card.svelte';
  import StatCard from './StatCard.svelte';
  import { calculateSpellEffects } from '../composables/calculator';
  import type { BaseSpell, IEnhancement, IDamageSettings, StealSettings } from '../types';

  let { 
    baseSpell, 
    enhancements, 
    enemyCount, 
    damageSettings, 
    stealSettings,
    className = ''
  }: { 
    baseSpell: BaseSpell; 
    enhancements: IEnhancement[]; 
    enemyCount: number; 
    damageSettings: IDamageSettings; 
    stealSettings: StealSettings;
    className?: string;
  } = $props();

  let spellEffects = $derived(calculateSpellEffects(baseSpell, enhancements, enemyCount, damageSettings, stealSettings));
</script>

<Card title="Enhanced {baseSpell.name} Effects" className={className}>
  <div class="stats-grid">
    <StatCard 
      number={spellEffects.damage} 
      label="Damage per Target" 
      colorClass="damage" 
      detail={spellEffects.enhancementCounts['Raw Damage'] ? `+${((spellEffects.baseDamageAfterRaw - baseSpell.baseDamage) / baseSpell.baseDamage * 100).toFixed(0)}% from raw damage (${spellEffects.baseDamageAfterRaw - baseSpell.baseDamage} damage)` : null} 
    />
    <StatCard number={`${spellEffects.critChance}%`} label="Crit Chance" colorClass="crit" detail={`(${spellEffects.critDamage} crit damage)`} />
    <StatCard number={spellEffects.targets} label={`Target${spellEffects.targets > 1 ? 's' : ''}`} colorClass="targets" detail={spellEffects.isMultiTarget ? 'Multi-Target: 50% damage each' : null} />
    <StatCard number={`${spellEffects.defenseIgnore}%`} label="Defense Ignore" colorClass="defense" detail={spellEffects.hasDoT ? `+DoT (${spellEffects.dotDuration} turns)` : null} />
  </div>

  {#if Object.keys(spellEffects.enhancementCounts).length > 0}
    <div class="enhancement-summary">
      <h3 class="summary-title">Active Enhancement Stacks:</h3>
      <div class="summary-grid">
        {#each Object.entries(spellEffects.enhancementCounts) as [name, count] (name)}
          <div class="summary-row">
            <span>{name}:</span>
            <span class="summary-value">×{count}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="damage-output">
    <h3 class="output-title">Total Damage Output</h3>
    <div class="output-main">
      <span class="total-damage">{spellEffects.totalDamageOutput}</span> total damage 
      ({spellEffects.damage} × {spellEffects.targets} target{spellEffects.targets > 1 ? 's' : ''})
    </div>
    <div class="output-detail">
      Expected crit damage: <span class="output-crit">{spellEffects.critDamage * spellEffects.targets}</span>
    </div>
    {#if spellEffects.lifeStealAmount > 0}
      <div class="output-detail" style="color: #16a34a;">
        Life Steal: +{spellEffects.lifeStealAmount} HP ({spellEffects.lifeStealPercent}%)
        {#if spellEffects.critLifeStealAmount !== spellEffects.lifeStealAmount}
          | On Crit: +{spellEffects.critLifeStealAmount} HP
        {/if}
      </div>
    {/if}
    {#if spellEffects.manaStealAmount > 0}
      <div class="output-detail" style="color: #2563eb;">
        Mana Steal: +{spellEffects.manaStealAmount} MP ({spellEffects.manaStealPercent}%)
        {#if spellEffects.critManaStealAmount !== spellEffects.manaStealAmount}
          | On Crit: +{spellEffects.critManaStealAmount} MP
        {/if}
      </div>
    {/if}
    {#if spellEffects.hasDoT}
      <div class="output-detail dot">+ Fire DoT for {spellEffects.dotDuration} turns</div>
    {/if}
  </div>
</Card>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .enhancement-summary {
    background: #f9fafb;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
  }

  .summary-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    font-size: 14px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
  }

  .summary-value {
    font-weight: bold;
    color: #2563eb;
  }

  .damage-output {
    background: #fefce8;
    border-left: 4px solid #eab308;
    padding: 12px;
    border-radius: 6px;
  }

  .output-title {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
  }

  .output-main {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .total-damage {
    font-weight: bold;
    color: #dc2626;
  }

  .output-detail {
    font-size: 14px;
    color: #4b5563;
  }

  .output-crit {
    color: #7c3aed;
    font-weight: bold;
  }
</style>