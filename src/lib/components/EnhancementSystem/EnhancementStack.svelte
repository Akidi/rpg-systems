<script lang="ts">
  import type { Enhancement } from '$lib/types/enhancement';

  interface Props {
    enhancements: Enhancement[];
    removeEnhancement: (index: number) => void;
  }

  let { enhancements, removeEnhancement }: Props = $props();
</script>

<div class="card">
  <h2 class="card-title">Enhancement Stack ({enhancements.length})</h2>
  {#if enhancements.length === 0}
    <p class="empty-state">No enhancements selected</p>
  {:else}
    <div class="enhancement-stack">
      {#each enhancements as enhancement, index}
        <div class="stack-item">
          <div>
            <div class="enhancement-name">{enhancement.name}</div>
            <div class="enhancement-effect">{enhancement.effect}</div>
          </div>
          <button
            onclick={() => removeEnhancement(index)}
            class="remove-btn"
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .empty-state {
    color: #6b7280;
    font-style: italic;
  }

  .enhancement-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .stack-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fef3c7;
    padding: 8px;
    border-radius: 6px;
  }

  .enhancement-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .enhancement-effect {
    font-size: 14px;
    color: #4b5563;
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
</style>