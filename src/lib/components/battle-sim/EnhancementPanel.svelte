<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    getEnhancementCost,
    getTotalEnhancementCount,
    hasAnyEnhancements,
    isStackingEnhancement
  } from './utils';
  import type {
    ActionDefinition,
    Character,
    Enhancement,
    EnhancementId,
    SelectedEnhancements
  } from './types';

  export let baseEnhancements: Enhancement[] = [];
  export let selectedEnhancements: SelectedEnhancements = {};
  export let selectedActionId: string | null = null;
  export let actions: ActionDefinition[] = [];
  export let currentCharacter: Character;
  export let validEnhancementsForAction: (actionId: string) => EnhancementId[];
  export let multiTargetAvailable: boolean;

  const dispatch = createEventDispatcher<{
    increment: { id: EnhancementId };
    decrement: { id: EnhancementId };
    toggle: { id: EnhancementId; value: boolean };
    execute: void;
  }>();

  const getValidEnhancements = () =>
    selectedActionId ? validEnhancementsForAction(selectedActionId) : null;

  $: enhancementCostBase = currentCharacter.mana * 0.2;
  $: totalStacks = getTotalEnhancementCount(selectedEnhancements);
  $: totalManaCost = totalStacks
    ? getEnhancementCost(totalStacks, enhancementCostBase)
    : 0;
  $: selectedActionName = selectedActionId
    ? actions.find((action) => action.id === selectedActionId)?.name ?? null
    : null;
  $: enhancementOptions = baseEnhancements.map((enhancement) => {
    const count = selectedEnhancements[enhancement.id] ?? 0;
    const isStacking = isStackingEnhancement(enhancement.id);
    const validList = getValidEnhancements();
    const isValid = !validList || validList.includes(enhancement.id);
    const isDisabled = (!isValid && count === 0) || (enhancement.id === 'multi' && !multiTargetAvailable && count === 0);
    const subtitle = !isValid && count === 0
      ? 'Not valid for selected action'
      : enhancement.id === 'multi' && !multiTargetAvailable && count === 0
        ? 'No valid targets'
        : enhancement.description;

    return {
      ...enhancement,
      count,
      isStacking,
      isDisabled,
      subtitle,
      isActive: count > 0
    };
  });

  function handleIncrement(id: EnhancementId) {
    dispatch('increment', { id });
  }

  function handleDecrement(id: EnhancementId) {
    dispatch('decrement', { id });
  }

  function handleToggle(id: EnhancementId, value: boolean) {
    dispatch('toggle', { id, value });
  }

  function handleExecute() {
    dispatch('execute');
  }
</script>

<div class="mt-6 p-4 bg-purple-900/30 border border-purple-600 rounded-lg">
  <h3 class="font-bold mb-3 text-purple-300">Select Enhancements</h3>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
    {#each enhancementOptions as enhancement (enhancement.id)}
      <div
        class={`p-3 rounded border text-sm flex flex-col gap-2 ${
          enhancement.isActive
            ? 'border-purple-400 bg-purple-600/40'
            : enhancement.isDisabled
              ? 'border-gray-700 bg-gray-800 text-gray-500'
              : 'border-gray-600 bg-gray-700'
        }`}
      >
        <div class="font-semibold flex items-center justify-between">
          <span>{enhancement.name}</span>
          {#if enhancement.isStacking}
            <span class="text-xs text-purple-200">Stacks: {enhancement.count}</span>
          {:else if enhancement.isActive}
            <span class="text-xs text-purple-200">Enabled</span>
          {/if}
        </div>
        <div class="text-xs text-gray-300">{enhancement.subtitle}</div>

        {#if enhancement.isStacking}
          <div class="flex items-center gap-2 pt-1">
            <button
              class="px-2 py-1 bg-gray-800 border border-gray-500 rounded disabled:opacity-50"
              type="button"
              on:click={() => handleDecrement(enhancement.id)}
              disabled={enhancement.count === 0}
            >
              −
            </button>
            <span class="min-w-[2rem] text-center text-sm">{enhancement.count}</span>
            <button
              class="px-2 py-1 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              on:click={() => handleIncrement(enhancement.id)}
              disabled={enhancement.isDisabled}
            >
              +
            </button>
          </div>
        {:else}
          <button
            class={`mt-2 px-3 py-1 rounded font-medium ${
              enhancement.isActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            type="button"
            on:click={() => handleToggle(enhancement.id, !enhancement.isActive)}
            disabled={!enhancement.isActive && enhancement.isDisabled}
          >
            {enhancement.isActive ? 'Disable' : 'Enable'}
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#if hasAnyEnhancements(selectedEnhancements)}
    <div class="text-sm text-purple-300 space-y-1">
      <div>Total Mana Cost: {totalManaCost}</div>
      <div class="text-xs">(Ends turn after use)</div>
      {#if selectedActionName}
        <div class="text-xs">Selected Action: {selectedActionName}</div>
      {/if}
    </div>
  {/if}

  {#if selectedActionId && hasAnyEnhancements(selectedEnhancements)}
    <button
      class="w-full mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium"
      type="button"
      on:click={handleExecute}
    >
      Execute Enhanced {selectedActionName}
    </button>
  {/if}
</div>
