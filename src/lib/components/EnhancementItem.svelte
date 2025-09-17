<script lang="ts">
  import type { IEnhancement } from '../types';

  let { enhancement, onAdd }: { enhancement: IEnhancement; onAdd: () => void } = $props();
</script>

<button onclick={onAdd} class="enhancement-item">
  <div class="enhancement-name">{enhancement.name}</div>
  <div class="enhancement-effect">{enhancement.effect}</div>
  <div class="enhancement-description">{enhancement.description}</div>
  {#if !enhancement.stackable}
    <div class="enhancement-note">One-time enhancement</div>
  {/if}
</button>

<style>
  .enhancement-item {
    width: 100%;
    text-align: left;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .enhancement-item:hover {
    background: #dcfce7;
  }

  .enhancement-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .enhancement-effect {
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 4px;
  }

  .enhancement-description {
    font-size: 12px;
    color: #6b7280;
  }

  .enhancement-note {
    font-size: 12px;
    color: #2563eb;
    margin-top: 4px;
  }
</style>