<script lang="ts">
	import type { ActionDefinition, Character } from './types';

	type Props = {
		actions: ActionDefinition[];
		currentCharacter: Character;
		onAction: (id: string) => void;
	};

	let { actions = [], currentCharacter, onAction }: Props = $props();

	const actionStates = $derived.by(() =>
		actions.map((action) => {
			const focusCost = currentCharacter.focus + 1;
			const cost = action.id === 'focus' ? focusCost : action.apCost;
			const maxedFocus =
				action.id === 'focus' && currentCharacter.focus >= currentCharacter.maxFocus;
			const canAfford = currentCharacter.ap >= cost;
			const disabled = !canAfford || currentCharacter.hp <= 0 || maxedFocus;

			return {
				action,
				cost,
				canAfford,
				disabled
			};
		})
	);
</script>

<div class="action-grid">
	{#each actionStates as state (state.action.id)}
		{@const Icon = state.action.icon}
		<button
			class={`action-card${state.canAfford && !state.disabled ? ' is-available' : ''}${state.disabled ? ' is-disabled' : ''}`}
			type="button"
			disabled={state.disabled}
			onclick={() => onAction(state.action.id)}
		>
			<div class="action-icon">
				<Icon size={24} />
			</div>
			<div class="action-name">{state.action.name}</div>
			<div class="action-cost">{state.cost} AP</div>
		</button>
	{/each}
</div>

<style>
	.action-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.action-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.action-grid {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	.action-card {
		background: var(--bg-secondary);
		border: 2px solid var(--border-primary);
		border-radius: 0.85rem;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		cursor: pointer;
		transition: var(--transition-theme);
		color: var(--text-primary);
		box-shadow: 0 4px 12px var(--shadow-light);
	}

	.action-card.is-available {
		border-color: color-mix(in oklab, var(--color-primary) 65%, var(--border-primary) 35%);
		background: color-mix(in oklab, var(--bg-secondary) 70%, var(--color-primary) 30%);
		color: var(--text-inverse);
	}

	.action-card.is-available:hover:not(:disabled) {
		box-shadow: 0 10px 24px var(--shadow-medium);
		transform: translateY(-2px);
	}

	.action-card.is-disabled {
		cursor: not-allowed;
		opacity: 0.55;
		color: var(--text-muted);
	}

	.action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-secondary) 25%);
		color: inherit;
	}

	.action-card.is-available .action-icon {
		background: color-mix(in oklab, var(--color-primary) 70%, transparent);
	}

	.action-name {
		font-size: 0.95rem;
		font-weight: 600;
		text-align: center;
	}

	.action-cost {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.action-card.is-available .action-cost {
		color: color-mix(in oklab, var(--text-inverse) 80%, var(--bg-secondary) 20%);
	}
</style>