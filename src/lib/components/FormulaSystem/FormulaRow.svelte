<!-- src/lib/components/FormulaSystem/FormulaRow.svelte -->
<script lang="ts">
	import type { CharacterStats, DerivedStats } from '$lib/types/formulaPlanner.js';

	interface Props {
		label: string;
		statName: keyof DerivedStats;
		formula: string;
		isPercentage?: boolean;
		stats: CharacterStats;
		onFormulaUpdate: (statName: keyof DerivedStats, formula: string) => void;
		onCopy: (formula: string) => void;
	}

	let { label, statName, formula, isPercentage = false, stats, onFormulaUpdate, onCopy }: Props = $props();

	// Define the validation result type
	interface ValidationResult {
		isValid: boolean;
		error?: string;
		result?: number;
	}

	function validateFormula(formula: string, stats: CharacterStats): ValidationResult {
		if (!formula.trim()) {
			return { isValid: false, error: 'Formula is empty' };
		}

		try {
			const context = {
				level: stats.level,
				strength: stats.strength, STR: stats.strength,
				dexterity: stats.dexterity, DEX: stats.dexterity,
				intelligence: stats.intelligence, INT: stats.intelligence,
				constitution: stats.constitution, CON: stats.constitution,
				wisdom: stats.wisdom, WIS: stats.wisdom,
				charisma: stats.charisma, CHA: stats.charisma,
				Math: Math,
				min: Math.min,
				exp: Math.exp,
				max: Math.max,
				floor: Math.floor,
				ceil: Math.ceil,
				round: Math.round,
				pow: Math.pow,
				sqrt: Math.sqrt,
				log: Math.log
			};

			const func = new Function(...Object.keys(context), `return ${formula}`);
			const result = func(...Object.values(context));
			
			if (typeof result !== 'number') {
				return { isValid: false, error: 'Formula must return a number' };
			}
			if (isNaN(result)) {
				return { isValid: false, error: 'Formula produces NaN (check for division by zero)' };
			}
			if (!isFinite(result)) {
				return { isValid: false, error: 'Formula produces infinite value' };
			}

			return { isValid: true, result: Math.round(result * 100) / 100 };
		} catch (error) {
			if (error instanceof ReferenceError) {
				return { isValid: false, error: 'Unknown variable or function used' };
			} else if (error instanceof SyntaxError) {
				return { isValid: false, error: 'Invalid formula syntax' };
			} else {
				return { isValid: false, error: 'Formula evaluation error' };
			}
		}
	}

	// Compute validation reactively
	const validation = $derived(validateFormula(formula, stats));
</script>

<div class="formula-row">
	<div class="formula-label">{label}</div>
	<div class="formula-value">
		{#if validation.isValid && validation.result !== undefined}
			<span class="value-number">{isPercentage ? validation.result.toFixed(1) + '%' : validation.result}</span>
		{:else}
			<span class="value-error" title={validation.error}>Error</span>
		{/if}
	</div>
	<input
		type="text"
		value={formula}
		oninput={(e) => onFormulaUpdate(statName, (e.target as HTMLInputElement).value)}
		class="formula-input {validation.isValid ? 'valid' : 'invalid'}"
		placeholder="Enter formula..."
		aria-label="{label} formula"
	/>
	<button
		class="copy-button-small"
		onclick={() => onCopy(formula)}
		aria-label="Copy {label.toLowerCase()} formula"
		title="Copy formula to clipboard"
	>
		📋
	</button>
</div>

<style>
	.formula-row {
		display: grid;
		grid-template-columns: 90px 60px 1fr 32px;
		gap: 8px;
		align-items: center;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 8px;
		transition: var(--transition-theme);
	}

	.formula-row:hover {
		border-color: var(--color-primary);
		box-shadow: 0 1px 4px var(--shadow-light);
	}

	.formula-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		text-align: right;
		padding-right: 4px;
	}

	.formula-value {
		text-align: center;
	}

	.copy-button-small {
		background-color: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 4px;
		padding: 4px;
		cursor: pointer;
		font-size: 12px;
		transition: var(--transition-theme);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.copy-button-small:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
		transform: scale(1.05);
		box-shadow: 0 1px 4px var(--shadow-medium);
	}

	.value-number {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-success);
		background-color: rgba(var(--color-success), 0.1);
		padding: 2px 6px;
		border-radius: 4px;
		min-width: 50px;
		text-align: center;
		display: inline-block;
		border: 1px solid rgba(var(--color-success), 0.2);
	}

	.value-error {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-error);
		background-color: rgba(var(--color-error), 0.1);
		padding: 2px 6px;
		border-radius: 4px;
		text-align: center;
		display: inline-block;
		border: 1px solid rgba(var(--color-error), 0.2);
	}

	.formula-input {
		width: 100%;
		padding: 12px 16px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 14px;
		transition: var(--transition-theme);
	}

	.formula-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
	}

	.formula-input.invalid {
		border-color: var(--color-error);
		background-color: rgba(var(--color-error), 0.05);
	}

	.formula-input.valid {
		border-color: var(--color-success);
	}

	.formula-input::placeholder {
		color: var(--text-muted);
		opacity: 0.7;
	}
</style>