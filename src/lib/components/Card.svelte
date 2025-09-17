<script lang="ts">
	import type { Snippet } from "svelte";

  let { title, className='', children }: {  title?: string; className?: string, children?: Snippet } = $props();
</script>

<div class="card">
  {#if title}
    <h2 class="card-title" class:className>{title}</h2>
  {/if}
  {@render children?.()}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #374151;
  }
</style>