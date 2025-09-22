<!-- src/lib/components/formulas/MathReference.svelte -->
<script lang="ts">
	import { MATH_EXAMPLES } from '$lib/types/formulaPlanner.js';

	// Copy formula to clipboard
	function copyFormula(formula: string) {
		navigator.clipboard.writeText(formula).catch(() => {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = formula;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		});
	}
</script>

<div class="math-content">
	<div class="math-intro">
		<h3>Game Math Reference</h3>
		<p>
			Different mathematical functions create different gameplay experiences. 
			Use these patterns to design stat systems that feel balanced and engaging.
		</p>
	</div>

	<div class="math-examples">
		{#each MATH_EXAMPLES as example}
			<div class="math-example">
				<div class="example-header">
					<h4>{example.name}</h4>
					<button 
						class="copy-btn"
						onclick={() => copyFormula(example.formula)}
						title="Copy formula"
					>
						📋
					</button>
				</div>
				<div class="example-description">{example.description}</div>
				<div class="example-formula">
					<code>{example.formula}</code>
				</div>
				<div class="example-explanation">{example.explanation}</div>
				<div class="example-usage">
					<strong>Best for:</strong> {example.usage}
				</div>
			</div>
		{/each}
	</div>

	<div class="variables-reference">
		<h4>Available Variables</h4>
		<div class="variables-grid">
			<div class="variable-item">
				<code>level</code> - Character level
			</div>
			<div class="variable-item">
				<code>STR</code> or <code>strength</code> - Strength stat
			</div>
			<div class="variable-item">
				<code>DEX</code> or <code>dexterity</code> - Dexterity stat
			</div>
			<div class="variable-item">
				<code>INT</code> or <code>intelligence</code> - Intelligence stat
			</div>
			<div class="variable-item">
				<code>CON</code> or <code>constitution</code> - Constitution stat
			</div>
			<div class="variable-item">
				<code>WIS</code> or <code>wisdom</code> - Wisdom stat
			</div>
			<div class="variable-item">
				<code>CHA</code> or <code>charisma</code> - Charisma stat
			</div>
		</div>

		<h4>Math Functions</h4>
		<div class="functions-grid">
			<div class="function-item">
				<code>pow(base, exponent)</code> - Power/exponential
			</div>
			<div class="function-item">
				<code>sqrt(number)</code> - Square root
			</div>
			<div class="function-item">
				<code>log(number)</code> - Natural logarithm
			</div>
			<div class="function-item">
				<code>min(a, b, ...)</code> - Minimum value
			</div>
			<div class="function-item">
				<code>max(a, b, ...)</code> - Maximum value
			</div>
			<div class="function-item">
				<code>floor(number)</code> - Round down
			</div>
			<div class="function-item">
				<code>ceil(number)</code> - Round up
			</div>
			<div class="function-item">
				<code>round(number)</code> - Round to nearest
			</div>
		</div>
	</div>
</div>

<style>
	/* Math Reference Content */
	.math-content {
		padding: 24px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.math-intro {
		background: white;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.math-intro h3 {
		margin: 0 0 12px 0;
		font-size: 20px;
		font-weight: 600;
		color: #374151;
	}

	.math-intro p {
		margin: 0;
		font-size: 16px;
		color: #374151;
		line-height: 1.6;
	}

	.math-examples {
		display: grid;
		gap: 16px;
		margin-bottom: 32px;
	}

	.math-example {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		border: 1px solid #e5e7eb;
	}

	.example-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.example-header h4 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.example-description {
		font-size: 14px;
		color: #6b7280;
		margin-bottom: 12px;
		font-style: italic;
	}

	.example-formula {
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 12px;
		margin-bottom: 12px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 14px;
		color: #1f2937;
		overflow-x: auto;
	}

	.example-formula code {
		background: none;
		padding: 0;
		font-family: inherit;
	}

	.example-explanation {
		font-size: 14px;
		color: #374151;
		line-height: 1.5;
		margin-bottom: 8px;
	}

	.example-usage {
		font-size: 14px;
		color: #6b7280;
		padding: 8px 12px;
		background-color: #f0f9ff;
		border-left: 3px solid #0ea5e9;
		border-radius: 0 4px 4px 0;
	}

	.variables-reference {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.variables-reference h4 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.variables-reference h4:not(:first-child) {
		margin-top: 24px;
	}

	.variables-grid, .functions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 8px;
	}

	.variable-item, .function-item {
		padding: 8px 12px;
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		color: #374151;
	}

	.variable-item code, .function-item code {
		background-color: #e0f2fe;
		padding: 2px 4px;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-weight: 600;
		color: #0c4a6e;
	}

	.copy-btn {
		background: none;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 6px 8px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	.copy-btn:hover {
		background-color: #f3f4f6;
		border-color: #9ca3af;
	}

	/* Responsive Design */
	@media (min-width: 1024px) {
		.variables-grid, .functions-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.variables-grid, .functions-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 767px) {
		.math-content {
			padding: 16px;
		}

		.math-intro, .math-example, .variables-reference {
			padding: 16px;
		}

		.variables-grid, .functions-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.math-intro, .math-example, .variables-reference {
			background: #1f2937;
			border-color: #374151;
		}

		.math-intro h3, .example-header h4, .variables-reference h4 {
			color: #f9fafb;
		}

		.math-intro p {
			color: #d1d5db;
		}

		.example-description {
			color: #9ca3af;
		}

		.example-explanation {
			color: #e5e7eb;
		}

		.example-formula {
			background-color: #111827;
			border-color: #374151;
			color: #f9fafb;
		}

		.example-usage {
			background-color: #1e3a8a;
			border-color: #3b82f6;
			color: #dbeafe;
		}

		.variable-item, .function-item {
			background-color: #111827;
			border-color: #374151;
			color: #f9fafb;
		}

		.variable-item code, .function-item code {
			background-color: #1e40af;
			color: #dbeafe;
		}

		.copy-btn {
			background: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.copy-btn:hover {
			background-color: #374151;
			border-color: #6b7280;
		}
	}
</style>