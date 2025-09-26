<!-- src/lib/components/APProgression/ConfigPanel.svelte -->
<script lang="ts">
	import {
		SCALING_FORMULAS,
		type APConfig,
		type ScalingFormula
	} from '$lib/types/apProgression.js';

	interface Props {
		config: APConfig;
		selectedFormula: ScalingFormula;
		chartMaxLevel: number;
		onConfigChange: (config: APConfig) => void;
		onFormulaChange: (formula: ScalingFormula) => void;
		onChartMaxLevelChange: (level: number) => void;
	}

	let {
		config,
		selectedFormula,
		chartMaxLevel,
		onConfigChange,
		onFormulaChange,
		onChartMaxLevelChange
	}: Props = $props();

	// Update selected formula when scaling type changes
	function updateFormula(event: Event) {
		const target = event.target as HTMLSelectElement;
		if (target) {
			const formula = SCALING_FORMULAS.find((f) => f.type === target.value);
			if (formula) {
				onFormulaChange(formula);
				const newConfig = { ...config, scalingType: formula.type };
				onConfigChange(newConfig);
			}
		}
	}

	// Config update helper
	function updateConfig(updates: Partial<APConfig>) {
		const newConfig = { ...config, ...updates };
		onConfigChange(newConfig);
	}

	// Universal system presets
	function setEarlyFocus() {
		updateConfig({
			dexPerAP: 8,
			postSoftCapDexBase: 30,
			postSoftCapDexMultiplier: 1.8
		});
	}

	function setBalanced() {
		updateConfig({
			dexPerAP: 10,
			postSoftCapDexBase: 50,
			postSoftCapDexMultiplier: 2.0
		});
	}

	function setLateFocus() {
		updateConfig({
			dexPerAP: 12,
			postSoftCapDexBase: 75,
			postSoftCapDexMultiplier: 2.5
		});
	}

	// Legacy formula presets
	function setConservativeScaling() {
		updateConfig({
			linearMultiplier: 0.3,
			logarithmicMultiplier: 1.5,
			softCapMultiplier: 1.0,
			milestoneInterval: 15,
			dexPerAP: 15,
			dexDiminishingThreshold: 30,
			dexDiminishingRatio: 3
		});
	}

	function setAggressiveScaling() {
		updateConfig({
			linearMultiplier: 1.0,
			logarithmicMultiplier: 3.0,
			softCapMultiplier: 2.5,
			milestoneInterval: 5,
			dexPerAP: 5,
			dexDiminishingThreshold: 75,
			dexDiminishingRatio: 1.5
		});
	}

	function setBalancedScaling() {
		updateConfig({
			linearMultiplier: 0.5,
			logarithmicMultiplier: 2.0,
			softCapMultiplier: 1.5,
			milestoneInterval: 10,
			dexPerAP: 10,
			dexDiminishingThreshold: 50,
			dexDiminishingRatio: 2
		});
	}
</script>

<div class="config-panel">
	<h2 class="panel-title">
		<span class="panel-icon">⚙️</span>
		Base Configuration
	</h2>

	<div class="form-group">
		<label for="baseAP" class="form-label">Base AP (Level 1):</label>
		<input
			id="baseAP"
			type="number"
			value={config.baseAP}
			oninput={(e) => updateConfig({ baseAP: parseInt((e.target as HTMLInputElement).value) || 3 })}
			min="1"
			max="10"
			class="form-input"
		/>
	</div>

	<div class="form-group">
		<label for="scalingFormula" class="form-label">Scaling Formula:</label>
		<select
			id="scalingFormula"
			value={config.scalingType}
			onchange={updateFormula}
			class="form-select"
		>
			{#each SCALING_FORMULAS as formula}
				<option value={formula.type}>{formula.name}</option>
			{/each}
		</select>
		<div class="form-hint">{selectedFormula.description}</div>
	</div>

	<!-- Universal System Parameters -->
	{#if selectedFormula.type === 'universal'}
		<div class="universal-parameters">
			<h3 class="subsection-title">Universal Progression Settings</h3>

			<div class="form-group">
				<label for="softCapLevel" class="form-label">Soft Cap Level:</label>
				<input
					id="softCapLevel"
					type="number"
					value={config.softCapLevel}
					oninput={(e) =>
						updateConfig({ softCapLevel: parseInt((e.target as HTMLInputElement).value) || 50 })}
					min="10"
					max="200"
					class="form-input"
				/>
				<div class="form-hint">
					Level where all characters naturally reach soft cap (default: 50)
				</div>
			</div>

			<div class="form-group">
				<label for="softCapAP" class="form-label">Soft Cap AP:</label>
				<input
					id="softCapAP"
					type="number"
					value={config.softCapAP}
					oninput={(e) =>
						updateConfig({ softCapAP: parseInt((e.target as HTMLInputElement).value) || 8 })}
					min="5"
					max="20"
					class="form-input"
				/>
				<div class="form-hint">AP value reached naturally at soft cap level (default: 8)</div>
			</div>

			<div class="dex-acceleration-config">
				<h4 class="config-subtitle">Dexterity Acceleration</h4>

				<div class="form-group">
					<label for="dexPerAP" class="form-label">Dex per Acceleration Level:</label>
					<input
						id="dexPerAP"
						type="number"
						value={config.dexPerAP}
						oninput={(e) =>
							updateConfig({ dexPerAP: parseInt((e.target as HTMLInputElement).value) || 10 })}
						min="5"
						max="25"
						class="form-input"
					/>
					<div class="form-hint">
						Dex needed to "advance" one level toward soft cap (default: 10)
					</div>
				</div>

				<div class="form-group">
					<label for="postSoftCapDexBase" class="form-label">Post-Soft-Cap Base Cost:</label>
					<input
						id="postSoftCapDexBase"
						type="number"
						value={config.postSoftCapDexBase}
						oninput={(e) =>
							updateConfig({
								postSoftCapDexBase: parseInt((e.target as HTMLInputElement).value) || 50
							})}
						min="20"
						max="200"
						class="form-input"
					/>
					<div class="form-hint">
						Initial dex cost for 9th AP (first post-soft-cap) (default: 50)
					</div>
				</div>

				<div class="form-group">
					<label for="postSoftCapDexMultiplier" class="form-label">Post-Soft-Cap Multiplier:</label>
					<input
						id="postSoftCapDexMultiplier"
						type="number"
						value={config.postSoftCapDexMultiplier}
						oninput={(e) =>
							updateConfig({
								postSoftCapDexMultiplier: parseFloat((e.target as HTMLInputElement).value) || 2.0
							})}
						min="1.5"
						max="5.0"
						step="0.1"
						class="form-input"
					/>
					<div class="form-hint">
						Cost multiplier for each additional post-soft-cap AP (default: 2.0)
					</div>
				</div>
			</div>

			<div class="preset-buttons">
				<h4 class="preset-title">Universal System Presets:</h4>
				<div class="button-group">
					<button onclick={setEarlyFocus} class="btn btn-preset-small">Early Focus</button>
					<button onclick={setBalanced} class="btn btn-preset-small">Balanced</button>
					<button onclick={setLateFocus} class="btn btn-preset-small">Late Focus</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Legacy Formula Parameters -->
		<div class="formula-parameters">
			{#if selectedFormula.type === 'linear'}
				<div class="form-group">
					<label for="linearMultiplier" class="form-label">Linear Multiplier:</label>
					<input
						id="linearMultiplier"
						type="number"
						value={config.linearMultiplier}
						oninput={(e) =>
							updateConfig({
								linearMultiplier: parseFloat((e.target as HTMLInputElement).value) || 0.5
							})}
						min="0.1"
						max="5"
						step="0.1"
						class="form-input"
					/>
					<div class="form-hint">AP per level (default: 0.5)</div>
				</div>
			{:else if selectedFormula.type === 'logarithmic'}
				<div class="form-group">
					<label for="logarithmicMultiplier" class="form-label">Logarithmic Multiplier:</label>
					<input
						id="logarithmicMultiplier"
						type="number"
						value={config.logarithmicMultiplier}
						oninput={(e) =>
							updateConfig({
								logarithmicMultiplier: parseFloat((e.target as HTMLInputElement).value) || 2
							})}
						min="0.5"
						max="10"
						step="0.5"
						class="form-input"
					/>
					<div class="form-hint">Strength of logarithmic scaling (default: 2)</div>
				</div>
			{:else if selectedFormula.type === 'softCap'}
				<div class="form-group">
					<label for="softCapMultiplier" class="form-label">Soft Cap Multiplier:</label>
					<input
						id="softCapMultiplier"
						type="number"
						value={config.softCapMultiplier}
						oninput={(e) =>
							updateConfig({
								softCapMultiplier: parseFloat((e.target as HTMLInputElement).value) || 1.5
							})}
						min="0.5"
						max="5"
						step="0.1"
						class="form-input"
					/>
					<div class="form-hint">Strength of square root scaling (default: 1.5)</div>
				</div>
			{:else if selectedFormula.type === 'milestone'}
				<div class="form-group">
					<label for="milestoneInterval" class="form-label">Milestone Interval:</label>
					<input
						id="milestoneInterval"
						type="number"
						value={config.milestoneInterval}
						oninput={(e) =>
							updateConfig({
								milestoneInterval: parseInt((e.target as HTMLInputElement).value) || 10
							})}
						min="1"
						max="100"
						step="1"
						class="form-input"
					/>
					<div class="form-hint">Levels between each +1 AP bonus (default: 10)</div>
				</div>
			{/if}

			<!-- Legacy Dex Configuration -->
			<div class="legacy-dex-config">
				<h3 class="subsection-title">Legacy Dexterity Scaling:</h3>

				<div class="form-group">
					<label for="legacyDexPerAP" class="form-label">Dex per AP:</label>
					<input
						id="legacyDexPerAP"
						type="number"
						value={config.dexPerAP}
						oninput={(e) =>
							updateConfig({ dexPerAP: parseInt((e.target as HTMLInputElement).value) || 10 })}
						min="1"
						max="50"
						step="1"
						class="form-input"
					/>
					<div class="form-hint">How much Dex needed for +1 AP (default: 10)</div>
				</div>

				<div class="form-group">
					<label for="dexDiminishingThreshold" class="form-label">Diminishing Threshold:</label>
					<input
						id="dexDiminishingThreshold"
						type="number"
						value={config.dexDiminishingThreshold}
						oninput={(e) =>
							updateConfig({
								dexDiminishingThreshold: parseInt((e.target as HTMLInputElement).value) || 50
							})}
						min="10"
						max="200"
						step="10"
						class="form-input"
					/>
					<div class="form-hint">Dex value where diminishing returns start (default: 50)</div>
				</div>

				<div class="form-group">
					<label for="dexDiminishingRatio" class="form-label">Diminishing Ratio:</label>
					<input
						id="dexDiminishingRatio"
						type="number"
						value={config.dexDiminishingRatio}
						oninput={(e) =>
							updateConfig({
								dexDiminishingRatio: parseFloat((e.target as HTMLInputElement).value) || 2
							})}
						min="1.5"
						max="5"
						step="0.5"
						class="form-input"
					/>
					<div class="form-hint">Multiplier for Dex cost after threshold (default: 2x)</div>
				</div>
			</div>

			<div class="preset-buttons">
				<h4 class="preset-title">Legacy Formula Presets:</h4>
				<div class="button-group">
					<button onclick={setConservativeScaling} class="btn btn-preset-small">Conservative</button
					>
					<button onclick={setBalancedScaling} class="btn btn-preset-small">Balanced</button>
					<button onclick={setAggressiveScaling} class="btn btn-preset-small">Aggressive</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="form-group">
		<label for="chartMaxLevel" class="form-label">Chart Max Level:</label>
		<input
			id="chartMaxLevel"
			type="number"
			value={chartMaxLevel}
			oninput={(e) => onChartMaxLevelChange(parseInt((e.target as HTMLInputElement).value) || 100)}
			min="10"
			max="2000"
			step="10"
			class="form-input"
		/>
	</div>
</div>

<style>
	.config-panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-left: 4px solid var(--color-primary);
		border-radius: 8px;
		padding: 1.5rem;
		transition: var(--transition-theme);
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-icon {
		font-size: 1.5rem;
	}

	.subsection-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
	}

	.config-subtitle {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
	}

	.preset-title {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.universal-parameters {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-info);
		margin: 1rem 0;
	}

	.dex-acceleration-config {
		background-color: var(--bg-primary);
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--color-warning);
		margin: 0.75rem 0;
	}

	.legacy-dex-config {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		margin: 1rem 0;
	}

	.formula-parameters {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		margin: 0.75rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.form-input,
	.form-select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		font-size: 0.875rem;
		box-sizing: border-box;
		transition: var(--transition-theme);
	}

	.form-input:focus,
	.form-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
	}

	.form-hint {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
		line-height: 1.4;
	}

	.preset-buttons {
		margin-top: 1rem;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: var(--transition-theme);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.btn-preset-small {
		background-color: var(--color-accent);
		color: var(--text-inverse);
		padding: 0.375rem 0.75rem;
		font-size: 0.6875rem;
	}

	.btn-preset-small:hover {
		background-color: var(--color-primary);
		transform: translateY(-1px);
	}
</style>
