<script lang="ts">
  export let logs: string[] = [];
</script>

<div class="bg-gray-800 p-4 rounded-lg h-full">
  <h3 class="font-bold mb-3">Combat Log</h3>
  <div class="space-y-1 text-sm font-mono h-64 overflow-y-auto">
    {#if logs.length === 0}
      <div class="text-gray-500">The battlefield awaits your command...</div>
    {:else}
      {#each logs as log, idx (idx)}
        <div class="text-gray-300">{log}</div>
      {/each}
    {/if}
  </div>
</div>
