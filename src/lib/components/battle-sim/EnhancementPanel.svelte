<script lang="ts">
	import {
		getEnhancementApCost,
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

	type Props = {
		baseEnhancements: Enhancement[];
		selectedEnhancements: SelectedEnhancements;
		selectedActionId: string | null;
		actions: ActionDefinition[];
		currentCharacter: Character;
		validEnhancementsForAction: (actionId: string) => EnhancementId[];
		multiTargetAvailable: boolean;
		onIncrement?: (id: EnhancementId) => void;
		onDecrement?: (id: EnhancementId) => void;
		onToggle?: (id: EnhancementId, value: boolean) => void;
		onExecute?: () => void;
	};

	let {
		baseEnhancements = [],
		selectedEnhancements = {},
		selectedActionId = null,
		actions = [],
		currentCharacter,
		validEnhancementsForAction,
		multiTargetAvailable,
		onIncrement,
		onDecrement,
		onToggle,
		onExecute
	}: Props = $props();

	const getValidEnhancements = () =>
		selectedActionId ? validEnhancementsForAction(selectedActionId) : null;

	let actionDefinition = $derived(
		selectedActionId ? (actions.find((action) => action.id === selectedActionId) ?? null) : null
	);
	let actionApCost = $derived(actionDefinition?.apCost ?? 0);
	let apBudget = $state(currentCharacter.ap);
	let enhancementApCost = $derived.by(() => getEnhancementApCost(selectedEnhancements));
	let totalApCost = $derived(actionApCost + enhancementApCost);
	let apRemaining = $derived(Math.max(0, apBudget - totalApCost));

	let enhancementCostBase = $state(currentCharacter.mana * 0.2);
	let totalStacks = $derived.by(() => getTotalEnhancementCount(selectedEnhancements));
	let totalManaCost = $derived(
		totalStacks ? getEnhancementCost(totalStacks, enhancementCostBase) : 0
	);
	let selectedActionName = $derived(
		selectedActionId
			? (actions.find((action) => action.id === selectedActionId)?.name ?? null)
			: null
	);

	const computeTotalApWith = (actionCost: number, id: EnhancementId, value: number) => {
		const next = { ...selectedEnhancements } as Record<EnhancementId, number>;
		if (value <= 0) {
			delete next[id];
		} else {
			next[id] = value;
		}
		return actionCost + getEnhancementApCost(next as SelectedEnhancements);
	};

	let enhancementOptions = $derived.by(()=>baseEnhancements.map((enhancement) => {
		const count = selectedEnhancements[enhancement.id] ?? 0;
		const isStacking = isStackingEnhancement(enhancement.id);
		const validList = getValidEnhancements();
		const isValid = !validList || validList.includes(enhancement.id);
		const disabledByValidity =
			(!isValid && count === 0) ||
			(enhancement.id === 'multi' && !multiTargetAvailable && count === 0);
		const apDescription = enhancement.id === 'multi' ? '2 AP when enabled' : '1 AP per stack';
		const nextTotalAp = computeTotalApWith(
			actionApCost,
			enhancement.id,
			isStacking ? count + 1 : 1
		);
		const apBlocked = isStacking
			? nextTotalAp > apBudget
			: count === 0
				? nextTotalAp > apBudget
				: false;
		const apStatus = apBlocked
			? isStacking
				? 'AP limit reached for additional stacks'
				: 'Not enough AP to enable'
			: null;
		const subtitle =
			!isValid && count === 0
				? 'Not valid for selected action'
				: enhancement.id === 'multi' && !multiTargetAvailable && count === 0
					? 'No valid targets'
					: enhancement.description;

		return {
			...enhancement,
			count,
			isStacking,
			isDisabled: disabledByValidity,
			apBlocked,
			apDescription,
			apStatus,
			subtitle,
			isActive: count > 0
		};
	}));

	function handleIncrement(id: EnhancementId) {
		onIncrement?.(id);
	}

	function handleDecrement(id: EnhancementId) {
		onDecrement?.(id);
	}

	function handleToggle(id: EnhancementId, value: boolean) {
		onToggle?.(id, value);
	}

	function handleExecute() {
		onExecute?.();
	}
</script>

<div class="enhancement-panel">
	<h3 class="panel-title">Select Enhancements</h3>
	<div class="enhancement-grid">
		{#each enhancementOptions as enhancement (enhancement.id)}
			<div
				class={`enhancement-card${enhancement.isActive ? ' is-active' : ''}${
					enhancement.isDisabled ? ' is-disabled' : ''
				}${enhancement.apBlocked ? ' is-blocked' : ''}`}
			>
				<div class="card-head">
					<span class="card-name">{enhancement.name}</span>
					{#if enhancement.isStacking}
						<span class="card-status">Stacks: {enhancement.count}</span>
					{:else if enhancement.isActive}
						<span class="card-status">Enabled</span>
					{/if}
				</div>
				<div class="card-subtitle">{enhancement.subtitle}</div>
				{#if enhancement.subtitle === enhancement.description}
					<div class="card-meta">AP Cost: {enhancement.apDescription}</div>
				{/if}
				{#if enhancement.apStatus}
					<div class="card-warning">{enhancement.apStatus}</div>
				{/if}

				{#if enhancement.isStacking}
					<div class="stack-controls">
						<button
							class="stack-button decrement"
							type="button"
							onclick={() => handleDecrement(enhancement.id)}
							disabled={enhancement.count === 0}
						>
							−
						</button>
						<span class="stack-count">{enhancement.count}</span>
						<button
							class="stack-button increment"
							type="button"
							onclick={() => handleIncrement(enhancement.id)}
							disabled={enhancement.isDisabled || enhancement.apBlocked}
						>
							+
						</button>
					</div>
				{:else}
					<button
						class={`toggle-button${enhancement.isActive ? ' is-active' : ''}`}
						type="button"
						onclick={() => handleToggle(enhancement.id, !enhancement.isActive)}
						disabled={!enhancement.isActive && (enhancement.isDisabled || enhancement.apBlocked)}
					>
						{enhancement.isActive ? 'Disable' : 'Enable'}
					</button>
				{/if}
			</div>
		{/each}
	</div>

	{#if hasAnyEnhancements(selectedEnhancements)}
		<div class="panel-summary">
			<div class="summary-line">Total AP Cost: {totalApCost}/{apBudget}</div>
			<div class="summary-sub">
				Enhancements: {enhancementApCost} AP{selectedActionName
					? ` • Action: ${actionApCost} AP`
					: ''}
			</div>
			<div class="summary-line">Total Mana Cost: {totalManaCost}</div>
			<div class="summary-sub">AP Remaining: {apRemaining}</div>
			<div class="summary-sub">(Ends turn after use)</div>
			{#if selectedActionName}
				<div class="summary-sub">Selected Action: {selectedActionName}</div>
			{/if}
			{#if totalApCost > apBudget}
				<div class="summary-warning">Insufficient AP available</div>
			{/if}
		</div>
	{/if}

	{#if selectedActionId && hasAnyEnhancements(selectedEnhancements)}
		<button class="execute-button" type="button" onclick={handleExecute}>
			Execute Enhanced {selectedActionName}
		</button>
	{/if}
</div>

<style>
	.enhancement-panel {
		margin-top: 1.5rem;
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid color-mix(in oklab, var(--color-secondary) 40%, var(--border-primary) 60%);
		background: color-mix(in oklab, var(--bg-secondary) 70%, var(--color-secondary) 30%);
		box-shadow: 0 12px 32px var(--shadow-light);
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.panel-title {
		margin: 0 0 1rem 0;
		color: var(--text-inverse);
		font-weight: 700;
		font-size: 1.1rem;
		text-shadow: 0 4px 16px var(--shadow-medium);
	}

	.enhancement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.9rem;
	}

	.enhancement-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 0.85rem;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		transition: var(--transition-theme);
		font-size: 0.85rem;
	}

	.enhancement-card.is-active {
		border-color: color-mix(in oklab, var(--color-secondary) 70%, var(--border-primary) 30%);
		background: color-mix(in oklab, var(--bg-secondary) 60%, var(--color-secondary) 40%);
		color: var(--text-inverse);
		box-shadow: 0 10px 28px var(--shadow-medium);
	}

	.enhancement-card.is-disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.enhancement-card.is-blocked:not(.is-active) {
		border-color: color-mix(in oklab, var(--color-error) 45%, var(--border-primary) 55%);
	}

	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
	}

	.card-status {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: color-mix(in oklab, var(--text-inverse) 80%, var(--bg-secondary) 20%);
		background: color-mix(in oklab, var(--color-secondary) 25%, transparent);
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
	}

	.card-subtitle {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.enhancement-card.is-active .card-subtitle {
		color: color-mix(in oklab, var(--text-inverse) 80%, var(--bg-secondary) 20%);
	}

	.card-meta {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.enhancement-card.is-active .card-meta {
		color: color-mix(in oklab, var(--text-inverse) 75%, var(--bg-secondary) 25%);
	}

	.card-warning {
		font-size: 0.7rem;
		color: var(--color-error);
		font-weight: 600;
	}

	.stack-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stack-button {
		border: 1px solid var(--border-secondary);
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border-radius: 0.4rem;
		width: 2rem;
		height: 2rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.stack-button.increment {
		border-color: color-mix(in oklab, var(--color-secondary) 55%, var(--border-secondary) 45%);
		background: color-mix(in oklab, var(--color-secondary) 40%, var(--bg-tertiary) 60%);
		color: var(--text-inverse);
	}

	.stack-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stack-count {
		min-width: 2rem;
		text-align: center;
		font-weight: 600;
	}

	.toggle-button {
		margin-top: 0.35rem;
		border-radius: 0.6rem;
		padding: 0.4rem 0.9rem;
		font-weight: 600;
		border: 1px solid color-mix(in oklab, var(--color-secondary) 55%, var(--border-secondary) 45%);
		background: color-mix(in oklab, var(--color-secondary) 40%, var(--bg-tertiary) 60%);
		color: var(--text-inverse);
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.toggle-button.is-active {
		background: color-mix(in oklab, var(--color-error) 45%, var(--bg-tertiary) 55%);
		border-color: color-mix(in oklab, var(--color-error) 55%, var(--border-secondary) 45%);
	}

	.toggle-button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.panel-summary {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: color-mix(in oklab, var(--text-inverse) 80%, var(--bg-secondary) 20%);
	}

	.summary-line {
		font-weight: 600;
	}

	.summary-sub {
		font-size: 0.75rem;
		opacity: 0.9;
	}

	.summary-warning {
		font-size: 0.75rem;
		color: var(--color-error);
		font-weight: 600;
	}

	.execute-button {
		margin-top: 1rem;
		width: 100%;
		border: none;
		border-radius: 0.75rem;
		padding: 0.65rem 1.5rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-warning) 100%);
		color: var(--text-inverse);
		cursor: pointer;
		transition: var(--transition-theme);
		box-shadow: 0 10px 24px var(--shadow-medium);
	}

	.execute-button:hover {
		filter: brightness(1.05);
	}

	.execute-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.enhancement-panel {
			padding: 1.1rem;
		}
	}
</style>