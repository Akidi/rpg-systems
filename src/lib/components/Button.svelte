<script lang="ts">
  import type { Snippet } from 'svelte';
  let { 
    variant = 'secondary' as 'secondary' | 'primary' | 'danger', 
    disabled = false, 
    onClick,
    children
  }: { variant?: 'secondary' | 'primary' | 'danger'; disabled?: boolean; onClick?: () => void; children?: Snippet } = $props();
</script>

<button onclick={onClick} class="btn" class:btn-secondary={variant === 'secondary'} class:btn-primary={variant === 'primary'} class:btn-danger={variant === 'danger'} {disabled}>
  {@render children?.()}
</button>

<style>
  .btn {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
    font-size: 18px;
    padding: 16px 24px;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .btn-danger:disabled {
    background: #d1d5db;
    color: #6b7280;
  }
</style>