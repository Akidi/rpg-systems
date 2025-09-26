<script lang="ts">
	import { RotateCcw } from 'lucide-svelte';
	import ActionGrid from './ActionGrid.svelte';
	import type { ActionDefinition, Character } from './types';

	type Props = {
		actions: ActionDefinition[];
		currentCharacter: Character;
		enhancementMode: boolean;
		onToggleEnhancements: () => void;
		onEndTurn: () => void;
		onReset: () => void;
		onAction: (actionId: string) => void;
	};

	let {
		actions = [],
		currentCharacter,
		enhancementMode,
		onToggleEnhancements,
		onEndTurn,
		onReset,
		onAction
	}: Props = $props();

	const enhancementDisabled = $derived(
		currentCharacter.ap <= 0 || currentCharacter.hp <= 0
	);
</script>

<div class="control-section">
	<div class="control-bar">
		<button
			class="action-button accent"
			type="button"
			disabled={enhancementDisabled}
			onclick={onToggleEnhancements}
		>
			{enhancementMode ? 'Cancel Enhancements' : 'Add Enhancements'}
		</button>
		<button class="action-button neutral" type="button" onclick={onEndTurn}>End Turn</button>
		<button class="action-button danger" type="button" onclick={onReset}>
			<RotateCcw size={16} class="button-icon" />
			Reset
		</button>
	</div>

	<ActionGrid {actions} {currentCharacter} onAction={onAction} />
</div>

<style>
	.control-section {
		margin-top: 2rem;
	}

	.control-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.action-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 600;
		border: 1px solid transparent;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.action-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.action-button.accent {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--text-inverse);
		box-shadow: 0 8px 24px var(--shadow-medium);
	}

	.action-button.accent:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.action-button.neutral {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border-color: var(--border-secondary);
	}

	.action-button.neutral:hover:not(:disabled) {
		border-color: var(--color-primary);
		box-shadow: 0 4px 12px var(--shadow-light);
	}

	.action-button.danger {
		background: var(--color-error);
		color: var(--text-inverse);
	}

	.action-button.danger:hover:not(:disabled) {
		filter: brightness(1.08);
	}

	.button-icon {
		width: 1rem;
		height: 1rem;
	}

	@media (max-width: 768px) {
		.control-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.action-button {
			justify-content: center;
			width: 100%;
		}
	}
</style>
