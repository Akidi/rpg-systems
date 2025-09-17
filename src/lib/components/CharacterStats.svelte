<script lang="ts">
  import Card from './Card.svelte';
  import Button from './Button.svelte';
  import StatRow from './StatRow.svelte';
  import { calculateAPRecovery } from '../composables/calculator';
  import type { Character, BaseSpell, IEnhancement, ISpellCosts } from '../types';

  let { 
    character = $bindable(), 
    baseSpell, 
    enhancements, 
    costs, 
    resetEnhancements, 
    nextTurnEnhancements 
  }: { 
    character: Character; 
    baseSpell: BaseSpell; 
    enhancements: IEnhancement[]; 
    costs: ISpellCosts;
    resetEnhancements: () => void;
    nextTurnEnhancements: () => void;
  } = $props();

  let apRecovery = $derived(calculateAPRecovery(character, baseSpell, enhancements));

  function handleReset() {
    character.currentAP = character.maxAP;
    character.currentHP = character.maxHP;
    character.currentMP = character.maxMP;
    resetEnhancements();
  }

  function handleNextTurn() {
    character.currentAP = Math.min(character.maxAP, apRecovery);
    character.currentMP = character.maxMP;
    nextTurnEnhancements();
  }
</script>

<Card title="Character Stats">
  <StatRow label="AP" value="{character.currentAP}/{character.maxAP}" insufficient={character.currentAP < costs.totalAPCost} />
  <StatRow label="HP" value="{character.currentHP}/{character.maxHP}" />
  <StatRow label="MP" value="{character.currentMP}/{character.maxMP}" insufficient={character.currentMP < costs.totalMPCost} mp />

  <div class="button-group">
    <Button variant="secondary" onClick={handleReset}>Reset Character</Button>
    <Button variant="primary" disabled={character.currentAP === character.maxAP} onClick={handleNextTurn}>
      Next Turn (AP Recovery: {apRecovery})
    </Button>
  </div>
</Card>

<style>
  .button-group {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>