<script lang="ts">
	import { getFocusMultiplier } from './utils';
	import type { ActionDefinition, Character, CharacterKey, TelegraphedAction } from './types';

	type Props = {
		character: Character;
		characterKey: CharacterKey;
		currentTurn: CharacterKey;
		selectedTarget: CharacterKey;
		globalActionCount: number;
		telegraphedAction: TelegraphedAction | undefined;
		actions?: ActionDefinition[];
		canTarget?: boolean;
		selectTarget: (key: CharacterKey) => void;
	};

	let {
		character,
		characterKey,
		currentTurn,
		selectedTarget,
		globalActionCount,
		telegraphedAction,
		actions = [],
		canTarget = false,
		selectTarget
	}: Props = $props();

	const hpPercent = $state(Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100)));
	const manaPercent = $state(
		Math.max(0, Math.min(100, (character.mana / character.maxMana) * 100))
	);
	const focusMultiplier = $derived(getFocusMultiplier(character.focus).toFixed(2));
	const telegraphedLabel = $derived(
		telegraphedAction
			? (actions.find((action) => action.id === telegraphedAction.actionId)?.name ?? null)
			: null
	);

	function handleSelectTarget() {
		selectTarget(characterKey);
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
				onclick={handleSelectTarget}
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
							<div class="effect-dot-info">
								Next tick: Action {effect.nextTick}
								{#if globalActionCount - effect.startAction + 1 === 12}
									<span class="effect-final">(Final tick)</span>
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

<style>
	.character-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 1rem;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: 0 8px 20px var(--shadow-light);
		transition: var(--transition-theme);
	}

	.character-card.is-active {
		border-color: color-mix(in oklab, var(--color-primary) 60%, var(--border-primary) 40%);
		box-shadow: 0 12px 32px var(--shadow-medium);
	}

	.character-card.is-defeated {
		opacity: 0.5;
		filter: grayscale(0.2);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.card-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.target-button {
		border-radius: 999px;
		padding: 0.35rem 0.9rem;
		font-size: 0.8rem;
		font-weight: 600;
		border: 1px solid var(--border-secondary);
		background: var(--bg-tertiary);
		color: var(--text-primary);
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.target-button.is-selected {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--text-inverse);
		box-shadow: 0 6px 16px var(--shadow-medium);
	}

	.target-button:hover:not(.is-selected) {
		border-color: var(--color-primary);
	}

	.stat-block {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.stat-bar {
		position: relative;
		height: 0.65rem;
		background: var(--bg-tertiary);
		border-radius: 999px;
		overflow: hidden;
		border: 1px solid var(--border-primary);
	}

	.stat-bar-fill {
		height: 100%;
		border-radius: inherit;
		transition: width 0.4s ease;
	}

	.stat-bar-fill.health {
		background: linear-gradient(
			90deg,
			var(--color-health),
			color-mix(in oklab, var(--color-success) 70%, var(--color-health) 30%)
		);
	}

	.stat-bar-fill.mana {
		background: linear-gradient(
			90deg,
			var(--color-mana),
			color-mix(in oklab, var(--color-info) 60%, var(--color-mana) 40%)
		);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.65rem;
	}

	.stat-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
	}

	.stat-chip.ap {
		color: var(--color-warning);
		border-color: color-mix(in oklab, var(--color-warning) 65%, var(--border-primary) 35%);
	}

	.stat-chip.focus {
		color: var(--color-secondary);
		border-color: color-mix(in oklab, var(--color-secondary) 65%, var(--border-primary) 35%);
	}

	.stat-value-inline {
		font-size: 0.85rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.focus-multiplier {
		margin-left: 0.25rem;
		color: var(--color-secondary);
		font-weight: 500;
	}

	.effect-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.effect-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.effect-tag {
		border-radius: 0.75rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border-primary);
		background: var(--bg-tertiary);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--text-primary);
	}

	.effect-tag.is-dot {
		border-color: color-mix(in oklab, var(--color-error) 65%, var(--border-primary) 35%);
		background: color-mix(in oklab, var(--bg-tertiary) 70%, var(--color-error) 30%);
		color: var(--text-inverse);
	}

	.effect-tag.is-buff {
		border-color: color-mix(in oklab, var(--color-success) 65%, var(--border-primary) 35%);
		background: color-mix(in oklab, var(--bg-tertiary) 70%, var(--color-success) 30%);
	}

	.effect-header {
		display: flex;
		justify-content: space-between;
		font-weight: 600;
	}

	.effect-dot-info {
		font-size: 0.75rem;
		color: var(--text-inverse);
		opacity: 0.9;
	}

	.effect-tag.is-buff .effect-dot-info {
		color: var(--text-primary);
	}

	.effect-final {
		margin-left: 0.25rem;
		font-weight: 600;
	}

	.focus-warning {
		padding: 0.4rem 0.75rem;
		border-radius: 0.6rem;
		background: color-mix(in oklab, var(--color-warning) 20%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-warning) 50%, transparent);
		color: var(--color-warning);
		font-size: 0.8rem;
		text-align: center;
		font-weight: 600;
	}

	.telegraph-badge {
		padding: 0.45rem 0.8rem;
		border-radius: 0.75rem;
		background: color-mix(in oklab, var(--color-info) 20%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-info) 50%, transparent);
		color: var(--color-info);
		font-size: 0.8rem;
		font-weight: 600;
		text-align: center;
	}

	@media (max-width: 640px) {
		.character-card {
			padding: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>