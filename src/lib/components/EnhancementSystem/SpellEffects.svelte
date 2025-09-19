<script lang="ts">
  import type { BaseSpell, SpellEffects } from '$lib/types/enhancement';

  interface Props {
    baseSpell: BaseSpell;
    spellEffects: SpellEffects;
  }

  let { baseSpell, spellEffects }: Props = $props();
  
  // Helper function to format percentage change
  function formatPercentageChange(afterValue: number, beforeValue: number): string {
    return ((afterValue - beforeValue) / beforeValue * 100).toFixed(0);
  }
</script>

<div class="card">
  <h2 class="card-title">Enhanced {baseSpell.name} Effects</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-number damage">{spellEffects.damage}</div>
      <div class="stat-label">Damage per Target</div>
      {#if spellEffects.enhancementCounts["Raw Damage"]}
        <div class="stat-detail">
          +{formatPercentageChange(spellEffects.baseDamageAfterRaw, baseSpell.baseDamage)}% from raw damage 
          ({spellEffects.baseDamageAfterRaw - baseSpell.baseDamage} damage)
        </div>
      {/if}
    </div>
    
    <div class="stat-card">
      <div class="stat-number crit">{spellEffects.critChance}%</div>
      <div class="stat-label">Crit Chance</div>
      <div class="stat-detail crit">({spellEffects.critDamage} crit damage)</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-number targets">{spellEffects.targets}</div>
      <div class="stat-label">Target{spellEffects.targets > 1 ? 's' : ''}</div>
      {#if spellEffects.isMultiTarget}
        <div class="stat-detail multi">Multi-Target: 50% damage each</div>
      {/if}
    </div>
    
    <div class="stat-card">
      <div class="stat-number defense">{spellEffects.defenseIgnore}%</div>
      <div class="stat-label">Defense Ignore</div>
      {#if spellEffects.hasDoT}
        <div class="stat-detail dot">+DoT ({spellEffects.dotDuration} turns)</div>
      {/if}
    </div>
  </div>

  {#if Object.keys(spellEffects.enhancementCounts).length > 0}
    <div class="enhancement-summary">
      <h3 class="summary-title">Active Enhancement Stacks:</h3>
      <div class="summary-grid">
        {#each Object.entries(spellEffects.enhancementCounts) as [name, count]}
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
      <span class="total-damage">{spellEffects.damage * spellEffects.targets}</span> total damage 
      ({spellEffects.damage} × {spellEffects.targets} target{spellEffects.targets > 1 ? 's' : ''})
    </div>
    <div class="output-detail">
      Expected crit damage: <span class="output-crit">{spellEffects.critDamage * spellEffects.targets}</span>
    </div>
    
    {#if spellEffects.lifeStealAmount > 0}
      <div class="output-detail" style="color: #16a34a;">
        Life Steal: +{spellEffects.lifeStealAmount} HP ({spellEffects.lifeStealPercent}%)
        {#if spellEffects.critLifeStealAmount !== spellEffects.lifeStealAmount}
          <span> | On Crit: +{spellEffects.critLifeStealAmount} HP</span>
        {/if}
      </div>
    {/if}
    
    {#if spellEffects.manaStealAmount > 0}
      <div class="output-detail" style="color: #2563eb;">
        Mana Steal: +{spellEffects.manaStealAmount} MP ({spellEffects.manaStealPercent}%)
        {#if spellEffects.critManaStealAmount !== spellEffects.manaStealAmount}
          <span> | On Crit: +{spellEffects.critManaStealAmount} MP</span>
        {/if}
      </div>
    {/if}
    
    {#if spellEffects.hasDoT}
      <div class="output-detail dot">
        + Fire DoT for {spellEffects.dotDuration} turns
      </div>
    {/if}
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    text-align: center;
  }

  .stat-number {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stat-number.damage {
    color: #dc2626;
  }

  .stat-number.crit {
    color: #d97706;
  }

  .stat-number.targets {
    color: #2563eb;
  }

  .stat-number.defense {
    color: #16a34a;
  }

  .stat-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .stat-detail {
    font-size: 12px;
    color: #16a34a;
  }

  .stat-detail.crit {
    color: #7c3aed;
  }

  .stat-detail.multi {
    color: #ea580c;
  }

  .stat-detail.dot {
    color: #dc2626;
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
    margin-bottom: 16px;
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

  .output-main .total-damage {
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

  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }
</style>