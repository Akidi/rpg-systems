<script lang="ts">
  let { number, label, detail, colorClass }: { number: string | number; label: string; detail?: string | null; colorClass: string } = $props();
</script>

<div class="stat-card">
  <div class="stat-number {colorClass}">{number}</div>
  <div class="stat-label">{label}</div>
  {#if detail}
    <div class="stat-detail {colorClass}">{detail}</div>
  {/if}
</div>

<style>
  .stat-card {
    text-align: center;
  }

  .stat-number {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .stat-detail {
    font-size: 12px;
  }
</style>