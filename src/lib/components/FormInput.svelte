<script lang="ts">
  let { 
    label, 
    type = 'text' as 'text' | 'number', 
    value = $bindable(), 
    onChange, 
    min, 
    max, 
    step, 
    hint 
  }: { 
    label: string; 
    type?: 'text' | 'number'; 
    value: string | number ; 
    onChange?: (e: Event) => void; 
    min?: number; 
    max?: number; 
    step?: number | string; 
    hint?: string 
  } = $props();
</script>

<div class="form-group">
  <label class="form-label" for="{label}+Inpt">{label}:</label>
  <input {type} id="{label}+Inpt" bind:value oninput={onChange} class="form-input" {min} {max} {step} />
  {#if hint}
    <div class="form-hint">{hint}</div>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 12px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    color: #374151;
  }

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-hint {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
</style>