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
    color: var(--text-muted);
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
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-secondary);
    padding: 8px;
    border-radius: 6px;
    transition: var(--transition-theme);
  }

  .stack-item:hover {
    border-color: var(--color-primary);
    box-shadow: 0 1px 3px var(--shadow-light);
  }

  .enhancement-name {
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  .enhancement-effect {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-error);
    font-weight: bold;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 4px;
    transition: var(--transition-theme);
  }

  .remove-btn:hover {
    background-color: var(--color-error);
    color: var(--text-inverse);
    transform: scale(1.1);
  }
</style>