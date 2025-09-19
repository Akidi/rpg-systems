<script lang="ts">
  import type { BaseSpell } from '$lib/types/enhancement';

  interface Props {
    baseSpell: BaseSpell;
    enemyCount: number;
  }

  let { baseSpell = $bindable(), enemyCount = $bindable() }: Props = $props();
</script>

<div class="card">
  <h2 class="card-title">Base Spell & Battlefield</h2>
  <div class="form-group">
    <label class="form-label" for="spell-name">Spell Name:</label>
    <input 
      id="spell-name"
      type="text" 
      bind:value={baseSpell.name}
      class="form-input"
    />
  </div>
  <div class="form-group">
    <label class="form-label" for="base-ap-cost">Base AP Cost:</label>
    <input 
      id="base-ap-cost"
      type="number" 
      bind:value={baseSpell.apCost}
      class="form-input"
      min="0"
    />
  </div>
  <div class="form-group">
    <label class="form-label" for="base-mp-cost">Base MP Cost:</label>
    <input 
      id="base-mp-cost"
      type="number" 
      bind:value={baseSpell.mpCost}
      class="form-input"
      min="0"
    />
  </div>
  <div class="form-group">
    <label class="form-label" for="base-damage">Base Damage:</label>
    <input 
      id="base-damage"
      type="number" 
      bind:value={baseSpell.baseDamage}
      class="form-input"
      min="0"
    />
  </div>
  <div class="form-group">
    <label class="form-label" for="enemy-count">Enemy Count:</label>
    <input 
      id="enemy-count"
      type="number" 
      bind:value={enemyCount}
      class="form-input"
      min="1"
      max="10"
    />
    <div class="form-hint">
      Multi-Target only available with 2+ enemies
    </div>
  </div>
</div>