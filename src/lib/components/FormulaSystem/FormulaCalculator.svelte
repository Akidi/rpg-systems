<!-- src/lib/components/formulas/FormulaCalculator.svelte -->
<script lang="ts">
	import type { 
		CharacterStats, 
		DerivedStats, 
		FormulaSet, 
		CharacterBuild
	} from '$lib/types/formulaPlanner.js';
	import { EXAMPLE_BUILDS } from '$lib/types/formulaPlanner.js';

	interface Props {
		currentFormulas: FormulaSet;
		selectedBuild: CharacterBuild;
		derivedStats: DerivedStats | null;
		onFormulaUpdate: (statName: keyof DerivedStats, formula: string) => void;
		onBuildLoad: (buildIndex: number) => void;
		onStatUpdate: (statName: keyof CharacterStats, value: number) => void;
	}

	let { 
		currentFormulas,
		selectedBuild,
		derivedStats,
		onFormulaUpdate,
		onBuildLoad,
		onStatUpdate
	}: Props = $props();

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

<div class="planner-content">
	<div class="layout">
		<!-- Character Setup Sidebar -->
		<aside class="sidebar">
			<div class="section">
				<h3>Character Setup</h3>
				
				<div class="build-selector">
					<h4>Example Builds:</h4>
					{#each EXAMPLE_BUILDS as build, index}
						<button 
							class="build-btn {selectedBuild.name === build.name ? 'active' : ''}"
							onclick={() => onBuildLoad(index)}
						>
							{build.name}
						</button>
					{/each}
				</div>

				<div class="stat-inputs">
					<div class="form-group">
						<label for="level-input" class="form-label">Level:</label>
						<input 
							id="level-input"
							type="number" 
							value={selectedBuild.stats.level}
							oninput={(e) => onStatUpdate('level', parseInt((e.target as HTMLInputElement).value) || 1)}
							min="1"
							max="100"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="strength-input" class="form-label">Strength (STR):</label>
						<input 
							id="strength-input"
							type="number" 
							value={selectedBuild.stats.strength}
							oninput={(e) => onStatUpdate('strength', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="dexterity-input" class="form-label">Dexterity (DEX):</label>
						<input 
							id="dexterity-input"
							type="number" 
							value={selectedBuild.stats.dexterity}
							oninput={(e) => onStatUpdate('dexterity', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="intelligence-input" class="form-label">Intelligence (INT):</label>
						<input 
							id="intelligence-input"
							type="number" 
							value={selectedBuild.stats.intelligence}
							oninput={(e) => onStatUpdate('intelligence', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="constitution-input" class="form-label">Constitution (CON):</label>
						<input 
							id="constitution-input"
							type="number" 
							value={selectedBuild.stats.constitution}
							oninput={(e) => onStatUpdate('constitution', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="wisdom-input" class="form-label">Wisdom (WIS):</label>
						<input 
							id="wisdom-input"
							type="number" 
							value={selectedBuild.stats.wisdom}
							oninput={(e) => onStatUpdate('wisdom', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>

					<div class="form-group">
						<label for="charisma-input" class="form-label">Charisma (CHA):</label>
						<input 
							id="charisma-input"
							type="number" 
							value={selectedBuild.stats.charisma}
							oninput={(e) => onStatUpdate('charisma', parseInt((e.target as HTMLInputElement).value) || 0)}
							min="0"
							max="999"
							class="form-input"
						/>
					</div>
				</div>
			</div>
		</aside>

		<!-- Main Formula Editor -->
		<main class="main-content">
			<div class="formula-editor">
				<h3>Formula Editor</h3>
				<p class="help-text">
					Available variables: <code>level</code>, <code>STR</code>, <code>DEX</code>, <code>INT</code>, <code>CON</code>, <code>WIS</code>, <code>CHA</code><br>
					Math functions: <code>pow()</code>, <code>sqrt()</code>, <code>log()</code>, <code>min()</code>, <code>max()</code>, <code>floor()</code>, <code>ceil()</code>
				</p>

				<div class="formulas-grid">
					{#each Object.entries(currentFormulas.formulas) as [statName, formula]}
						{@const typedStatName = statName as keyof DerivedStats}
						<div class="formula-row">
							<div class="formula-info">
								<label for="formula-{statName}" class="formula-label">{statName}:</label>
								{#if derivedStats}
									<span class="formula-result">{derivedStats[typedStatName]}</span>
								{:else}
									<span class="formula-error">Error</span>
								{/if}
							</div>
							<div class="formula-input-container">
								<input 
									id="formula-{statName}"
									type="text" 
									value={formula}
									oninput={(e) => onFormulaUpdate(typedStatName, (e.target as HTMLInputElement).value)}
									class="formula-input {derivedStats ? '' : 'error'}"
									placeholder="Enter formula..."
								/>
								<button 
									class="copy-btn"
									onclick={() => copyFormula(formula)}
									title="Copy formula"
								>
									📋
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if derivedStats}
				<div class="stats-preview">
					<h3>Live Preview</h3>
					<div class="stats-grid">
						{#each Object.entries(derivedStats) as [statName, value]}
							<div class="stat-card">
								<div class="stat-name">{statName}</div>
								<div class="stat-value">{value}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	/* Layout and Content */
	.planner-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
	}

	.sidebar {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		order: 2;
	}

	.main-content {
		padding: 24px;
		order: 1;
	}

	/* Sidebar Sections */
	.section {
		padding: 20px;
		border-bottom: 1px solid #f3f4f6;
	}

	.section:last-child {
		border-bottom: none;
	}

	.section h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	/* Build Selector */
	.build-selector h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
	}

	.build-btn {
		display: block;
		width: 100%;
		margin-bottom: 6px;
		padding: 8px 12px;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		color: #374151;
		text-align: left;
		transition: all 0.2s;
	}

	.build-btn:hover {
		background-color: #f3f4f6;
	}

	.build-btn.active {
		background-color: #ede9fe;
		border-color: #8b5cf6;
		color: #8b5cf6;
	}

	/* Form Inputs */
	.stat-inputs {
		margin-top: 16px;
	}

	.form-group {
		margin-bottom: 12px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 4px;
		color: #374151;
	}

	.form-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #8b5cf6;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
	}

	/* Formula Editor */
	.formula-editor {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		margin-bottom: 24px;
	}

	.formula-editor h3 {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 600;
		color: #374151;
	}

	.help-text {
		margin: 0 0 24px 0;
		padding: 12px;
		background-color: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 8px;
		font-size: 14px;
		color: #0c4a6e;
		line-height: 1.5;
	}

	.help-text code {
		background-color: #e0f2fe;
		padding: 2px 4px;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
	}

	.formulas-grid {
		display: grid;
		gap: 16px;
	}

	.formula-row {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 12px;
		align-items: center;
	}

	.formula-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.formula-label {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		text-transform: capitalize;
	}

	.formula-result {
		font-size: 18px;
		font-weight: 700;
		color: #059669;
	}

	.formula-error {
		font-size: 14px;
		font-weight: 600;
		color: #ef4444;
	}

	.formula-input-container {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.formula-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 14px;
	}

	.formula-input:focus {
		outline: none;
		border-color: #8b5cf6;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
	}

	.formula-input.error {
		border-color: #ef4444;
		background-color: #fef2f2;
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

	/* Stats Preview */
	.stats-preview {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.stats-preview h3 {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #374151;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px;
	}

	.stat-card {
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 12px;
		text-align: center;
	}

	.stat-name {
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		text-transform: capitalize;
		margin-bottom: 4px;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 700;
		color: #374151;
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.layout {
			grid-template-columns: 300px 1fr;
		}

		.sidebar {
			border-bottom: none;
			border-right: 1px solid #e5e7eb;
			order: 1;
		}

		.main-content {
			order: 2;
		}

		.formula-row {
			grid-template-columns: 160px 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.formula-row {
			grid-template-columns: 180px 1fr;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 767px) {
		.main-content {
			padding: 16px;
		}

		.formula-editor, .stats-preview {
			padding: 16px;
		}

		.formula-row {
			grid-template-columns: 1fr;
			gap: 8px;
		}

		.formula-info {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.sidebar {
			background: #1f2937;
			border-color: #374151;
		}

		.formula-editor, .stats-preview {
			background: #1f2937;
			border-color: #374151;
		}

		.section {
			border-color: #374151;
		}

		.form-input, .formula-input {
			background: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.form-input:focus, .formula-input:focus {
			border-color: #a855f7;
			box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1);
		}

		.formula-input.error {
			border-color: #ef4444;
			background-color: #1f2937;
			color: #f9fafb;
		}

		.build-btn {
			background-color: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.build-btn:hover {
			background-color: #374151;
		}

		.build-btn.active {
			background-color: #1e1b4b;
			border-color: #a855f7;
			color: #a855f7;
		}

		.stat-card {
			background-color: #111827;
			border-color: #374151;
		}

		.help-text {
			background-color: #1e3a8a;
			border-color: #3b82f6;
			color: #bfdbfe;
		}

		.help-text code {
			background-color: #1e40af;
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