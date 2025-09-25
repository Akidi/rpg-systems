<!-- src/lib/components/FormulaSystem/FormulaCalculator.svelte -->
<script lang="ts">
	import type { CharacterStats, DerivedStats, FormulaSet, CharacterBuild } from '$lib/types/formulaPlanner.js';
	import BuildSelector from './BuildSelector.svelte';
	import StatInput from './StatInput.svelte';
	import FormulaRow from './FormulaRow.svelte';
	import ResultCard from './ResultCard.svelte';
	import SaveLoadPanel from './SaveLoadPanel.svelte';
	import CustomDistributionModal from './CustomDistributionModal.svelte';

	interface Props {
		currentFormulas: FormulaSet;
		selectedBuild: CharacterBuild;
		derivedStats: DerivedStats | null;
		onFormulaUpdate: (statName: keyof DerivedStats, formula: string) => void;
		onBuildLoad: (buildIndex: number) => void;
		onStatUpdate: (statName: keyof CharacterStats, value: number) => void;
	}

	let { currentFormulas, selectedBuild, derivedStats, onFormulaUpdate, onBuildLoad, onStatUpdate }: Props = $props();

	// Custom distribution modal state
	let showCustomModal = $state(false);

	// Stat allocation system
	function getTotalStatPoints(level: number): number {
		return 15 + (level - 1) * 5; // 15 at level 1, +5 per level
	}

	function getUsedStatPoints(stats: CharacterStats): number {
		return (stats.strength - 5) + (stats.dexterity - 5) + (stats.intelligence - 5) + 
		       (stats.constitution - 5) + (stats.wisdom - 5) + (stats.charisma - 5);
	}

	function getAvailablePoints(stats: CharacterStats): number {
		return getTotalStatPoints(stats.level) - getUsedStatPoints(stats);
	}

	// Expanded class stat distributions (percentages)
	const classDistributions = {
		balanced: { STR: 16.67, DEX: 16.67, INT: 16.67, CON: 16.67, WIS: 16.67, CHA: 16.67 },
		warrior: { STR: 35, DEX: 15, INT: 5, CON: 30, WIS: 10, CHA: 5 },
		mage: { STR: 5, DEX: 10, INT: 40, CON: 15, WIS: 25, CHA: 5 },
		rogue: { STR: 15, DEX: 40, INT: 10, CON: 15, WIS: 15, CHA: 5 },
		ranger: { STR: 20, DEX: 35, INT: 10, CON: 15, WIS: 15, CHA: 5 },
		paladin: { STR: 30, DEX: 10, INT: 5, CON: 25, WIS: 20, CHA: 10 },
		assassin: { STR: 15, DEX: 35, INT: 25, CON: 15, WIS: 5, CHA: 5 },
		necromancer: { STR: 5, DEX: 10, INT: 40, CON: 30, WIS: 10, CHA: 5 }
	} as const;

	type ClassType = keyof typeof classDistributions;

	function distributeStatsByClass(level: number, classType: ClassType): CharacterStats {
		const totalPoints = getTotalStatPoints(level);
		const distribution = classDistributions[classType];
		
		const statNames: (keyof typeof distribution)[] = ['STR', 'DEX', 'INT', 'CON', 'WIS', 'CHA'];
		const exactAllocations = statNames.map(stat => ({
			stat,
			exact: (totalPoints * distribution[stat]) / 100,
			whole: Math.floor((totalPoints * distribution[stat]) / 100),
			decimal: ((totalPoints * distribution[stat]) / 100) % 1
		}));

		let allocatedPoints = exactAllocations.reduce((sum, alloc) => sum + alloc.whole, 0);
		const remainingPoints = totalPoints - allocatedPoints;

		exactAllocations.sort((a, b) => b.decimal - a.decimal);

		for (let i = 0; i < remainingPoints; i++) {
			exactAllocations[i].whole += 1;
		}

		const finalStats: Record<string, number> = {};
		exactAllocations.forEach(alloc => {
			const statKey = alloc.stat.toLowerCase();
			finalStats[statKey] = 5 + alloc.whole;
		});

		return {
			level,
			strength: finalStats.str,
			dexterity: finalStats.dex,
			intelligence: finalStats.int,
			constitution: finalStats.con,
			wisdom: finalStats.wis,
			charisma: finalStats.cha
		};
	}

	function distributeStatsByCustom(level: number, distribution: Record<string, number>): CharacterStats {
		const totalPoints = getTotalStatPoints(level);
		
		const statNames: string[] = ['STR', 'DEX', 'INT', 'CON', 'WIS', 'CHA'];
		const exactAllocations = statNames.map(stat => ({
			stat,
			exact: (totalPoints * distribution[stat]) / 100,
			whole: Math.floor((totalPoints * distribution[stat]) / 100),
			decimal: ((totalPoints * distribution[stat]) / 100) % 1
		}));

		let allocatedPoints = exactAllocations.reduce((sum, alloc) => sum + alloc.whole, 0);
		const remainingPoints = totalPoints - allocatedPoints;

		exactAllocations.sort((a, b) => b.decimal - a.decimal);

		for (let i = 0; i < remainingPoints; i++) {
			exactAllocations[i].whole += 1;
		}

		const finalStats: Record<string, number> = {};
		exactAllocations.forEach(alloc => {
			const statKey = alloc.stat.toLowerCase();
			finalStats[statKey] = 5 + alloc.whole;
		});

		return {
			level,
			strength: finalStats.str,
			dexterity: finalStats.dex,
			intelligence: finalStats.int,
			constitution: finalStats.con,
			wisdom: finalStats.wis,
			charisma: finalStats.cha
		};
	}

	function handleClassBuild(classType: 'balanced' | 'warrior' | 'mage' | 'rogue' | 'ranger' | 'paladin' | 'assassin' | 'necromancer' | 'custom') {
		if (classType === 'custom') {
			showCustomModal = true;
			return;
		}

		const currentLevel = selectedBuild.stats.level;
		const newStats = distributeStatsByClass(currentLevel, classType);
		Object.entries(newStats).forEach(([key, value]) => {
			onStatUpdate(key as keyof CharacterStats, value);
		});
	}

	function handleCustomDistribution(distribution: Record<string, number>) {
		const currentLevel = selectedBuild.stats.level;
		const newStats = distributeStatsByCustom(currentLevel, distribution);
		Object.entries(newStats).forEach(([key, value]) => {
			onStatUpdate(key as keyof CharacterStats, value);
		});
	}

	function handleStatChange(statName: keyof CharacterStats, newValue: number) {
		if (statName === 'level') {
			const currentClass = selectedBuild.statDistribution;
			if (currentClass !== 'custom' && currentClass in classDistributions) {
				const newStats = distributeStatsByClass(newValue, currentClass);
				Object.entries(newStats).forEach(([key, value]) => {
					onStatUpdate(key as keyof CharacterStats, value);
				});
			} else {
				onStatUpdate(statName, newValue);
			}
		} else {
			const currentValue = selectedBuild.stats[statName];
			const pointDifference = newValue - currentValue;
			const availablePoints = getAvailablePoints(selectedBuild.stats);
			
			if (newValue >= 5 && (pointDifference <= availablePoints || pointDifference < 0)) {
				onStatUpdate(statName, newValue);
			}
		}
	}

	function resetAllStats() {
		handleClassBuild('balanced');
	}

	function maxAllStats() {
		const totalPoints = getTotalStatPoints(selectedBuild.stats.level);
		const baseStats = 5 * 6;
		const availablePoints = totalPoints - baseStats;
		const maxPerStat = Math.floor(availablePoints / 6);
		const remainder = availablePoints % 6;

		const stats: (keyof CharacterStats)[] = ['strength', 'dexterity', 'intelligence', 'constitution', 'wisdom', 'charisma'];
		stats.forEach((stat, index) => {
			const extraPoint = index < remainder ? 1 : 0;
			onStatUpdate(stat, 5 + maxPerStat + extraPoint);
		});
	}

	function copyFormula(formula: string) {
		navigator.clipboard.writeText(formula).then(() => {
			// Could add toast notification here
		}).catch(() => {
			try {
				const textArea = document.createElement('textarea');
				textArea.value = formula;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
			} catch (err) {
				console.warn('Failed to copy formula');
			}
		});
	}
</script>

<!-- Custom Distribution Modal -->
<CustomDistributionModal
	isOpen={showCustomModal}
	currentLevel={selectedBuild.stats.level}
	onClose={() => showCustomModal = false}
	onApply={handleCustomDistribution}
/>

<div class="formula-planner">
	<!-- Top Bar: Quick Reference & Stats -->
	<div class="top-bar">
		<div class="reference-info">
			<div class="info-section">
				<span class="info-label">Variables:</span>
				<code class="info-code">level, STR, DEX, INT, CON, WIS, CHA</code>
			</div>
			<div class="info-section">
				<span class="info-label">Functions:</span>
				<code class="info-code">pow(), sqrt(), log(), min(), max(), floor(), ceil(), round()</code>
			</div>
		</div>
		
		<div class="points-tracker">
			<div class="points-display">
				<span class="points-used">{getUsedStatPoints(selectedBuild.stats)}</span>
				<span class="points-separator">/</span>
				<span class="points-total">{getTotalStatPoints(selectedBuild.stats.level)}</span>
			</div>
			<div class="points-label {getAvailablePoints(selectedBuild.stats) < 0 ? 'over-allocated' : ''}">
				{getAvailablePoints(selectedBuild.stats)} remaining
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="main-content">
		<!-- Left Column: Character Setup -->
		<div class="setup-panel">
			<div class="panel-section">
				<h2 class="section-title">Character Setup</h2>
				
				<BuildSelector
					selectedDistribution={selectedBuild.statDistribution}
					currentLevel={selectedBuild.stats.level}
					onClassBuild={handleClassBuild}
					onCustomDistribution={() => showCustomModal = true}
				/>

				<div class="stat-controls">
					<div class="control-header">
						<h3>Base Stats</h3>
						<div class="quick-actions">
							<button class="quick-btn secondary" onclick={resetAllStats}>Reset</button>
							<button class="quick-btn secondary" onclick={maxAllStats}>Max All</button>
						</div>
					</div>
					
					<div class="stats-grid">
						<StatInput statName="level" value={selectedBuild.stats.level} min={1} max={1000} label="Level" onStatUpdate={handleStatChange} />
						<StatInput statName="strength" value={selectedBuild.stats.strength} min={5} max={999} label="STR" onStatUpdate={handleStatChange} />
						<StatInput statName="dexterity" value={selectedBuild.stats.dexterity} min={5} max={999} label="DEX" onStatUpdate={handleStatChange} />
						<StatInput statName="intelligence" value={selectedBuild.stats.intelligence} min={5} max={999} label="INT" onStatUpdate={handleStatChange} />
						<StatInput statName="constitution" value={selectedBuild.stats.constitution} min={5} max={999} label="CON" onStatUpdate={handleStatChange} />
						<StatInput statName="wisdom" value={selectedBuild.stats.wisdom} min={5} max={999} label="WIS" onStatUpdate={handleStatChange} />
						<StatInput statName="charisma" value={selectedBuild.stats.charisma} min={5} max={999} label="CHA" onStatUpdate={handleStatChange} />
					</div>
				</div>

				<SaveLoadPanel {selectedBuild} {currentFormulas} {onStatUpdate} {onFormulaUpdate} />
			</div>
		</div>

		<!-- Right Column: Formulas & Results -->
		<div class="formula-panel">
			<div class="panel-section">
				<h2 class="section-title">Formula Editor</h2>
				
				<div class="formula-sections">
					<div class="formula-group">
						<h3 class="group-title">Core Stats</h3>
						<div class="formula-list">
							<FormulaRow
								label="Health"
								statName="health"
								formula={currentFormulas.formulas.health}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Mana"
								statName="mana"
								formula={currentFormulas.formulas.mana}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Initiative"
								statName="initiative"
								formula={currentFormulas.formulas.initiative}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
						</div>
					</div>

					<div class="formula-group">
						<h3 class="group-title">Damage Output</h3>
						<div class="formula-list">
							<FormulaRow
								label="Physical"
								statName="physicalDamage"
								formula={currentFormulas.formulas.physicalDamage}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Magical"
								statName="magicalDamage"
								formula={currentFormulas.formulas.magicalDamage}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Ranged"
								statName="rangedDamage"
								formula={currentFormulas.formulas.rangedDamage}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
						</div>
					</div>

					<div class="formula-group">
						<h3 class="group-title">Defense & Combat</h3>
						<div class="formula-list">
							<FormulaRow
								label="Phys Defense"
								statName="physicalDefense"
								formula={currentFormulas.formulas.physicalDefense}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Mag Defense"
								statName="magicalDefense"
								formula={currentFormulas.formulas.magicalDefense}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Accuracy"
								statName="accuracy"
								formula={currentFormulas.formulas.accuracy}
								isPercentage={true}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
							<FormulaRow
								label="Evasion"
								statName="evasion"
								formula={currentFormulas.formulas.evasion}
								isPercentage={true}
								stats={selectedBuild.stats}
								{onFormulaUpdate}
								onCopy={copyFormula}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Results Bar -->
	<div class="results-bar">
		{#if derivedStats}
			<div class="results-container">
				<div class="result-group">
					<h4 class="result-group-title">Vitals</h4>
					<div class="result-cards">
						<ResultCard name="Health" value={derivedStats.health} />
						<ResultCard name="Mana" value={derivedStats.mana} />
						<ResultCard name="Initiative" value={derivedStats.initiative} />
					</div>
				</div>

				<div class="result-group">
					<h4 class="result-group-title">Damage</h4>
					<div class="result-cards">
						<ResultCard name="Physical" value={derivedStats.physicalDamage} />
						<ResultCard name="Magical" value={derivedStats.magicalDamage} />
						<ResultCard name="Ranged" value={derivedStats.rangedDamage} />
					</div>
				</div>

				<div class="result-group">
					<h4 class="result-group-title">Defense</h4>
					<div class="result-cards">
						<ResultCard name="Phys Def" value={derivedStats.physicalDefense} />
						<ResultCard name="Mag Def" value={derivedStats.magicalDefense} />
					</div>
				</div>

				<div class="result-group">
					<h4 class="result-group-title">Combat</h4>
					<div class="result-cards">
						<ResultCard name="Accuracy" value={derivedStats.accuracy.toFixed(1) + '%'} />
						<ResultCard name="Evasion" value={derivedStats.evasion.toFixed(1) + '%'} />
					</div>
				</div>
			</div>
		{:else}
			<div class="no-results">
				<span class="error-icon">⚠️</span>
				<span class="error-text">Formula errors detected - check your formulas above</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.formula-planner {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 200px);
		max-width: 1800px;
		margin: 0 auto;
		padding: 2rem;
		gap: 1.5rem;
	}

	/* Top Reference Bar */
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 1.5rem 2rem;
		box-shadow: 0 4px 20px var(--shadow-light);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.reference-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
		min-width: 400px;
	}

	.info-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.info-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 80px;
	}

	.info-code {
		background-color: var(--bg-primary);
		border: 1px solid var(--border-primary);
		padding: 0.375rem 0.75rem;
		border-radius: 8px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 0.8125rem;
		color: var(--color-primary);
		line-height: 1.2;
	}

	.points-tracker {
		text-align: right;
		min-width: 150px;
	}

	.points-display {
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.points-used {
		color: var(--color-primary);
	}

	.points-separator {
		color: var(--text-muted);
		margin: 0 0.25rem;
	}

	.points-total {
		color: var(--text-secondary);
	}

	.points-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-success);
	}

	.points-label.over-allocated {
		color: var(--color-error);
		font-weight: 600;
	}

	/* Main Content Layout */
	.main-content {
		display: grid;
		grid-template-columns: 400px 1fr;
		gap: 2rem;
		flex: 1;
	}

	.panel-section {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 8px 32px var(--shadow-light);
		height: fit-content;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 2rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 3px solid var(--color-primary);
		position: relative;
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: -3px;
		left: 0;
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, var(--color-secondary), var(--color-accent));
		border-radius: 1.5px;
	}

	/* Character Setup Panel */
	.setup-panel {
		display: flex;
		flex-direction: column;
	}

	.stat-controls {
		margin: 2rem 0;
	}

	.control-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.control-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.quick-actions {
		display: flex;
		gap: 0.5rem;
	}

	.quick-btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-theme);
		border: 1px solid var(--border-primary);
	}

	.quick-btn.secondary {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.quick-btn.secondary:hover {
		background-color: var(--color-secondary);
		color: var(--text-inverse);
		border-color: var(--color-secondary);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px var(--shadow-medium);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	/* Formula Panel */
	.formula-panel {
		display: flex;
		flex-direction: column;
	}

	.formula-sections {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.formula-group {
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-secondary);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.group-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-primary);
	}

	.formula-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Results Bar */
	.results-bar {
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 1.5rem 2rem;
		box-shadow: 0 4px 20px var(--shadow-light);
		min-height: 120px;
		display: flex;
		align-items: center;
	}

	.results-container {
		display: flex;
		gap: 3rem;
		width: 100%;
		align-items: center;
		flex-wrap: wrap;
	}

	.result-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 200px;
	}

	.result-group-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.result-cards {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.no-results {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: var(--color-error);
		font-weight: 500;
		width: 100%;
		justify-content: center;
	}

	.error-icon {
		font-size: 1.5rem;
	}

	.error-text {
		font-size: 1rem;
	}

	/* Responsive Design */
	@media (max-width: 1400px) {
		.main-content {
			grid-template-columns: 350px 1fr;
		}
	}

	@media (max-width: 1200px) {
		.formula-planner {
			padding: 1rem;
		}

		.main-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.top-bar {
			flex-direction: column;
			text-align: center;
		}

		.reference-info {
			min-width: auto;
		}

		.points-tracker {
			text-align: center;
		}
	}

	@media (max-width: 768px) {
		.formula-planner {
			padding: 1rem;
			gap: 1rem;
		}

		.top-bar,
		.panel-section,
		.results-bar {
			padding: 1rem;
		}

		.info-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.info-label {
			min-width: auto;
		}

		.results-container {
			flex-direction: column;
			gap: 1.5rem;
		}

		.result-group {
			width: 100%;
			min-width: auto;
		}

		.result-cards {
			justify-content: center;
		}

		.control-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.quick-actions {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.formula-planner {
			padding: 0.75rem;
		}

		.section-title {
			font-size: 1.25rem;
		}

		.points-display {
			font-size: 1.5rem;
		}
	}
</style>