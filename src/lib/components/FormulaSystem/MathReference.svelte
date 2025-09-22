<!-- src/lib/components/FormulaSystem/MathReference.svelte -->
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
				<div class="example-top">
					<div class="title-section">
						<h4>{example.name}</h4>
						<p class="description">{example.description}</p>
					</div>
					<div class="chart-section">
						<svg class="progression-chart" width="100" height="50" viewBox="0 0 100 50">
							{#if example.name === 'Linear Scaling'}
								<path d="M 5 45 L 95 5" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Logarithmic (Diminishing Returns)'}
								<path d="M 5 45 Q 25 20, 50 12 T 95 8" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Square Root Scaling'}
								<path d="M 5 45 Q 30 25, 65 18 L 95 15" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Exponential Growth'}
								<path d="M 5 45 L 30 38 Q 55 25, 70 15 L 95 5" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Soft Cap with Breakpoint'}
								<path d="M 5 45 L 50 18 L 95 15" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Percentage Modifier'}
								<path d="M 5 45 Q 50 25, 95 10" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Sigmoid Curve (S-Curve)'}
								<path d="M 5 40 Q 25 38, 30 30 Q 50 20, 70 20 Q 75 20, 95 15" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Compound Formula'}
								<path d="M 5 45 Q 40 28, 65 22 L 80 18 L 95 18" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Stepped Progression'}
								<path d="M 5 45 L 30 32 L 30 28 L 65 22 L 65 18 L 95 15" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Multi-Breakpoint System'}
								<path d="M 5 45 L 18 38 L 18 35 L 40 28 L 40 25 L 70 20 L 70 17 L 95 12" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Synergy Bonus'}
								<path d="M 5 45 Q 30 32, 55 20 Q 75 10, 95 5" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Conditional Scaling'}
								<path d="M 5 45 L 40 30 L 40 26 Q 65 20, 95 15" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Weighted Average'}
								<path d="M 5 45 L 95 10" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Asymptotic Curve'}
								<path d="M 5 45 Q 30 22, 55 15 Q 80 10, 95 9" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Resource Regeneration'}
								<path d="M 5 45 Q 40 25, 65 18 Q 85 13, 95 12" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else if example.name === 'Risk/Reward Balance'}
								<path d="M 5 45 Q 40 22, 65 15 Q 85 11, 95 10" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{:else}
								<path d="M 5 45 L 95 10" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
							{/if}
						</svg>
					</div>
				</div>

				<div class="formula-section">
					<div class="formula-display">
						<code>{example.formula}</code>
					</div>
					<button 
						class="copy-btn"
						onclick={() => copyFormula(example.formula)}
						title="Copy formula to clipboard"
					>
						Copy
					</button>
				</div>

				<div class="explanation-section">
					<p class="explanation">{example.explanation}</p>
					<div class="usage-tag">
						<strong>Best for:</strong> {example.usage}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="reference-section">
		<div class="reference-card">
			<h4>Available Variables</h4>
			<div class="reference-grid">
				<div class="ref-item"><code>level</code> - Character level</div>
				<div class="ref-item"><code>STR</code> or <code>strength</code> - Strength stat</div>
				<div class="ref-item"><code>DEX</code> or <code>dexterity</code> - Dexterity stat</div>
				<div class="ref-item"><code>INT</code> or <code>intelligence</code> - Intelligence stat</div>
				<div class="ref-item"><code>CON</code> or <code>constitution</code> - Constitution stat</div>
				<div class="ref-item"><code>WIS</code> or <code>wisdom</code> - Wisdom stat</div>
				<div class="ref-item"><code>CHA</code> or <code>charisma</code> - Charisma stat</div>
			</div>
		</div>

		<div class="reference-card">
			<h4>Math Functions</h4>
			<div class="reference-grid">
				<div class="ref-item"><code>pow(base, exponent)</code> - Power/exponential</div>
				<div class="ref-item"><code>sqrt(number)</code> - Square root</div>
				<div class="ref-item"><code>log(number)</code> - Natural logarithm</div>
				<div class="ref-item"><code>min(a, b, ...)</code> - Minimum value</div>
				<div class="ref-item"><code>max(a, b, ...)</code> - Maximum value</div>
				<div class="ref-item"><code>floor(number)</code> - Round down</div>
				<div class="ref-item"><code>ceil(number)</code> - Round up</div>
				<div class="ref-item"><code>round(number)</code> - Round to nearest</div>
			</div>
		</div>
	</div>
</div>

<style>
	.math-content {
		padding: 24px;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Introduction Section */
	.math-intro {
		background: white;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 32px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		text-align: center;
	}

	.math-intro h3 {
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: 700;
		color: #374151;
	}

	.math-intro p {
		margin: 0;
		font-size: 16px;
		color: #6b7280;
		line-height: 1.6;
		max-width: 600px;
		margin: 0 auto;
	}

	/* Math Examples Grid */
	.math-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 24px;
		margin-bottom: 40px;
	}

	.math-example {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		border: 1px solid #e5e7eb;
		transition: box-shadow 0.2s ease;
	}

	.math-example:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.12);
	}

	/* Top Section: Title + Chart */
	.example-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
		gap: 16px;
	}

	.title-section {
		flex: 1;
	}

	.title-section h4 {
		margin: 0 0 4px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.description {
		margin: 0;
		font-size: 14px;
		color: #6b7280;
		font-style: italic;
		line-height: 1.4;
	}

	.chart-section {
		flex-shrink: 0;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progression-chart {
		display: block;
	}

	/* Formula Section */
	.formula-section {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.formula-display {
		flex: 1;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 12px 16px;
		font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
		font-size: 14px;
		color: #1f2937;
		overflow-x: auto;
	}

	.copy-btn {
		background: #8b5cf6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
		flex-shrink: 0;
	}

	.copy-btn:hover {
		background: #7c3aed;
	}

	/* Explanation Section */
	.explanation-section {
		border-top: 1px solid #f3f4f6;
		padding-top: 16px;
	}

	.explanation {
		margin: 0 0 12px 0;
		font-size: 14px;
		color: #374151;
		line-height: 1.5;
	}

	.usage-tag {
		font-size: 13px;
		color: #1e40af;
		background: #eff6ff;
		padding: 8px 12px;
		border-radius: 6px;
		border-left: 3px solid #3b82f6;
	}

	/* Reference Section */
	.reference-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.reference-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.reference-card h4 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.reference-grid {
		display: grid;
		gap: 8px;
	}

	.ref-item {
		padding: 8px 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		color: #374151;
	}

	.ref-item code {
		background: #e0f2fe;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
		font-weight: 600;
		color: #0c4a6e;
	}

	/* Responsive Design */
	@media (max-width: 767px) {
		.math-content {
			padding: 16px;
		}

		.math-examples {
			grid-template-columns: 1fr;
		}

		.example-top {
			flex-direction: column;
			align-items: stretch;
		}

		.chart-section {
			align-self: center;
		}

		.math-intro, .math-example, .reference-card {
			padding: 16px;
		}

		.reference-section {
			grid-template-columns: 1fr;
		}
	}

	/* Dark Mode */
	@media (prefers-color-scheme: dark) {
		.math-intro, .math-example, .reference-card {
			background: #1f2937;
			border-color: #374151;
		}

		.math-intro h3, .title-section h4, .reference-card h4 {
			color: #f9fafb;
		}

		.math-intro p, .description {
			color: #d1d5db;
		}

		.explanation {
			color: #e5e7eb;
		}

		.chart-section, .formula-display, .ref-item {
			background: #111827;
			border-color: #374151;
			color: #f9fafb;
		}

		.ref-item code {
			background: #1e40af;
			color: #dbeafe;
		}

		.usage-tag {
			background: #1e3a8a;
			border-color: #3b82f6;
			color: #dbeafe;
		}

		.explanation-section {
			border-color: #374151;
		}
	}
</style>