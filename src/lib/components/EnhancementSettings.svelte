<script lang="ts">
  import Card from './Card.svelte';
  import FormInput from './FormInput.svelte';
  import type { StealSettings, IDamageSettings } from '../types';

  let { damageSettings, stealSettings }: { damageSettings: IDamageSettings; stealSettings: StealSettings } = $props();

  let rawDamageInput = $state(damageSettings.rawDamagePercent);
  let lifeStealInput = $state(stealSettings.lifeStealPercent);
  let manaStealInput = $state(stealSettings.manaStealPercent);

  function debounce<T>(fn: (value: T) => void, delay: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return (value: T) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn(value);
        timeout = undefined;
      }, delay);
    };
  }

  const updateRawDamage = debounce((value: number) => {
    damageSettings.rawDamagePercent = value;
  }, 300);

  const updateLifeSteal = debounce((value: number) => {
    stealSettings.lifeStealPercent = value;
  }, 300);

  const updateManaSteal = debounce((value: number) => {
    stealSettings.manaStealPercent = value;
  }, 300);

  $effect(() => {
    updateRawDamage(rawDamageInput);
  });

  $effect(() => {
    updateLifeSteal(lifeStealInput);
  });

  $effect(() => {
    updateManaSteal(manaStealInput);
  });
</script>

<Card title="Enhancement Settings">
  <FormInput 
    label="Raw Damage % per stack" 
    type="number" 
    bind:value={rawDamageInput} 
    min={0} 
    max={50} 
    step={1} 
  />
  <FormInput 
    label="Life Steal % per stack" 
    type="number" 
    bind:value={lifeStealInput} 
    min={0} 
    max={10} 
    step={0.1} 
  />
  <FormInput 
    label="Mana Steal % per stack" 
    type="number" 
    bind:value={manaStealInput} 
    min={0} 
    max={10} 
    step={0.1} 
  />
</Card>