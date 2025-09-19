<!-- $lib/components/CharacterStats.svelte -->
<script lang="ts">
  import type { Character, Costs } from '$lib/types/enhancement';

  interface Props {
    character: Character;
    costs: Costs;
    apRecovery: number;
    resetCharacter: () => void;
    nextTurn: () => void;
  }

  let { character, costs, apRecovery, resetCharacter, nextTurn }: Props = $props();
</script>

<div class="card">
  <h2 class="card-title">Character Stats</h2>
  <div class="stat-row">
    <span>AP:</span>
    <span class="stat-value {character.currentAP < costs.totalAPCost ? 'stat-insufficient' : 'stat-sufficient'}">
      {character.currentAP}/{character.maxAP}
    </span>
  </div>
  <div class="stat-row">
    <span>HP:</span>
    <span class="stat-value">{character.currentHP}/{character.maxHP}</span>
  </div>
  <div class="stat-row">
    <span>MP:</span>
    <span class="stat-value {character.currentMP < costs.totalMPCost ? 'stat-insufficient' : 'stat-mp'}">
      {character.currentMP}/{character.maxMP}
    </span>
  </div>
  
  <div class="button-group">
    <button onclick={resetCharacter} class="btn btn-secondary">
      Reset Character
    </button>
    <button 
      onclick={nextTurn}
      class="btn btn-primary"
      disabled={character.currentAP === character.maxAP}
    >
      Next Turn (AP Recovery: {apRecovery})
    </button>
  </div>
</div>

<style>
  .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-value {
    font-weight: 600;
  }

  .stat-insufficient {
    color: #dc2626;
    font-weight: bold;
  }

  .stat-sufficient {
    color: #16a34a;
  }

  .stat-mp {
    color: #2563eb;
  }

  .button-group {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>