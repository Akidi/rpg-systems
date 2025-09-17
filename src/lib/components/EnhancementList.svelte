<script lang="ts">
  import Card from './Card.svelte';
  import Button from './Button.svelte';
  import type { IEnhancement } from '../types';

  let { 
    availableEnhancements, 
    enhancements, 
    enemyCount, 
    addEnhancement
  }: { 
    availableEnhancements: IEnhancement[]; 
    enhancements: IEnhancement[]; 
    enemyCount: number; 
    addEnhancement: (enhancement: IEnhancement) => void;
  } = $props();

  function isDisabled(enhancement: IEnhancement) {
    return enhancement.name === 'Multi-Target' && enhancements.some(e => e.name === 'Multi-Target');
  }

  let groupedEnhancements = $derived.by(() => {
    const groups: Record<string, IEnhancement[]> = {
      Damage: [],
      Utility: [],
      Defensive: []
    };
    for (const enh of availableEnhancements) {
      // Compute dynamic effect for Multi-Target
      const effect = enh.name === 'Multi-Target' 
        ? `Hit ${enemyCount} enemies (50% damage each, total ${Math.round(50 * enemyCount)} damage)`
        : enh.effect;
      groups[enh.category].push({ ...enh, effect });
    }
    return groups;
  });
</script>

<Card title="Available Enhancements">
  {#each Object.entries(groupedEnhancements) as [category, enhs] (category)}
    {#if enhs.length > 0}
      <h3 class="category-title">{category}</h3>
      {#each enhs as enhancement (enhancement.name)}
        <div class="enhancement-row">
          <div class="enhancement-details">
            <h3 class="enhancement-name">
              <span class="tooltip" data-tooltip={enhancement.description}>
                {enhancement.name}
                <span class="tooltip-text">{enhancement.description}</span>
              </span>
            </h3>
            <p class="enhancement-effect">{enhancement.effect}</p>
          </div>
          <Button 
            variant="primary" 
            disabled={isDisabled(enhancement)} 
            onClick={() => addEnhancement(enhancement)}
          >
            Add{enhancement.stackable ? ' Stack' : ''}
          </Button>
        </div>
      {/each}
    {/if}
  {/each}
</Card>

<style>
  .category-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 16px 12px 8px;
  }

  .enhancement-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .enhancement-row:last-child {
    border-bottom: none;
  }

  .enhancement-details {
    flex: 1;
  }

  .enhancement-name {
    font-weight: 600;
    font-size: 16px;
    color: #374151;
    position: relative;
  }

  .enhancement-effect {
    font-size: 14px;
    color: #2563eb;
    margin: 4px 0;
  }

  .tooltip {
    position: relative;
    cursor: pointer;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  .tooltip-text {
    visibility: hidden;
    opacity: 0;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    font-size: 12px;
    transition: opacity 0.2s;
  }
</style>