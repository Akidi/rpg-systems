<script lang="ts">
  let { label, value, insufficient = false, mp = false }: { label: string; value: string; insufficient?: boolean; mp?: boolean } = $props();
</script>

<div class="stat-row">
  <span>{label}:</span>
  <span class="stat-value" class:stat-insufficient={insufficient} class:stat-mp={mp}>
    {value}
  </span>
</div>

<style>
  .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-value {
    font-weight: 600;
  }

  .stat-insufficient {
    color: #dc2626;
    font-weight: bold;
  }

  .stat-mp {
    color: #2563eb;
  }
</style>