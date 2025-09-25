<!-- $lib/components/CostBreakdown.svelte -->
<script lang="ts">
  import type { BaseSpell, Costs, Enhancement, Character } from '$lib/types/enhancement';

  interface Props {
    baseSpell: BaseSpell;
    character: Character;
    costs: Costs;
    enhancements: Enhancement[];
    apRecoverySettings: Record<string, number>;
    apRecovery: number;
    canCast: boolean;
    castSpell: () => boolean;
  }

  let { baseSpell, costs, enhancements, apRecovery, character, apRecoverySettings, canCast, castSpell }: Props = $props();
</script>

<div class="card">
  <h2 class="card-title">Enhanced Spell Costs</h2>
  <div class="costs-grid">
    <div class="cost-item">
      <div class="cost-number ap">{costs.totalAPCost}</div>
      <div class="cost-label">Total AP Cost</div>
      <div class="cost-breakdown">({baseSpell.apCost} base + {costs.enhancementAPCost})</div>
    </div>
    
    <div class="cost-item">
      <div class="cost-number mp">{costs.totalMPCost}</div>
      <div class="cost-label">Total MP Cost</div>
      <div class="cost-breakdown">({baseSpell.mpCost} base + {costs.enhancementMPCost})</div>
    </div>
    
    <div class="cost-item">
      <div class="cost-number enhanced">{Math.ceil(baseSpell.mpCost * Math.pow(1.25, enhancements.length))}</div>
      <div class="cost-label">Enhanced MP Total</div>
      <div class="cost-breakdown">(Base × 1.25^{enhancements.length})</div>
    </div>
    
    <div class="cost-item">
      <div class="cost-number recovery">{apRecovery}</div>
      <div class="cost-label">Next Turn AP</div>
      {#if enhancements.length > 0}
      <div class="cost-breakdown">({apRecoverySettings.recoveryPercent}% ± 15% of {costs.enhancementAPCost} + remaining)</div>
      {:else}
      <div class="cost-breakdown">(60% ± 15% of {character.maxAP} + remaining)</div>
      {/if}
    </div>
  </div>
  
  <div class="cast-section">
    <button
      onclick={castSpell}
      disabled={!canCast}
      class="btn btn-danger"
    >
      {canCast ? `Cast Enhanced ${baseSpell.name}!` : "Insufficient Resources"}
    </button>
    {#if enhancements.length > 0}
      <p class="cast-warning">
        ⚠️ Turn will end immediately after casting
      </p>
    {/if}
  </div>
</div>

<style>
  .costs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .cost-item {
    text-align: center;
  }

  .cost-number {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
    transition: var(--transition-theme);
  }

  .cost-number.ap {
    color: var(--color-info);
  }

  .cost-number.mp {
    color: var(--color-mana);
  }

  .cost-number.enhanced {
    color: var(--color-accent);
  }

  .cost-number.recovery {
    color: var(--color-success);
  }

  .cost-label {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .cost-breakdown {
    font-size: 12px;
    color: var(--text-muted);
  }

  .cast-section {
    text-align: center;
  }

  .cast-warning {
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 8px;
  }

  @media (min-width: 640px) {
    .costs-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
  }
</style>