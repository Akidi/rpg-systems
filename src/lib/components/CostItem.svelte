<script lang="ts">
  let { number, label, breakdown, colorClass }: { number: number; label: string; breakdown?: string; colorClass: string } = $props();
</script>

<div class="cost-item">
  <div class="cost-number {colorClass}">{number}</div>
  <div class="cost-label">{label}</div>
  {#if breakdown}
    <div class="cost-breakdown">{breakdown}</div>
  {/if}
</div>

<style>
  .cost-item {
    text-align: center;
  }

  .cost-number {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .cost-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .cost-breakdown {
    font-size: 12px;
    color: #6b7280;
  }
</style>