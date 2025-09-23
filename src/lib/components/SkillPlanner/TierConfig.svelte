<!-- $lib/components/SkillPlanner/TierConfig.svelte -->
<script lang="ts">
  import type { ITierConfig } from '$lib/types/skill-planner';
  
  export let tierConfigs: ITierConfig[] = [];
  export let onUpdate: (configs: ITierConfig[]) => void;

  function updateTier(index: number, field: keyof ITierConfig, value: number) {
    tierConfigs[index] = { ...tierConfigs[index], [field]: value };
    onUpdate([...tierConfigs]);
  }

  function addTier() {
    const newTier: ITierConfig = {
      tier: tierConfigs.length + 1,
      startRank: tierConfigs.length > 0 ? tierConfigs[tierConfigs.length - 1].endRank + 1 : 1,
      endRank: tierConfigs.length > 0 ? tierConfigs[tierConfigs.length - 1].endRank + 3 : 3,
      costPerRank: 1
    };
    tierConfigs = [...tierConfigs, newTier];
    onUpdate(tierConfigs);
  }

  function removeTier(index: number) {
    tierConfigs = tierConfigs.filter((_, i) => i !== index);
    onUpdate(tierConfigs);
  }

  function resetToDefaults() {
    const newTierConfigs: ITierConfig[] = [
      { tier: 1, startRank: 1, endRank: 3, costPerRank: 1 },
      { tier: 2, startRank: 4, endRank: 6, costPerRank: 4 },
      { tier: 3, startRank: 7, endRank: 9, costPerRank: 7 },
      { tier: 4, startRank: 10, endRank: 10, costPerRank: 10 }
    ];
    tierConfigs = newTierConfigs;
    onUpdate(tierConfigs);
  }
</script>

<div class="tier-config">
  <div class="config-header">
    <h3>Tier Configuration</h3>
    <div class="config-actions">
      <button on:click={addTier} class="btn-add">Add Tier</button>
      <button on:click={resetToDefaults} class="btn-reset">Reset to Defaults</button>
    </div>
  </div>

  <div class="tier-list">
    {#each tierConfigs as config, index}
      <div class="tier-item">
        <div class="tier-header">
          <span class="tier-label">Tier {config.tier}</span>
          {#if tierConfigs.length > 1}
            <button on:click={() => removeTier(index)} class="btn-remove">×</button>
          {/if}
        </div>
        
        <div class="tier-fields">
          <label>
            Start Rank:
            <input 
              type="number" 
              min="1" 
              value={config.startRank}
              on:input={(e) => updateTier(index, 'startRank', parseInt(e.currentTarget.value))}
            />
          </label>
          
          <label>
            End Rank:
            <input 
              type="number" 
              min={config.startRank}
              value={config.endRank}
              on:input={(e) => updateTier(index, 'endRank', parseInt(e.currentTarget.value))}
            />
          </label>
          
          <label>
            Cost per Rank:
            <input 
              type="number" 
              min="1" 
              value={config.costPerRank}
              on:input={(e) => updateTier(index, 'costPerRank', parseInt(e.currentTarget.value))}
            />
          </label>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .tier-config {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .config-header h3 {
    margin: 0;
    color: #495057;
  }

  .config-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-add, .btn-reset {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-reset {
    background: #6c757d;
  }

  .btn-add:hover {
    background: #0056b3;
  }

  .btn-reset:hover {
    background: #545b62;
  }

  .tier-list {
    display: grid;
    gap: 1rem;
  }

  .tier-item {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
  }

  .tier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .tier-label {
    font-weight: bold;
    color: #495057;
  }

  .btn-remove {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
  }

  .btn-remove:hover {
    background: #c82333;
  }

  .tier-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .tier-fields label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .tier-fields input {
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .tier-fields input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
</style>