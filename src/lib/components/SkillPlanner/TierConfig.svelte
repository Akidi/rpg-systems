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
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 0;
    margin-bottom: 1rem;
    transition: var(--transition-theme);
    box-shadow: 0 8px 32px var(--shadow-light);
    overflow: hidden;
    position: relative;
  }

  .tier-config::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));
    border-radius: 16px 16px 0 0;
  }

  .config-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    padding: 1.25rem 1.5rem 1rem 1.5rem;
    color: var(--text-inverse);
    position: relative;
    overflow: hidden;
  }

  .config-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255,255,255,0.05) 10px,
      rgba(255,255,255,0.05) 20px
    );
    animation: configPattern 15s linear infinite;
  }

  @keyframes configPattern {
    0% { transform: translateX(-20px); }
    100% { transform: translateX(20px); }
  }

  .config-header h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .config-actions {
    display: flex;
    gap: 0.75rem;
    position: relative;
    z-index: 2;
  }

  .btn-add, .btn-reset {
    background: rgba(255,255,255,0.2);
    color: var(--text-inverse);
    border: 2px solid rgba(255,255,255,0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .btn-add::before, .btn-reset::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  .btn-add:hover::before, .btn-reset:hover::before {
    left: 100%;
  }

  .btn-add:hover, .btn-reset:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .tier-content {
    padding: 1.5rem;
  }

  .tier-list {
    display: grid;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .tier-list::-webkit-scrollbar {
    width: 6px;
  }

  .tier-list::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }

  .tier-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 3px;
  }

  .tier-item {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    padding: 0;
    transition: var(--transition-theme);
    box-shadow: 0 4px 16px var(--shadow-light);
    overflow: hidden;
    position: relative;
  }

  .tier-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  }

  .tier-item:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-medium);
  }

  .tier-header {
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-primary);
  }

  .tier-label {
    font-weight: 800;
    color: var(--color-primary);
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px var(--shadow-light);
  }

  .btn-remove {
    background: linear-gradient(135deg, var(--color-error) 0%, var(--color-primary) 100%);
    color: var(--text-inverse);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 900;
    transition: var(--transition-theme);
    box-shadow: 0 4px 12px var(--shadow-medium);
    position: relative;
    overflow: hidden;
  }

  .btn-remove::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.3s;
  }

  .btn-remove:hover::before {
    left: 100%;
  }

  .btn-remove:hover {
    transform: scale(1.15) rotate(90deg);
    box-shadow: 0 6px 20px var(--shadow-heavy);
  }

  .tier-fields {
    padding: 1.25rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .tier-field {
    position: relative;
  }

  .tier-field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .tier-field input {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    color: var(--text-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    transition: var(--transition-theme);
    box-shadow: inset 0 2px 4px var(--shadow-light);
    box-sizing: border-box;
  }

  .tier-field input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 
      inset 0 2px 4px var(--shadow-light),
      0 0 0 4px rgba(var(--color-primary), 0.2);
    transform: scale(1.02);
  }

  .tier-field input:hover:not(:focus) {
    border-color: var(--color-secondary);
    background: var(--bg-tertiary);
  }

  /* Enhanced visual feedback */
  .tier-field::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    transition: all 0.3s ease;
    transform: translateX(-50%);
    border-radius: 1px;
  }

  .tier-field input:focus + .tier-field::after,
  .tier-field:has(input:focus)::after {
    width: 100%;
  }

  /* Empty state */
  .tier-list:empty::before {
    content: 'No tiers configured yet. Add your first tier to get started.';
    display: block;
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    font-style: italic;
    background: var(--bg-tertiary);
    border: 2px dashed var(--border-secondary);
    border-radius: 8px;
    opacity: 0.7;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .config-header {
      padding: 1rem;
    }

    .config-header h3 {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }

    .config-actions {
      gap: 0.5rem;
    }

    .btn-add, .btn-reset {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .tier-content {
      padding: 1rem;
    }

    .tier-fields {
      padding: 1rem;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .tier-header {
      padding: 0.75rem 1rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .tier-header .btn-remove {
      align-self: flex-end;
      width: 28px;
      height: 28px;
    }

    .tier-list {
      max-height: 300px;
    }
  }

  @media (max-width: 480px) {
    .tier-field input {
      padding: 0.625rem;
      font-size: 0.9rem;
    }

    .config-actions {
      flex-direction: column;
    }

    .btn-add, .btn-reset {
      width: 100%;
    }
  }
</style>