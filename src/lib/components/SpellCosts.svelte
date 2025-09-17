<script lang="ts">
  import Card from './Card.svelte';
  import Button from './Button.svelte';
  import CostItem from './CostItem.svelte';
  import { calculateAPRecovery } from '../composables/calculator';
  import type { BaseSpell, IEnhancement, Character, ISpellCosts } from '../types';

  type Props = {
    baseSpell: BaseSpell
    enhancements: IEnhancement[]; 
    character: Character; 
    costs: ISpellCosts; 
    canCast: boolean;
    className?: string
    castSpell: () => void 
  }

  let { baseSpell, enhancements, character, costs, canCast, className='', castSpell }: Props = $props();

  let apRecovery = $derived(calculateAPRecovery(character, baseSpell, enhancements));
</script>

<Card title="Enhanced Spell Cost">
  <div class="costs-grid">
    <CostItem number={costs.totalAPCost} label="Total AP Cost" breakdown={`(${baseSpell.apCost} base + ${costs.enhancementAPCost})`} colorClass="ap" />
    <CostItem number={costs.totalMPCost} label="Total MP Cost" breakdown={`(${baseSpell.mpCost} base + ${costs.enhancementMPCost})`} colorClass="mp" />
    <CostItem number={Math.ceil(baseSpell.mpCost * Math.pow(1.25, enhancements.length))} label="Enhanced MP Total" breakdown={`(Base × 1.25^${enhancements.length})`} colorClass="enhanced" />
    <CostItem number={apRecovery} label="Next Turn AP" breakdown={`(30% of ${costs.enhancementAPCost} + remaining)`} colorClass="recovery" />
  </div>

  <div class="cast-section">
    <Button variant="danger" disabled={!canCast} onClick={castSpell}>
      {canCast ? `Cast Enhanced ${baseSpell.name}!` : 'Insufficient Resources'}
    </Button>
    {#if enhancements.length > 0}
      <p class="cast-warning">⚠️ Turn will end immediately after casting</p>
    {/if}
  </div>
</Card>

<style>
  .costs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .cast-section {
    text-align: center;
  }

  .cast-warning {
    font-size: 14px;
    color: #6b7280;
    margin-top: 8px;
  }
</style>