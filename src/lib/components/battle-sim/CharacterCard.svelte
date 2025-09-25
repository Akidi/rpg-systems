<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getFocusMultiplier } from './utils';
  import type {
    ActionDefinition,
    Character,
    CharacterKey,
    TelegraphedAction
  } from './types';

  export let character: Character;
  export let characterKey: CharacterKey;
  export let currentTurn: CharacterKey;
  export let selectedTarget: CharacterKey;
  export let globalActionCount: number;
  export let telegraphedAction: TelegraphedAction | undefined;
  export let actions: ActionDefinition[];
  export let canTarget = false;

  const dispatch = createEventDispatcher<{ selectTarget: { key: CharacterKey } }>();

  $: hpPercent = Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100));
  $: manaPercent = Math.max(0, Math.min(100, (character.mana / character.maxMana) * 100));
  $: focusMultiplier = getFocusMultiplier(character.focus).toFixed(2);
  $: telegraphedLabel = telegraphedAction
    ? actions.find((action) => action.id === telegraphedAction.actionId)?.name
    : null;

  function handleSelectTarget() {
    dispatch('selectTarget', { key: characterKey });
  }
</script>

<div
  class={`p-4 rounded-lg border-2 ${
    characterKey === currentTurn
      ? 'border-yellow-400 bg-yellow-900/20'
      : character.hp <= 0
        ? 'border-red-600 bg-red-900/20 opacity-50'
        : 'border-gray-600 bg-gray-800'
  }`}
>
  <h3 class="font-bold text-lg mb-3 flex items-center justify-between">
    <span>{character.name}{characterKey === currentTurn ? ' (Active)' : ''}</span>
    {#if canTarget && character.hp > 0}
      <button
        class={`px-2 py-1 text-xs rounded ${
          selectedTarget === characterKey
            ? 'bg-red-600 text-white'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
        aria-pressed={selectedTarget === characterKey}
        on:click={handleSelectTarget}
      >
        {selectedTarget === characterKey ? 'Targeted' : 'Target'}
      </button>
    {/if}
  </h3>

  <div class="mb-2">
    <div class="flex justify-between text-sm">
      <span>HP</span>
      <span>{character.hp}/{character.maxHp}</span>
    </div>
    <div class="w-full bg-gray-700 rounded-full h-2">
      <div
        class="bg-red-600 h-2 rounded-full transition-all duration-300"
        style:width={`${hpPercent}%`}
      ></div>
    </div>
  </div>

  <div class="mb-2">
    <div class="flex justify-between text-sm">
      <span>Mana</span>
      <span>{character.mana}/{character.maxMana}</span>
    </div>
    <div class="w-full bg-gray-700 rounded-full h-2">
      <div
        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style:width={`${manaPercent}%`}
      ></div>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span class="text-green-400">AP:</span> {character.ap}/{character.maxAp}
    </div>
    <div>
      <span class="text-purple-400">Focus:</span> {character.focus}/{character.maxFocus}
      {#if character.focus > 0}
        <span class="text-xs text-purple-300 ml-1">(x{focusMultiplier})</span>
      {/if}
    </div>
  </div>

  {#if character.effects.length > 0}
    <div class="mt-2">
      <div class="text-xs text-gray-400 mb-1">Effects:</div>
      <div class="space-y-1">
        {#each character.effects as effect, idx (idx)}
          <div
            class={`text-xs px-2 py-1 rounded ${
              effect.type === 'dot' ? 'bg-red-800 text-red-200' : 'bg-blue-800 text-blue-200'
            }`}
          >
            <div class="flex justify-between">
              <span>{effect.name}</span>
              {#if effect.type === 'dot'}
                <span>Actions: {globalActionCount - effect.startAction + 1}/12</span>
              {:else}
                <span>({effect.duration})</span>
              {/if}
            </div>
            {#if effect.type === 'dot'}
              <div class="text-xs text-red-300 mt-1">
                Next tick: Action {effect.nextTick}
                {#if globalActionCount - effect.startAction + 1 === 12}
                  <span> (Final tick)</span>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if character.focusDecay >= 2 && character.focus > 0}
    <div class="text-xs text-yellow-400 mt-1">⚠ Focus will decay next turn</div>
  {/if}

  {#if telegraphedLabel}
    <div class="text-xs text-orange-400 mt-1 bg-orange-900/30 p-1 rounded">
      ⚡ {telegraphedLabel} telegraphed
    </div>
  {/if}
</div>
