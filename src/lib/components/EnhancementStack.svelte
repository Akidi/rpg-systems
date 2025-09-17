<script lang="ts">
  import Card from './Card.svelte';
  import EnhancementItem from './EnhancementItem.svelte';
  import type { IEnhancement } from '../types';

  let { enhancements, removeEnhancement }: { enhancements: IEnhancement[]; removeEnhancement: (index: number) => void } = $props();
</script>

<Card title="Enhancement Stack ({enhancements.length})">
  {#if enhancements.length === 0}
    <p class="empty-state">No enhancements selected</p>
  {:else}
    <div class="enhancement-stack" style="max-height: 300px; overflow-y: auto;">
      {#each enhancements as enhancement, index (index)}
        <div class="stack-item">
          <EnhancementItem {enhancement} onAdd={() => {}} />
          <button onclick={() => removeEnhancement(index)} class="remove-btn">✕</button>
        </div>
      {/each}
    </div>
  {/if}
</Card>

<style>
  .enhancement-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stack-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fef3c7;
    padding: 8px;
    border-radius: 6px;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #dc2626;
    font-weight: bold;
    cursor: pointer;
    font-size: 18px;
  }

  .remove-btn:hover {
    color: #991b1b;
  }

  .empty-state {
    color: #6b7280;
    font-style: italic;
  }
</style>