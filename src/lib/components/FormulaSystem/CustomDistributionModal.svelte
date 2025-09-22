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
	const totalPercentage = $derived(
		Object.values(percentages).reduce((sum, val) => sum + val, 0)
	);

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
			Object.keys(percentages).forEach(key => {
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
		{ name: 'Tank', dist: { STR: 30, DEX: 10, INT: 5, CON: 40, WIS: 10, CHA: 5 } },
		{ name: 'Glass Cannon', dist: { STR: 5, DEX: 15, INT: 50, CON: 10, WIS: 15, CHA: 5 } },
		{ name: 'Speedster', dist: { STR: 15, DEX: 50, INT: 10, CON: 15, WIS: 5, CHA: 5 } },
		{ name: 'Support', dist: { STR: 5, DEX: 10, INT: 20, CON: 15, WIS: 35, CHA: 15 } },
		{ name: 'Hybrid', dist: { STR: 20, DEX: 20, INT: 20, CON: 20, WIS: 10, CHA: 10 } }
	];

	function applyPreset(preset: typeof presets[0]) {
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
				<h3 id="custom-modal-title">Custom Stat Distribution</h3>
				<p class="modal-subtitle">Set percentage allocation for each stat (must total 100%)</p>
			</div>

			<div class="presets-section">
				<h4>Quick Presets</h4>
				<div class="presets-grid">
					{#each presets as preset}
						<button 
							class="preset-btn"
							onclick={() => applyPreset(preset)}
							aria-label="Apply {preset.name} preset"
						>
							{preset.name}
						</button>
					{/each}
				</div>
			</div>

			<div class="percentages-section">
				<h4>Manual Distribution</h4>
				<div class="percentage-grid">
					{#each Object.entries(percentages) as [stat, value]}
						<div class="percentage-row">
							<label for="{stat}-percentage" class="stat-label">{stat}</label>
							<div class="input-group">
								<input
									id="{stat}-percentage"
									type="number"
									value={value.toFixed(2)}
									oninput={(e) => updatePercentage(stat, parseFloat((e.target as HTMLInputElement).value) || 0)}
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

			<div class="modal-actions">
				<button class="action-btn secondary" onclick={resetToBalanced}>
					Reset to Balanced
				</button>
				<button class="action-btn secondary" onclick={normalizePercentages}>
					Auto-Normalize
				</button>
				<button class="action-btn secondary" onclick={onClose}>
					Cancel
				</button>
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
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.custom-modal {
		background: white;
		border-radius: 16px;
		padding: 32px;
		max-width: 500px;
		width: 90vw;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		margin-bottom: 24px;
		text-align: center;
	}

	.modal-header h3 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 700;
		color: #374151;
	}

	.modal-subtitle {
		margin: 0;
		font-size: 14px;
		color: #6b7280;
	}

	.presets-section {
		margin-bottom: 32px;
	}

	.presets-section h4 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #4b5563;
	}

	.presets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 8px;
	}

	.preset-btn {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.preset-btn:hover {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.percentages-section h4 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: #4b5563;
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
	}

	.stat-label {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
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
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		text-align: right;
	}

	.percentage-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
	}

	.percentage-symbol {
		font-size: 14px;
		color: #6b7280;
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
	}

	.total-display.valid {
		background: #ecfdf5;
		border: 1px solid #10b981;
		color: #065f46;
	}

	.total-display.invalid {
		background: #fef2f2;
		border: 1px solid #ef4444;
		color: #7f1d1d;
	}

	.total-label {
		font-size: 14px;
	}

	.total-value {
		font-size: 16px;
	}

	.error-text {
		font-size: 12px;
		margin-left: auto;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.action-btn {
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.action-btn.primary {
		background: #667eea;
		color: white;
	}

	.action-btn.primary:hover:not(.disabled) {
		background: #5b67d1;
	}

	.action-btn.primary.disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.action-btn.secondary {
		background: #f3f4f6;
		border-color: #d1d5db;
		color: #374151;
	}

	.action-btn.secondary:hover {
		background: #e5e7eb;
	}

	@media (max-width: 768px) {
		.custom-modal {
			padding: 24px;
		}

		.percentage-row {
			flex-direction: column;
			align-items: stretch;
			gap: 8px;
		}

		.input-group {
			max-width: none;
		}

		.modal-actions {
			flex-direction: column;
		}

		.action-btn {
			width: 100%;
		}
	}

	@media (prefers-color-scheme: dark) {
		.custom-modal {
			background: #1f2937;
		}

		.modal-header h3 {
			color: #f9fafb;
		}

		.modal-subtitle {
			color: #d1d5db;
		}

		.presets-section h4,
		.percentages-section h4 {
			color: #e5e7eb;
		}

		.stat-label {
			color: #f3f4f6;
		}

		.preset-btn {
			background: #374151;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.preset-btn:hover {
			background: #7c3aed;
			border-color: #7c3aed;
		}

		.percentage-input {
			background: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.percentage-input:focus {
			border-color: #7c3aed;
			box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
		}

		.percentage-symbol {
			color: #9ca3af;
		}

		.total-display.valid {
			background: #064e3b;
			border-color: #10b981;
			color: #6ee7b7;
		}

		.total-display.invalid {
			background: #7f1d1d;
			border-color: #ef4444;
			color: #fca5a5;
		}

		.action-btn.primary {
			background: #7c3aed;
		}

		.action-btn.primary:hover:not(.disabled) {
			background: #6d28d9;
		}

		.action-btn.secondary {
			background: #374151;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.action-btn.secondary:hover {
			background: #4b5563;
		}
	}
</style>