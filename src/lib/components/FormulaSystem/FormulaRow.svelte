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
		background: #fafbfc;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 8px;
		transition: all 0.2s ease;
	}

	.formula-row:hover {
		border-color: #667eea;
		box-shadow: 0 1px 4px rgba(102, 126, 234, 0.1);
	}

	.formula-label {
		font-size: 12px;
		font-weight: 600;
		color: #374151;
		text-align: right;
		padding-right: 4px;
	}

	.formula-value {
		text-align: center;
	}

	.copy-button-small {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 4px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s ease;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.copy-button-small:hover {
		background: #667eea;
		border-color: #667eea;
		transform: scale(1.05);
	}

	.value-number {
		font-size: 14px;
		font-weight: 700;
		color: #059669;
		background: #ecfdf5;
		padding: 2px 6px;
		border-radius: 4px;
		min-width: 50px;
		text-align: center;
		display: inline-block;
	}

	.value-error {
		font-size: 12px;
		font-weight: 600;
		color: #dc2626;
		background: #fef2f2;
		padding: 2px 6px;
		border-radius: 4px;
		text-align: center;
		display: inline-block;
	}

	.formula-input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 14px;
		background: white;
		transition: all 0.2s ease;
	}

	.formula-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.formula-input.invalid {
		border-color: #dc2626;
		background: #fef2f2;
	}

	.formula-input.valid {
		border-color: #059669;
	}

	@media (prefers-color-scheme: dark) {
		.formula-row {
			background: #111827;
			border-color: #4b5563;
		}

		.formula-row:hover {
			border-color: #7c3aed;
		}

		.formula-label {
			color: #e5e7eb;
		}

		.value-number {
			background: #064e3b;
			color: #6ee7b7;
		}

		.value-error {
			background: #7f1d1d;
			color: #fca5a5;
		}

		.formula-input {
			background: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.formula-input:focus {
			border-color: #7c3aed;
			box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
		}

		.copy-button-small {
			background: #374151;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.copy-button-small:hover {
			background: #7c3aed;
			border-color: #7c3aed;
		}
	}
</style>