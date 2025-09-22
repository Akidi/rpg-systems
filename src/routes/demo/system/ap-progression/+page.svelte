<!-- src/routes/ap-progression/+page.svelte -->
<script lang="ts">
	import {
		SCALING_FORMULAS,
		calculateTotalAP,
		generateProgressionData,
		type APConfig,
		type Character,
		type ScalingFormula,
		type APResult
	} from '$lib/types/apProgression.js';

	// Configuration state with updated defaults for universal system
	let config = $state<APConfig>({
		baseAP: 3,
		softCapLevel: 50,
		softCapAP: 8,
		maxLevel: 100,
		dexBonus: 0,
		scalingType: 'universal',
		// Formula parameters with defaults
		linearMultiplier: 0.5,
		logarithmicMultiplier: 2,
		softCapMultiplier: 1.5,
		milestoneInterval: 10,
		// Dexterity configuration with updated defaults
		dexPerAP: 10,
		dexDiminishingThreshold: 50,
		dexDiminishingRatio: 2,
		// Post-soft-cap dex requirements
		postSoftCapDexBase: 50,
		postSoftCapDexMultiplier: 2.0
	});

	// Character state
	let character = $state<Character>({
		level: 1,
		dexterity: 0,
		ascensions: 0
	});

	// Selected formula - default to universal
	let selectedFormula = $state<ScalingFormula>(SCALING_FORMULAS[0]); // Universal by default

	// Display settings
	let showChart = $state(true);
	let chartMaxLevel = $state(100);

	// Calculate current character's AP
	const currentAP = $derived.by(() => {
		return calculateTotalAP(character, config, selectedFormula);
	});

	// Generate progression data for visualization
	const progressionData = $derived.by(() => {
		return generateProgressionData(
			config,
			selectedFormula,
			chartMaxLevel,
			character.dexterity,
			character.ascensions
		);
	});

	// Update selected formula when scaling type changes
	function updateFormula(event: Event) {
		const target = event.target as HTMLSelectElement;
		if (target) {
			const formula = SCALING_FORMULAS.find(f => f.type === target.value);
			if (formula) {
				selectedFormula = formula;
				config.scalingType = formula.type;
			}
		}
	}

	// Quick preset functions for character
	function setEarlyGame() {
		character.level = 10;
		character.dexterity = 20;
		character.ascensions = 0;
	}

	function setMidGame() {
		character.level = 30;
		character.dexterity = 80;
		character.ascensions = 1;
	}

	function setLateGame() {
		character.level = 100;
		character.dexterity = 200;
		character.ascensions = 3;
	}

	function setEndGame() {
		character.level = 200;
		character.dexterity = 500;
		character.ascensions = 10;
	}

	// Quick preset functions for universal system tuning
	function setEarlyFocus() {
		config.dexPerAP = 8;
		config.postSoftCapDexBase = 30;
		config.postSoftCapDexMultiplier = 1.8;
	}

	function setBalanced() {
		config.dexPerAP = 10;
		config.postSoftCapDexBase = 50;
		config.postSoftCapDexMultiplier = 2.0;
	}

	function setLateFocus() {
		config.dexPerAP = 12;
		config.postSoftCapDexBase = 75;
		config.postSoftCapDexMultiplier = 2.5;
	}

	// Legacy preset functions for other formulas
	function setConservativeScaling() {
		config.linearMultiplier = 0.3;
		config.logarithmicMultiplier = 1.5;
		config.softCapMultiplier = 1.0;
		config.milestoneInterval = 15;
		config.dexPerAP = 15;
		config.dexDiminishingThreshold = 30;
		config.dexDiminishingRatio = 3;
	}

	function setAggressiveScaling() {
		config.linearMultiplier = 1.0;
		config.logarithmicMultiplier = 3.0;
		config.softCapMultiplier = 2.5;
		config.milestoneInterval = 5;
		config.dexPerAP = 5;
		config.dexDiminishingThreshold = 75;
		config.dexDiminishingRatio = 1.5;
	}

	function setBalancedScaling() {
		config.linearMultiplier = 0.5;
		config.logarithmicMultiplier = 2.0;
		config.softCapMultiplier = 1.5;
		config.milestoneInterval = 10;
		config.dexPerAP = 10;
		config.dexDiminishingThreshold = 50;
		config.dexDiminishingRatio = 2;
	}

	// Format numbers for display
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	// Get next post-soft-cap cost for display
	function getNextPostSoftCapCost(): number {
		const dexForSoftCap = Math.max(0, (config.softCapLevel - character.level) * config.dexPerAP);
		const excessDex = Math.max(0, character.dexterity - dexForSoftCap);
		
		let currentCost = config.postSoftCapDexBase;
		let usedDex = 0;
		
		while (usedDex + currentCost <= excessDex) {
			usedDex += currentCost;
			currentCost = Math.floor(currentCost * config.postSoftCapDexMultiplier);
		}
		
		return dexForSoftCap + usedDex + currentCost;
	}
</script>

<svelte:head>
	<title>AP Progression Simulator</title>
	<meta name="description" content="Test AP scaling formulas including universal progression for the Diablo-like web game" />
</svelte:head>

<div class="container">
	<h1>AP Progression Simulator</h1>
	<p class="subtitle">Test different AP scaling formulas including the new universal progression system</p>
	
	<div class="grid">
		<!-- Configuration Panel -->
		<div class="card">
			<h2>Base Configuration</h2>
			
			<div class="form-group">
				<label for="baseAP" class="form-label">Base AP (Level 1):</label>
				<input 
					id="baseAP"
					type="number" 
					bind:value={config.baseAP}
					min="1"
					max="10"
					class="form-input"
				/>
			</div>

			<div class="form-group">
				<label for="scalingFormula" class="form-label">Scaling Formula:</label>
				<select 
					id="scalingFormula"
					bind:value={config.scalingType}
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
					<h3>Universal Progression Settings</h3>
					
					<div class="form-group">
						<label for="softCapLevel" class="form-label">Soft Cap Level:</label>
						<input 
							id="softCapLevel"
							type="number" 
							bind:value={config.softCapLevel}
							min="10"
							max="200"
							class="form-input"
						/>
						<div class="form-hint">Level where all characters naturally reach soft cap (default: 50)</div>
					</div>

					<div class="form-group">
						<label for="softCapAP" class="form-label">Soft Cap AP:</label>
						<input 
							id="softCapAP"
							type="number" 
							bind:value={config.softCapAP}
							min="5"
							max="20"
							class="form-input"
						/>
						<div class="form-hint">AP value reached naturally at soft cap level (default: 8)</div>
					</div>

					<div class="dex-acceleration-config">
						<h4>Dexterity Acceleration</h4>
						
						<div class="form-group">
							<label for="dexPerAP" class="form-label">Dex per Acceleration Level:</label>
							<input 
								id="dexPerAP"
								type="number" 
								bind:value={config.dexPerAP}
								min="5"
								max="25"
								class="form-input"
							/>
							<div class="form-hint">Dex needed to "advance" one level toward soft cap (default: 10)</div>
						</div>

						<div class="form-group">
							<label for="postSoftCapDexBase" class="form-label">Post-Soft-Cap Base Cost:</label>
							<input 
								id="postSoftCapDexBase"
								type="number" 
								bind:value={config.postSoftCapDexBase}
								min="20"
								max="200"
								class="form-input"
							/>
							<div class="form-hint">Initial dex cost for 9th AP (first post-soft-cap) (default: 50)</div>
						</div>

						<div class="form-group">
							<label for="postSoftCapDexMultiplier" class="form-label">Post-Soft-Cap Multiplier:</label>
							<input 
								id="postSoftCapDexMultiplier"
								type="number" 
								bind:value={config.postSoftCapDexMultiplier}
								min="1.5"
								max="5.0"
								step="0.1"
								class="form-input"
							/>
							<div class="form-hint">Cost multiplier for each additional post-soft-cap AP (default: 2.0)</div>
						</div>
					</div>

					<div class="preset-buttons">
						<h4>Universal System Presets:</h4>
						<button onclick={setEarlyFocus} class="btn btn-preset-small">Early Focus</button>
						<button onclick={setBalanced} class="btn btn-preset-small">Balanced</button>
						<button onclick={setLateFocus} class="btn btn-preset-small">Late Focus</button>
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
								bind:value={config.linearMultiplier}
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
								bind:value={config.logarithmicMultiplier}
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
								bind:value={config.softCapMultiplier}
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
								bind:value={config.milestoneInterval}
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
						<h3>Legacy Dexterity Scaling:</h3>
						
						<div class="form-group">
							<label for="legacyDexPerAP" class="form-label">Dex per AP:</label>
							<input 
								id="legacyDexPerAP"
								type="number" 
								bind:value={config.dexPerAP}
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
								bind:value={config.dexDiminishingThreshold}
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
								bind:value={config.dexDiminishingRatio}
								min="1.5"
								max="5"
								step="0.5"
								class="form-input"
							/>
							<div class="form-hint">Multiplier for Dex cost after threshold (default: 2x)</div>
						</div>
					</div>

					<div class="preset-buttons">
						<h4>Legacy Formula Presets:</h4>
						<button onclick={setConservativeScaling} class="btn btn-preset-small">Conservative</button>
						<button onclick={setBalancedScaling} class="btn btn-preset-small">Balanced</button>
						<button onclick={setAggressiveScaling} class="btn btn-preset-small">Aggressive</button>
					</div>
				</div>
			{/if}

			<div class="form-group">
				<label for="chartMaxLevel" class="form-label">Chart Max Level:</label>
				<input 
					id="chartMaxLevel"
					type="number" 
					bind:value={chartMaxLevel}
					min="10"
					max="2000"
					step="10"
					class="form-input"
				/>
			</div>
		</div>

		<!-- Character Settings -->
		<div class="card">
			<h2>Character Stats</h2>
			
			<div class="form-group">
				<label for="characterLevel" class="form-label">Level:</label>
				<input 
					id="characterLevel"
					type="number" 
					bind:value={character.level}
					min="1"
					max="10000"
					class="form-input"
				/><br />
				(max sp {(character.level - 1) * 5})
			</div>

			<div class="form-group">
				<label for="characterDexterity" class="form-label">Dexterity:</label>
				<input 
					id="characterDexterity"
					type="number" 
					bind:value={character.dexterity}
					min="0"
					max="1000"
					class="form-input"
				/>
				{#if selectedFormula.type === 'universal'}
					<div class="form-hint">Investment to reach soft cap earlier or push beyond</div>
				{:else}
					<div class="form-hint">Every 10 Dex = +1 AP (diminishing returns after 50)</div>
				{/if}
			</div>

			<div class="form-group">
				<label for="characterAscensions" class="form-label">Ascensions:</label>
				<input 
					id="characterAscensions"
					type="number" 
					bind:value={character.ascensions}
					min="0"
					max="100"
					class="form-input"
				/>
				<div class="form-hint">Permanent AP bonuses from previous runs</div>
			</div>

			<div class="preset-buttons">
				<h3>Character Presets:</h3>
				<button onclick={setEarlyGame} class="btn btn-preset">Early Game</button>
				<button onclick={setMidGame} class="btn btn-preset">Mid Game</button>
				<button onclick={setLateGame} class="btn btn-preset">Late Game</button>
				<button onclick={setEndGame} class="btn btn-preset">End Game</button>
			</div>
		</div>

		<!-- Current Result -->
		<div class="card">
			<h2>Current Character AP</h2>
			
			<div class="ap-display">
				<div class="ap-total">{currentAP.totalAP} AP</div>
				<div class="ap-formula">{currentAP.formula}</div>
			</div>

			{#if selectedFormula.type === 'universal'}
				<!-- Universal System Status -->
				<div class="soft-cap-indicator {currentAP.reachedSoftCap ? 'reached' : 'not-reached'}">
					{#if currentAP.reachedSoftCap}
						✓ Soft cap reached! (Acting like level {currentAP.effectiveLevel})
					{:else}
						{config.softCapLevel - currentAP.effectiveLevel} effective levels to soft cap
					{/if}
				</div>

				<div class="ap-breakdown">
					<div class="breakdown-item">
						<span class="breakdown-label">Base AP:</span>
						<span class="breakdown-value">{currentAP.baseAP}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Natural Level Bonus:</span>
						<span class="breakdown-value">+{currentAP.naturalLevelBonus}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Dex Acceleration:</span>
						<span class="breakdown-value">+{currentAP.dexAcceleration}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Post-Soft-Cap Bonus:</span>
						<span class="breakdown-value">+{currentAP.postSoftCapBonus}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Ascension Bonus:</span>
						<span class="breakdown-value">+{currentAP.ascensionBonus}</span>
					</div>
				</div>

				<!-- Dex Efficiency Information -->
				<div class="dex-efficiency-info">
					{#if character.level >= config.softCapLevel}
						<strong>Post-Soft-Cap Progression:</strong><br>
						Next AP costs {getNextPostSoftCapCost()} dex total<br>
						Each AP gets exponentially more expensive
					{:else}
						<strong>Acceleration Status:</strong><br>
						Acting like level {currentAP.effectiveLevel} ({currentAP.levelsAheadOfNatural} levels ahead)<br>
						Need {Math.max(0, (config.softCapLevel - character.level) * config.dexPerAP - character.dexterity)} more dex to reach soft cap early
					{/if}
				</div>
			{:else}
				<!-- Legacy System Breakdown -->
				<div class="ap-breakdown">
					<div class="breakdown-item">
						<span class="breakdown-label">Base AP:</span>
						<span class="breakdown-value">{currentAP.baseAP}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Level Bonus:</span>
						<span class="breakdown-value">+{currentAP.naturalLevelBonus}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Dex Bonus:</span>
						<span class="breakdown-value">+{currentAP.dexAcceleration}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Ascension Bonus:</span>
						<span class="breakdown-value">+{currentAP.ascensionBonus}</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Progression Visualization -->
		<div class="card full-width">
			<h2>AP Progression Chart</h2>
			
			<div class="chart-container">
				<div class="chart-header">
					<h3>{selectedFormula.name} Scaling (Levels 1-{formatNumber(chartMaxLevel)})</h3>
					<p>Dex: {character.dexterity} | Ascensions: {character.ascensions}</p>
					{#if selectedFormula.type === 'universal'}
						<p class="universal-note">
							<strong>Universal System:</strong> All characters reach {config.softCapAP} AP naturally at level {config.softCapLevel}
						</p>
					{/if}
				</div>

				<div class="simple-chart">
					<div class="chart-y-axis">
						{#each [0, 25, 50, 75, 100] as percentage}
							{@const maxAP = Math.max(...progressionData.map(d => d.ap))}
							{@const value = Math.round((maxAP * percentage) / 100)}
							<div class="y-label" style="bottom: {percentage}%">{value}</div>
						{/each}
					</div>

					<div class="chart-area">
						{#each progressionData as point, index}
							{@const maxAP = Math.max(...progressionData.map(d => d.ap))}
							{@const height = (point.ap / maxAP) * 100}
							{@const left = (index / (progressionData.length - 1)) * 100}
							
							<div 
								class="chart-point"
								style="left: {left}%; bottom: {height}%"
								title="Level {point.level}: {point.ap} AP"
							></div>
						{/each}

						<!-- Chart line -->
						<svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
							<polyline
								fill="none"
								stroke="#3b82f6"
								stroke-width="0.5"
								points={progressionData.map((point, index) => {
									const maxAP = Math.max(...progressionData.map(d => d.ap));
									const x = (index / (progressionData.length - 1)) * 100;
									const y = 100 - (point.ap / maxAP) * 100;
									return `${x},${y}`;
								}).join(' ')}
							/>
						</svg>

						<!-- Soft cap indicator line for universal system -->
						{#if selectedFormula.type === 'universal' && chartMaxLevel >= config.softCapLevel}
							{@const softCapX = ((config.softCapLevel - 1) / (chartMaxLevel - 1)) * 100}
							<div 
								class="soft-cap-line"
								style="left: {softCapX}%"
								title="Soft cap reached at level {config.softCapLevel}"
							></div>
						{/if}
					</div>

					<div class="chart-x-axis">
						{#each [0, 25, 50, 75, 100] as percentage}
							{@const level = Math.round((chartMaxLevel * percentage) / 100)}
							<div class="x-label" style="left: {percentage}%">{formatNumber(level)}</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Data Table -->
			<div class="data-table-container">
				<h3>Sample Data Points</h3>
				<div class="data-table">
					<div class="table-header">
						<div>Level</div>
						<div>Total AP</div>
						{#if selectedFormula.type === 'universal'}
							<div>Natural + Accel</div>
							<div>Post-Cap</div>
						{:else}
							<div>Level Bonus</div>
							<div>Growth Rate</div>
						{/if}
					</div>
					{#each progressionData.filter((_, i) => i % Math.max(1, Math.floor(progressionData.length / 20)) === 0) as point, index}
						{@const prevPoint = index > 0 ? progressionData.filter((_, i) => i % Math.max(1, Math.floor(progressionData.length / 20)) === 0)[index - 1] : null}
						{@const growthRate = prevPoint ? ((point.ap - prevPoint.ap) / prevPoint.ap * 100) : 0}
						<div class="table-row">
							<div>{formatNumber(point.level)}</div>
							<div>{point.ap}</div>
							{#if selectedFormula.type === 'universal'}
								<div>+{point.breakdown.naturalLevelBonus + point.breakdown.dexAcceleration}</div>
								<div>+{point.breakdown.postSoftCapBonus}</div>
							{:else}
								<div>+{point.breakdown.naturalLevelBonus}</div>
								<div>{growthRate > 0 ? `+${growthRate.toFixed(1)}%` : '-'}</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Universal System Examples -->
			{#if selectedFormula.type === 'universal'}
				<div class="universal-examples">
					<h3>Universal System Examples</h3>
					<div class="examples-grid">
						{#each [
							{ level: 10, dex: 0, name: "No Dex Investment" },
							{ level: 10, dex: 50, name: "Heavy Dex Investment" },
							{ level: 25, dex: 0, name: "Mid-Game Natural" },
							{ level: 25, dex: 100, name: "Mid-Game with Dex" },
							{ level: 50, dex: 0, name: "Soft Cap Natural" },
							{ level: 50, dex: 150, name: "Soft Cap + Post-Cap Push" },
							{ level: 100, dex: 500, name: "Endgame Whale" }
						] as scenario}
							{@const testChar = { level: scenario.level, dexterity: scenario.dex, ascensions: 0 }}
							{@const result = calculateTotalAP(testChar, config, selectedFormula)}
							<div class="example-card">
								<h4>{scenario.name}</h4>
								<div class="example-stats">Level {scenario.level}, {scenario.dex} Dex</div>
								<div class="example-ap">{result.totalAP} AP</div>
								<div class="example-status">
									{#if result.reachedSoftCap}
										✓ Soft cap reached
									{:else}
										{config.softCapLevel - result.effectiveLevel} levels to cap
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
		font-family: system-ui, sans-serif;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	h1 {
		font-size: 28px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 8px;
		color: #333;
	}

	.subtitle {
		text-align: center;
		color: #6b7280;
		margin-bottom: 32px;
		font-style: italic;
	}

	h2 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 16px;
		color: #374151;
	}

	h3 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
		color: #374151;
	}

	h4 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 8px;
		color: #374151;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.card {
		background: white;
		border-radius: 8px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.universal-parameters {
		background-color: #f0f9ff;
		padding: 16px;
		border-radius: 6px;
		border: 1px solid #bae6fd;
		margin: 16px 0;
	}

	.dex-acceleration-config {
		background-color: #fef3c7;
		padding: 12px;
		border-radius: 4px;
		border: 1px solid #fde68a;
		margin: 12px 0;
	}

	.legacy-dex-config {
		background-color: #f3f4f6;
		padding: 16px;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		margin: 16px 0;
	}

	.formula-parameters {
		background-color: #f9fafb;
		padding: 16px;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		margin: 12px 0;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 6px;
		color: #374151;
	}

	.form-input, .form-select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.form-input:focus, .form-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-hint {
		font-size: 12px;
		color: #6b7280;
		margin-top: 4px;
	}

	.preset-buttons {
		margin-top: 16px;
	}

	.preset-buttons h3, .preset-buttons h4 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
		color: #374151;
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
		margin: 2px;
	}

	.btn-preset {
		background-color: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-preset:hover {
		background-color: #e5e7eb;
	}

	.btn-preset-small {
		background-color: #ddd6fe;
		color: #5b21b6;
		border: 1px solid #c4b5fd;
		padding: 6px 12px;
		font-size: 12px;
	}

	.btn-preset-small:hover {
		background-color: #c4b5fd;
	}

	.ap-display {
		text-align: center;
		margin-bottom: 24px;
	}

	.ap-total {
		font-size: 36px;
		font-weight: bold;
		color: #3b82f6;
		margin-bottom: 8px;
	}

	.ap-formula {
		font-size: 14px;
		color: #6b7280;
		font-family: 'Monaco', 'Consolas', monospace;
	}

	.soft-cap-indicator {
		padding: 8px 12px;
		border-radius: 6px;
		margin: 16px 0;
		font-weight: 600;
		text-align: center;
	}

	.soft-cap-indicator.reached {
		background-color: #dcfce7;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	.soft-cap-indicator.not-reached {
		background-color: #fef3c7;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	.ap-breakdown {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.breakdown-item {
		display: flex;
		justify-content: space-between;
		padding: 8px 12px;
		background-color: #f9fafb;
		border-radius: 4px;
	}

	.breakdown-label {
		font-weight: 500;
		color: #374151;
	}

	.breakdown-value {
		font-weight: 600;
		color: #059669;
	}

	.dex-efficiency-info {
		background-color: #f0f9ff;
		padding: 12px;
		border-radius: 6px;
		border: 1px solid #bae6fd;
		font-size: 14px;
		color: #0c4a6e;
	}

	.chart-container {
		margin-bottom: 32px;
	}

	.chart-header {
		text-align: center;
		margin-bottom: 24px;
	}

	.chart-header p {
		color: #6b7280;
		margin: 4px 0 0 0;
	}

	.universal-note {
		background-color: #f0f9ff;
		padding: 8px 12px;
		border-radius: 4px;
		border: 1px solid #bae6fd;
		color: #0c4a6e;
		font-size: 14px;
		margin-top: 8px;
	}

	.simple-chart {
		position: relative;
		height: 300px;
		margin: 0 40px 40px 60px;
		border-left: 2px solid #d1d5db;
		border-bottom: 2px solid #d1d5db;
	}

	.chart-y-axis {
		position: absolute;
		left: -50px;
		top: 0;
		bottom: 0;
		width: 40px;
	}

	.y-label {
		position: absolute;
		right: 8px;
		font-size: 12px;
		color: #6b7280;
		transform: translateY(50%);
	}

	.chart-x-axis {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -30px;
		height: 20px;
	}

	.x-label {
		position: absolute;
		font-size: 12px;
		color: #6b7280;
		transform: translateX(-50%);
	}

	.chart-area {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.chart-line {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.chart-point {
		position: absolute;
		width: 4px;
		height: 4px;
		background-color: #3b82f6;
		border-radius: 50%;
		transform: translate(-50%, 50%);
		cursor: pointer;
	}

	.chart-point:hover {
		background-color: #1d4ed8;
		transform: translate(-50%, 50%) scale(1.5);
	}

	.soft-cap-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: #f59e0b;
		opacity: 0.7;
		pointer-events: none;
	}

	.soft-cap-line::before {
		content: 'Soft Cap';
		position: absolute;
		top: -20px;
		left: 4px;
		font-size: 10px;
		color: #f59e0b;
		font-weight: 600;
		white-space: nowrap;
	}

	.data-table-container {
		margin-top: 32px;
	}

	.data-table {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 1px;
		background-color: #d1d5db;
		border-radius: 6px;
		overflow: hidden;
	}

	.table-header {
		display: contents;
	}

	.table-header > div {
		background-color: #f3f4f6;
		padding: 12px;
		font-weight: 600;
		font-size: 14px;
		color: #374151;
	}

	.table-row {
		display: contents;
	}

	.table-row > div {
		background-color: white;
		padding: 8px 12px;
		font-size: 14px;
		color: #374151;
	}

	.table-row:nth-child(even) > div {
		background-color: #f9fafb;
	}

	.universal-examples {
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #e5e7eb;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.example-card {
		padding: 16px;
		background-color: #f9fafb;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		text-align: center;
	}

	.example-card h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
	}

	.example-stats {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 8px;
	}

	.example-ap {
		font-size: 18px;
		font-weight: bold;
		color: #3b82f6;
		margin-bottom: 8px;
	}

	.example-status {
		font-size: 11px;
		color: #6b7280;
	}
</style>