<script lang="ts">
  import Card from './Card.svelte';
  import EnhancementItem from './EnhancementItem.svelte';
  import type { IEnhancement } from '../types';

  let { availableEnhancements, enhancements, enemyCount, addEnhancement }: { 
    availableEnhancements: IEnhancement[]; 
    enhancements: IEnhancement[]; 
    enemyCount: number; 
    addEnhancement: (enhancement: IEnhancement) => void 
  } = $props();
</script>

<Card title="Available Enhancements">
  <div class="enhancement-list" style="max-height: 400px; overflow-y: auto;">
    {#each availableEnhancements as enhancement (enhancement.name)}
      {#if !(enhancement.name === 'Multi-Target' && (enemyCount < 2 || enhancements.some(e => e.name === 'Multi-Target')))}
        <EnhancementItem {enhancement} onAdd={() => addEnhancement(enhancement)} />
      {/if}
    {/each}
  </div>
</Card>

<style>
  .enhancement-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>