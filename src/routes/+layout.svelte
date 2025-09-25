<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import AppLayout from '$lib/components/AppLayout.svelte';
  import '../app.css';
  
  interface Props {
    children: import('svelte').Snippet;
  }
  
  const { children }: Props = $props();
</script>

<AppLayout>
  {@render children()}
</AppLayout>