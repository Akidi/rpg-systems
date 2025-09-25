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
  class={`character-card${characterKey === currentTurn ? ' is-active' : ''}${character.hp <= 0 ? ' is-defeated' : ''}`}
>
  <div class="card-header">
    <h3 class="card-title">
      {character.name}{characterKey === currentTurn ? ' (Active)' : ''}
    </h3>
    {#if canTarget && character.hp > 0}
      <button
        class={`target-button${selectedTarget === characterKey ? ' is-selected' : ''}`}
        type="button"
        aria-pressed={selectedTarget === characterKey}
        on:click={handleSelectTarget}
      >
        {selectedTarget === characterKey ? 'Targeted' : 'Target'}
      </button>
    {/if}
  </div>
  <div class="stat-block">
    <div class="stat-header">
      <span class="stat-label">HP</span>
      <span class="stat-value">{character.hp}/{character.maxHp}</span>
    </div>
    <div class="stat-bar">
      <div class="stat-bar-fill health" style:width={`${hpPercent}%`}></div>
    </div>
  </div>

  <div class="stat-block">
    <div class="stat-header">
      <span class="stat-label">Mana</span>
      <span class="stat-value">{character.mana}/{character.maxMana}</span>
    </div>
    <div class="stat-bar">
      <div class="stat-bar-fill mana" style:width={`${manaPercent}%`}></div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-line">
      <span class="stat-chip ap">AP</span>
      <span class="stat-value-inline">{character.ap}/{character.maxAp}</span>
    </div>
    <div class="stat-line">
      <span class="stat-chip focus">Focus</span>
      <span class="stat-value-inline">
        {character.focus}/{character.maxFocus}
        {#if character.focus > 0}
          <span class="focus-multiplier">(x{focusMultiplier})</span>
        {/if}
      </span>
    </div>
  </div>

  {#if character.effects.length > 0}
    <div class="effect-section">
      <div class="section-label">Effects</div>
      <div class="effect-list">
        {#each character.effects as effect, idx (idx)}
          <div class={['effect-tag', effect.type === 'dot' ? 'is-dot' : 'is-buff'].join(' ')}>
            <div class="effect-header">
              <span>{effect.name}</span>
              {#if effect.type === 'dot'}
                <span>Actions: {globalActionCount - effect.startAction + 1}/12</span>
              {:else}
                <span>({effect.duration})</span>
              {/if}
            </div>
            {#if effect.type === 'dot'}
              <div class="effect-meta">
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
    <div class="focus-warning">⚠ Focus will decay next turn</div>
  {/if}

  {#if telegraphedLabel}
    <div class="telegraph-badge">
      ⚡ {telegraphedLabel} telegraphed
    </div>
  {/if}
</div>


