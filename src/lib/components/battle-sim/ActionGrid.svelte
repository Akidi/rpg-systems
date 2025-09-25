<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ActionDefinition, Character } from './types';

  export let actions: ActionDefinition[] = [];
  export let currentCharacter: Character;

  const dispatch = createEventDispatcher<{ action: { id: string } }>();

  $: actionStates = actions.map((action) => {
    const focusCost = currentCharacter.focus + 1;
    const cost = action.id === 'focus' ? focusCost : action.apCost;
    const canAfford = currentCharacter.ap >= cost;
    const disabled = !canAfford || currentCharacter.hp <= 0;

    return {
      action,
      cost,
      canAfford,
      disabled
    };
  });

  function handleClick(id: string) {
    dispatch('action', { id });
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
  {#each actionStates as state (state.action.id)}
    <button
      class={`p-3 rounded-lg border-2 transition-all ${
        state.canAfford && !state.disabled
          ? 'border-blue-500 bg-blue-900/30 hover:bg-blue-800/50 text-white'
          : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
      }`}
      type="button"
      disabled={state.disabled}
      on:click={() => handleClick(state.action.id)}
    >
      <div class="flex items-center justify-center mb-2">
        <svelte:component this={state.action.icon} size={24} />
      </div>
      <div class="text-sm font-medium">{state.action.name}</div>
      <div class="text-xs text-gray-400">{state.cost} AP</div>
    </button>
  {/each}
</div>
