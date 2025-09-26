<!-- src/lib/components/FormulaSystem/CustomDistributionModal.svelte -->
<script lang="ts">
	import type { CharacterStats } from '$lib/types/formulaPlanner.js';

	interface Props {
		isOpen: boolean;
		currentLevel: number;
		onClose: () => void;
		onApply: (distribution: Record<string, number>) => void;
	}

	let { isOpen, currentLevel, onClose, onApply }: Props = $props();

	// Default percentages for custom distribution
	let percentages = $state<Record<string, number>>({
		STR: 16.67,
		DEX: 16.67,
		INT: 16.67,
		CON: 16.67,
		WIS: 16.67,
		CHA: 16.67
	});

	// Calculate total percentage
	const totalPercentage = $derived(Object.values(percentages).reduce((sum, val) => sum + val, 0));

	// Validation
	const isValid = $derived(Math.abs(totalPercentage - 100) < 0.01);

	function resetToBalanced() {
		percentages = {
			STR: 16.67,
			DEX: 16.67,
			INT: 16.67,
			CON: 16.67,
			WIS: 16.67,
			CHA: 16.67
		};
	}

	function normalizePercentages() {
		const total = totalPercentage;
		if (total > 0) {
			Object.keys(percentages).forEach((key) => {
				percentages[key] = (percentages[key] / total) * 100;
			});
		}
	}

	function handleApply() {
		if (isValid) {
			onApply(percentages);
			onClose();
		}
	}

	function updatePercentage(stat: string, value: number) {
		percentages[stat] = Math.max(0, Math.min(100, value));
	}

	// Preset quick actions
	const presets = [
		{ name: 'Tank', dist: { STR: 30, DEX: 10, INT: 5, CON: 40, WIS: 10, CHA: 5 }, icon: '🛡️' },
		{
			name: 'Glass Cannon',
			dist: { STR: 5, DEX: 15, INT: 50, CON: 10, WIS: 15, CHA: 5 },
			icon: '💥'
		},
		{ name: 'Speedster', dist: { STR: 15, DEX: 50, INT: 10, CON: 15, WIS: 5, CHA: 5 }, icon: '💨' },
		{ name: 'Support', dist: { STR: 5, DEX: 10, INT: 20, CON: 15, WIS: 35, CHA: 15 }, icon: '🤝' },
		{ name: 'Hybrid', dist: { STR: 20, DEX: 20, INT: 20, CON: 20, WIS: 10, CHA: 10 }, icon: '⚖️' }
	];

	function applyPreset(preset: (typeof presets)[0]) {
		percentages = { ...preset.dist };
	}
</script>

{#if isOpen}
	<div
		class="modal-overlay"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	>
		<div
			class="modal custom-modal"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="custom-modal-title"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<div class="header-content">
					<h3 id="custom-modal-title">Custom Stat Distribution</h3>
					<p class="modal-subtitle">Set percentage allocation for each stat (must total 100%)</p>
				</div>
				<button class="close-btn" onclick={onClose} aria-label="Close dialog"> × </button>
			</div>

			<div class="modal-body">
				<div class="presets-section">
					<h4 class="section-title">Quick Presets</h4>
					<div class="presets-grid">
						{#each presets as preset}
							<button
								class="preset-btn"
								onclick={() => applyPreset(preset)}
								aria-label="Apply {preset.name} preset"
							>
								<span class="preset-icon">{preset.icon}</span>
								<span class="preset-name">{preset.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="percentages-section">
					<h4 class="section-title">Manual Distribution</h4>
					<div class="percentage-grid">
						{#each Object.entries(percentages) as [stat, value]}
							<div class="percentage-row">
								<label for="{stat}-percentage" class="stat-label">{stat}</label>
								<div class="input-group">
									<input
										id="{stat}-percentage"
										type="number"
										value={value.toFixed(2)}
										oninput={(e) =>
											updatePercentage(stat, parseFloat((e.target as HTMLInputElement).value) || 0)}
										min="0"
										max="100"
										step="0.01"
										class="percentage-input"
									/>
									<span class="percentage-symbol">%</span>
								</div>
							</div>
						{/each}
					</div>

					<div class="total-display {isValid ? 'valid' : 'invalid'}">
						<span class="total-label">Total:</span>
						<span class="total-value">{totalPercentage.toFixed(2)}%</span>
						{#if !isValid}
							<span class="error-text">Must equal 100%</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button class="action-btn secondary" onclick={resetToBalanced}> Reset to Balanced </button>
				<button class="action-btn secondary" onclick={normalizePercentages}>
					Auto-Normalize
				</button>
				<button class="action-btn secondary" onclick={onClose}> Cancel </button>
				<button
					class="action-btn primary {isValid ? '' : 'disabled'}"
					onclick={handleApply}
					disabled={!isValid}
				>
					Apply Distribution
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--bg-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.custom-modal {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		max-width: 500px;
		width: 90vw;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 50px var(--shadow-heavy);
		animation: slideUp 0.3s ease-out;
		display: flex;
		flex-direction: column;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 24px;
		border-bottom: 1px solid var(--border-primary);
		flex-shrink: 0;
	}

	.header-content {
		flex: 1;
	}

	.modal-header h3 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.modal-subtitle {
		margin: 0;
		font-size: 14px;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: var(--transition-theme);
		flex-shrink: 0;
		margin-left: 16px;
	}

	.close-btn:hover {
		color: var(--color-error);
		background-color: rgba(var(--color-error), 0.1);
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
	}

	.presets-section,
	.percentages-section {
		margin-bottom: 32px;
	}

	.percentages-section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.presets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 8px;
	}

	.preset-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 12px 8px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-theme);
		color: var(--text-primary);
	}

	.preset-btn:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px var(--shadow-medium);
	}

	.preset-icon {
		font-size: 20px;
	}

	.preset-name {
		font-weight: 600;
	}

	.percentage-grid {
		display: grid;
		gap: 12px;
		margin-bottom: 16px;
	}

	.percentage-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 8px 12px;
		background-color: var(--bg-tertiary);
		border-radius: 8px;
		border: 1px solid var(--border-primary);
	}

	.stat-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 40px;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
		max-width: 120px;
	}

	.percentage-input {
		flex: 1;
		padding: 6px 8px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		font-size: 14px;
		text-align: right;
		transition: var(--transition-theme);
	}

	.percentage-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary), 0.1);
	}

	.percentage-symbol {
		font-size: 14px;
		color: var(--text-muted);
		font-weight: 500;
	}

	.total-display {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 8px;
		font-weight: 600;
		margin-bottom: 24px;
		border: 2px solid;
		transition: var(--transition-theme);
	}

	.total-display.valid {
		background-color: rgba(var(--color-success), 0.1);
		border-color: var(--color-success);
		color: var(--color-success);
	}

	.total-display.invalid {
		background-color: rgba(var(--color-error), 0.1);
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.total-label {
		font-size: 14px;
	}

	.total-value {
		font-size: 16px;
		font-weight: 700;
	}

	.error-text {
		font-size: 12px;
		margin-left: auto;
		font-weight: 500;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		flex-wrap: wrap;
		padding: 24px;
		border-top: 1px solid var(--border-primary);
		flex-shrink: 0;
	}

	.action-btn {
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-theme);
		border: 1px solid transparent;
	}

	.action-btn.primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
	}

	.action-btn.primary:hover:not(.disabled) {
		background-color: var(--color-primary-hover);
		box-shadow: 0 2px 8px var(--shadow-medium);
	}

	.action-btn.primary.disabled {
		background-color: var(--text-muted);
		cursor: not-allowed;
		opacity: 0.5;
	}

	.action-btn.secondary {
		background-color: var(--bg-tertiary);
		border-color: var(--border-primary);
		color: var(--text-primary);
	}

	.action-btn.secondary:hover {
		background-color: var(--bg-primary);
		border-color: var(--color-secondary);
	}

	@media (max-width: 768px) {
		.custom-modal {
			margin: 20px;
			width: calc(100vw - 40px);
		}

		.modal-header {
			padding: 20px;
		}

		.modal-body {
			padding: 20px;
		}

		.percentage-row {
			flex-direction: column;
			align-items: stretch;
			gap: 8px;
		}

		.input-group {
			max-width: none;
		}

		.modal-footer {
			flex-direction: column;
			padding: 20px;
		}

		.action-btn {
			width: 100%;
		}
	}
</style>
