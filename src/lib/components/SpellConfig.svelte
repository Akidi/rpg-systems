<script lang="ts">
  import Card from './Card.svelte';
  import FormInput from './FormInput.svelte';
  import type { BaseSpell } from '../types';

  let { baseSpell, enemyCount }: { baseSpell: BaseSpell; enemyCount: number } = $props();
</script>

<Card title="Base Spell & Battlefield">
  <FormInput label="Spell Name" type="text" bind:value={baseSpell.name} />
  <FormInput label="Base AP Cost" type="number" bind:value={baseSpell.apCost} min={0} />
  <FormInput label="Base MP Cost" type="number" bind:value={baseSpell.mpCost} min={0} />
  <FormInput 
    label="Enemy Count" 
    type="number" 
    bind:value={enemyCount} 
    onChange={(e: Event) => (enemyCount = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))}
    min={1} 
    max={10}
    hint="Multi-Target only available with 2+ enemies"
  />
</Card>