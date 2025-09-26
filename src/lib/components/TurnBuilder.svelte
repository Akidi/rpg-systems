<!-- src/lib/components/TurnBuilder.svelte -->
<script lang="ts">
	import type { Action, TurnPattern, Enhancement } from '$lib/types/turnSystem.js';
	import { ENHANCEMENTS } from '$lib/types/turnSystem.js';
	import {
		createPhysicalAttack,
		createEnhancedAction,
		createDefendAction
	} from '$lib/calculations/turnSystem.js';

	interface Props {
		pattern: TurnPattern;
		maxAP: number;
		onPatternChange: (pattern: TurnPattern) => void;
	}

	let { pattern, maxAP, onPatternChange }: Props = $props();

	// Local state
	let actions = $state<Action[]>([...pattern.actions]);
	let patternName = $state(pattern.name);
	let patternDescription = $state(pattern.description);

	// Enhancement builder state
	let showEnhancementBuilder = $state(false);
	let enhancementSkillCost = $state(1);
	let selectedEnhancements = $state<Enhancement[]>([]);

	// Calculate current AP cost
	const totalAPCost = $derived(() => {
		return actions.reduce((sum, action) => sum + action.apCost, 0);
	});

	// Update parent when changes occur
	function updatePattern() {
		const newPattern: TurnPattern = {
			name: patternName,
			description: patternDescription,
			actions: [...actions]
		};
		onPatternChange(newPattern);
	}

	// Action management
	function addPhysicalAttack() {
		if (totalAPCost() + 1 <= maxAP) {
			actions = [...actions, createPhysicalAttack()];
			updatePattern();
		}
	}

	function addDefendAction(type: 'quick' | 'full') {
		const cost = type === 'quick' ? 1 : 3;
		if (totalAPCost() + cost <= maxAP) {
			actions = [...actions, createDefendAction(type)];
			updatePattern();
		}
	}

	function addManualEnd() {
		actions = [...actions, { type: 'manual_end', apCost: 0, description: 'End Turn' }];
		updatePattern();
	}

	function removeAction(index: number) {
		actions = actions.filter((_, i) => i !== index);
		updatePattern();
	}

	// Enhancement builder
	function addEnhancement(enhancementKey: string) {
		const enhancement = ENHANCEMENTS[enhancementKey];
		if (enhancement) {
			const newCost =
				enhancementSkillCost +
				[...selectedEnhancements, enhancement].reduce((sum, enh) => sum + enh.apCost, 0);

			if (totalAPCost() + newCost <= maxAP) {
				selectedEnhancements = [...selectedEnhancements, enhancement];
			}
		}
	}

	function removeEnhancement(index: number) {
		selectedEnhancements = selectedEnhancements.filter((_, i) => i !== index);
	}

	function addEnhancedAction() {
		if (selectedEnhancements.length > 0) {
			const enhancedAction = createEnhancedAction(enhancementSkillCost, selectedEnhancements);
			if (totalAPCost() + enhancedAction.apCost <= maxAP) {
				actions = [...actions, enhancedAction];
				selectedEnhancements = [];
				enhancementSkillCost = 1;
				showEnhancementBuilder = false;
				updatePattern();
			}
		}
	}

	function cancelEnhancementBuilder() {
		selectedEnhancements = [];
		enhancementSkillCost = 1;
		showEnhancementBuilder = false;
	}

	// Pattern metadata updates
	function updatePatternName(event: Event) {
		const target = event.target as HTMLInputElement;
		patternName = target.value;
		updatePattern();
	}

	function updatePatternDescription(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		patternDescription = target.value;
		updatePattern();
	}
</script>

<div class="turn-builder">
	<div class="pattern-header">
		<div class="form-group">
			<label for="patternName" class="form-label">Pattern Name:</label>
			<input
				id="patternName"
				type="text"
				value={patternName}
				oninput={updatePatternName}
				class="form-input"
				placeholder="Enter pattern name"
			/>
		</div>

		<div class="form-group">
			<label for="patternDescription" class="form-label">Description:</label>
			<textarea
				id="patternDescription"
				value={patternDescription}
				oninput={updatePatternDescription}
				class="form-textarea"
				placeholder="Describe this pattern"
				rows="2"
			></textarea>
		</div>

		<div class="turn-end-info">
			<h4>Turn End Rules:</h4>
			<ul class="turn-rules">
				<li>Turn ends immediately when using Enhanced Actions</li>
				<li>Turn ends immediately when using Defend Actions</li>
				<li>Turn ends when AP reaches 0</li>
				<li>Turn ends when Manual End is selected</li>
			</ul>
		</div>
	</div>

	<div class="ap-budget">
		<div class="budget-display">
			<span class="budget-used">{totalAPCost()}</span>
			<span class="budget-separator">/</span>
			<span class="budget-max">{maxAP}</span>
			<span class="budget-label">AP</span>
		</div>
		<div class="budget-bar">
			<div class="budget-fill" style="width: {Math.min((totalAPCost() / maxAP) * 100, 100)}%"></div>
		</div>
	</div>

	<div class="actions-list">
		<h4>Actions in Turn:</h4>
		{#each actions as action, index}
			<div class="action-item">
				<div class="action-info">
					<span class="action-description">{action.description}</span>
					<span class="action-cost">{action.apCost} AP</span>
				</div>
				<button class="btn-remove" onclick={() => removeAction(index)} title="Remove action">
					✕
				</button>
			</div>
		{/each}

		{#if actions.length === 0}
			<div class="empty-actions">
				<p>No actions added yet. Add actions below to build your turn.</p>
			</div>
		{/if}
	</div>

	<div class="action-buttons">
		<h4>Add Actions:</h4>

		<div class="button-grid">
			<button
				class="btn-action"
				onclick={addPhysicalAttack}
				disabled={totalAPCost() + 1 > maxAP}
				title="Physical Attack (1 AP)"
			>
				Physical Attack
				<span class="button-cost">1 AP</span>
			</button>

			<button
				class="btn-action"
				onclick={() => addDefendAction('quick')}
				disabled={totalAPCost() + 1 > maxAP}
				title="Quick Defend (1 AP)"
			>
				Quick Defend
				<span class="button-cost">1 AP</span>
			</button>

			<button
				class="btn-action"
				onclick={() => addDefendAction('full')}
				disabled={totalAPCost() + 3 > maxAP}
				title="Full Defend (3 AP)"
			>
				Full Defend
				<span class="button-cost">3 AP</span>
			</button>

			<button
				class="btn-action btn-enhancement"
				onclick={() => (showEnhancementBuilder = true)}
				disabled={totalAPCost() + 2 > maxAP}
				title="Build Enhanced Action (ends turn immediately)"
			>
				Enhanced Action
				<span class="button-cost">2+ AP</span>
			</button>

			<button class="btn-action btn-end" onclick={addManualEnd} title="End Turn manually">
				End Turn
				<span class="button-cost">0 AP</span>
			</button>
		</div>
	</div>

	{#if showEnhancementBuilder}
		<div class="enhancement-builder">
			<div class="enhancement-header">
				<h4>Build Enhanced Action</h4>
				<button class="btn-cancel" onclick={cancelEnhancementBuilder}> Cancel </button>
			</div>

			<div class="form-group">
				<label for="skillCost" class="form-label">Base Skill Cost:</label>
				<input
					id="skillCost"
					type="number"
					bind:value={enhancementSkillCost}
					min="1"
					max="10"
					class="form-input"
				/>
			</div>

			<div class="enhancements-section">
				<h5>Add Enhancements:</h5>
				<div class="enhancement-buttons">
					{#each Object.entries(ENHANCEMENTS) as [key, enhancement]}
						{@const currentCost =
							enhancementSkillCost + selectedEnhancements.reduce((sum, enh) => sum + enh.apCost, 0)}
						{@const wouldExceed = totalAPCost() + currentCost + enhancement.apCost > maxAP}
						<button
							class="btn-enhancement-add"
							onclick={() => addEnhancement(key)}
							disabled={wouldExceed}
							title={wouldExceed ? 'Would exceed AP budget' : enhancement.description}
						>
							{enhancement.name}
							<span class="enhancement-cost">+{enhancement.apCost} AP</span>
						</button>
					{/each}
				</div>

				{#if selectedEnhancements.length > 0}
					<div class="selected-enhancements">
						<h6>Selected Enhancements:</h6>
						{#each selectedEnhancements as enhancement, index}
							<div class="enhancement-item">
								<span class="enhancement-name">{enhancement.name}</span>
								<span class="enhancement-ap">{enhancement.apCost} AP</span>
								<button class="btn-remove-small" onclick={() => removeEnhancement(index)}>
									✕
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="enhancement-footer">
				<div class="enhancement-total">
					Total Cost: {enhancementSkillCost +
						selectedEnhancements.reduce((sum, enh) => sum + enh.apCost, 0)} AP
				</div>
				<button
					class="btn-add-enhanced"
					onclick={addEnhancedAction}
					disabled={selectedEnhancements.length === 0}
				>
					Add Enhanced Action
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.turn-builder {
		background: var(--bg-secondary);
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 8px 24px var(--shadow-light);
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.pattern-header {
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--border-primary);
	}

	.form-group {
		margin-bottom: 12px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 4px;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.form-input,
	.form-textarea {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		font-size: 14px;
		box-sizing: border-box;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 25%, transparent);
	}

	.turn-end-info {
		margin-top: 16px;
		padding: 12px;
		background: color-mix(in oklab, var(--bg-secondary) 80%, var(--color-primary) 20%);
		border: 1px solid color-mix(in oklab, var(--border-primary) 60%, var(--color-primary) 40%);
		border-radius: 10px;
		transition: var(--transition-theme);
	}

	.turn-end-info h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.turn-rules {
		margin: 0;
		padding-left: 16px;
		font-size: 12px;
		color: color-mix(in oklab, var(--color-primary) 75%, var(--text-secondary) 25%);
		line-height: 1.4;
	}

	.turn-rules li {
		margin-bottom: 2px;
	}

	.ap-budget {
		margin-bottom: 20px;
		padding: 12px;
		background-color: var(--bg-tertiary);
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.budget-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		margin-bottom: 8px;
		gap: 4px;
	}

	.budget-used {
		font-size: 24px;
		font-weight: 700;
		color: var(--color-primary);
	}

	.budget-separator {
		font-size: 18px;
		color: var(--text-secondary);
	}

	.budget-max {
		font-size: 18px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.budget-label {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.budget-bar {
		height: 6px;
		background-color: var(--border-primary);
		border-radius: 999px;
		overflow: hidden;
	}

	.budget-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-success) 0%,
			var(--color-primary) 50%,
			var(--color-warning) 80%,
			var(--color-error) 100%
		);
		transition: width 0.3s ease;
	}

	.actions-list {
		margin-bottom: 20px;
	}

	.actions-list h4,
	.action-buttons h4 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text-primary);
	}

	.action-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		margin-bottom: 8px;
		transition: var(--transition-theme);
	}

	.action-info {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.action-description {
		font-size: 14px;
		color: var(--text-primary);
	}

	.action-cost {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.btn-remove,
	.btn-remove-small {
		background-color: var(--color-error);
		color: var(--text-inverse);
		border: none;
		border-radius: 6px;
		padding: 4px 8px;
		cursor: pointer;
		font-size: 12px;
		transition: var(--transition-theme);
	}

	.btn-remove:hover,
	.btn-remove-small:hover {
		background-color: color-mix(in oklab, var(--color-error) 80%, black 20%);
	}

	.empty-actions {
		text-align: center;
		padding: 20px;
		color: var(--text-muted);
		font-style: italic;
	}

	.button-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.btn-action {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 8px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.btn-action:hover:not(:disabled) {
		background-color: color-mix(in oklab, var(--bg-tertiary) 70%, var(--color-primary) 30%);
		transform: translateY(-1px);
	}

	.btn-action:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-enhancement {
		background-color: color-mix(in oklab, var(--bg-tertiary) 70%, var(--color-primary) 30%);
		border-color: color-mix(in oklab, var(--border-primary) 50%, var(--color-primary) 50%);
		color: var(--color-primary);
	}

	.btn-enhancement:hover:not(:disabled) {
		background-color: color-mix(in oklab, var(--bg-tertiary) 55%, var(--color-primary) 45%);
	}

	.btn-end {
		background-color: color-mix(in oklab, var(--bg-tertiary) 70%, var(--color-warning) 30%);
		border-color: color-mix(in oklab, var(--border-primary) 50%, var(--color-warning) 50%);
		color: var(--color-warning);
	}

	.btn-end:hover:not(:disabled) {
		background-color: color-mix(in oklab, var(--bg-tertiary) 55%, var(--color-warning) 45%);
	}

	.button-cost {
		font-size: 12px;
		font-weight: 400;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.action-buttons {
		margin-top: 20px;
	}

	.enhancement-builder {
		margin-top: 20px;
		padding: 16px;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		box-shadow: 0 8px 24px var(--shadow-light);
		transition: var(--transition-theme);
	}

	.enhancement-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.enhancement-header h4 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.btn-cancel {
		background: transparent;
		border: 1px solid var(--border-secondary);
		color: var(--text-secondary);
		border-radius: 999px;
		padding: 4px 12px;
		cursor: pointer;
		font-size: 13px;
		transition: var(--transition-theme);
	}

	.btn-cancel:hover {
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.enhancements-section {
		margin-top: 16px;
	}

	.enhancements-section h5 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
		color: var(--color-primary);
	}

	.enhancement-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		margin-bottom: 12px;
	}

	.btn-enhancement-add {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 6px;
		background-color: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 10px;
		cursor: pointer;
		font-size: 12px;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.btn-enhancement-add:hover:not(:disabled) {
		background-color: var(--bg-tertiary);
		border-color: var(--color-primary);
	}

	.btn-enhancement-add:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.enhancement-cost {
		font-size: 11px;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.selected-enhancements {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 10px;
		padding: 8px;
		margin-bottom: 12px;
		transition: var(--transition-theme);
	}

	.selected-enhancements h6 {
		font-size: 13px;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: var(--color-primary);
	}

	.enhancement-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 8px;
		background-color: var(--bg-tertiary);
		border-radius: 6px;
		margin-bottom: 4px;
		border: 1px solid var(--border-primary);
	}

	.enhancement-item:last-child {
		margin-bottom: 0;
	}

	.enhancement-name {
		font-size: 12px;
		color: var(--text-primary);
		font-weight: 500;
	}

	.enhancement-ap {
		font-size: 11px;
		color: var(--text-secondary);
		margin-right: 8px;
	}

	.enhancement-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 12px;
		border-top: 1px solid var(--border-primary);
	}

	.enhancement-total {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.btn-add-enhanced {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border: none;
		border-radius: 999px;
		padding: 8px 20px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: var(--transition-theme);
	}

	.btn-add-enhanced:hover:not(:disabled) {
		background-color: var(--color-primary-hover);
	}

	.btn-add-enhanced:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--border-secondary);
		color: var(--text-muted);
	}

	/* Desktop improvements */
	@media (min-width: 768px) {
		.turn-builder {
			padding: 24px;
		}

		.button-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.enhancement-buttons {
			grid-template-columns: repeat(4, 1fr);
		}

		.budget-display {
			margin-bottom: 12px;
		}

		.budget-used {
			font-size: 28px;
		}

		.budget-separator {
			font-size: 20px;
		}

		.budget-max {
			font-size: 20px;
		}
	}
</style>
