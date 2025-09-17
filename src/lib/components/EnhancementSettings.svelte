<script lang="ts">
  import Card from './Card.svelte';
  import FormInput from './FormInput.svelte';
  import type { IDamageSettings, StealSettings } from '../types';

  let { damageSettings, stealSettings }: { damageSettings: IDamageSettings; stealSettings: StealSettings } = $props();
</script>

<Card title="Enhancement Settings">
  <FormInput label="Raw Damage % per stack" type="number" bind:value={damageSettings.rawDamagePercent} min={0} max={50} step={1} />
  <FormInput label="Life Steal % per stack" type="number" bind:value={stealSettings.lifeStealPercent} min={0} max={10} step={0.1} />
  <FormInput label="Mana Steal % per stack" type="number" bind:value={stealSettings.manaStealPercent} min={0} max={10} step={0.1} />
</Card>