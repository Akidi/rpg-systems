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

<div class="formula-workspace">
	<!-- Character Setup Panel -->
	<aside class="character-panel">
		<div class="panel-header">
			<h2>Character Setup</h2>
			<div class="panel-divider"></div>
		</div>

		<BuildSelector
			selectedDistribution={selectedBuild.statDistribution}
			currentLevel={selectedBuild.stats.level}
			onClassBuild={handleClassBuild}
			onCustomDistribution={() => showCustomModal = true}
		/>

		<div class="allocation-section">
			<div class="allocation-header">
				<h3>Stat Points</h3>
				<div class="points-display">
					<span class="points-used">{getUsedStatPoints(selectedBuild.stats)}</span>
					<span class="points-separator">/</span>
					<span class="points-total">{getTotalStatPoints(selectedBuild.stats.level)}</span>
				</div>
			</div>
			<div class="points-remaining {getAvailablePoints(selectedBuild.stats) < 0 ? 'over-allocated' : ''}">
				{getAvailablePoints(selectedBuild.stats)} points remaining
			</div>
			<div class="quick-actions">
				<button class="quick-btn" onclick={resetAllStats} aria-label="Reset all stats to default balanced distribution">Reset All</button>
				<button class="quick-btn" onclick={maxAllStats} aria-label="Maximize all stats evenly">Max All</button>
			</div>
		</div>

		<SaveLoadPanel {selectedBuild} {currentFormulas} {onStatUpdate} {onFormulaUpdate} />

		<div class="stats-section">
			<h3>Character Stats</h3>
			<div class="stats-compact-grid">
				<StatInput statName="level" value={selectedBuild.stats.level} min={1} max={1000} label="Level" onStatUpdate={handleStatChange} />
				<StatInput statName="strength" value={selectedBuild.stats.strength} min={5} max={999} label="STR" onStatUpdate={handleStatChange} />
				<StatInput statName="dexterity" value={selectedBuild.stats.dexterity} min={5} max={999} label="DEX" onStatUpdate={handleStatChange} />
				<StatInput statName="intelligence" value={selectedBuild.stats.intelligence} min={5} max={999} label="INT" onStatUpdate={handleStatChange} />
				<StatInput statName="constitution" value={selectedBuild.stats.constitution} min={5} max={999} label="CON" onStatUpdate={handleStatChange} />
				<StatInput statName="wisdom" value={selectedBuild.stats.wisdom} min={5} max={999} label="WIS" onStatUpdate={handleStatChange} />
				<StatInput statName="charisma" value={selectedBuild.stats.charisma} min={5} max={999} label="CHA" onStatUpdate={handleStatChange} />
			</div>
		</div>
	</aside>

	<!-- Main Formula Editor -->
	<main class="editor-area">
		<div class="editor-header">
			<h2>Formula Editor</h2>
			<div class="helper-info">
				<div class="info-badge">
					<span class="badge-label">Variables:</span>
					<code>level, STR, DEX, INT, CON, WIS, CHA</code>
				</div>
				<div class="info-badge">
					<span class="badge-label">Functions:</span>
					<code>pow(), sqrt(), log(), min(), max(), floor(), ceil()</code>
				</div>
			</div>
		</div>

		<div class="formulas-sections">
			<div class="formula-section">
				<h3 class="formula-section-title">Core Stats</h3>
				<div class="formula-grid">
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

			<div class="formula-section">
				<h3 class="formula-section-title">Damage Types</h3>
				<div class="formula-grid">
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

			<div class="formula-section">
				<h3 class="formula-section-title">Defense & Combat</h3>
				<div class="formula-grid">
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
	</main>

	<!-- Results Preview Panel -->
	{#if derivedStats}
		<aside class="results-panel">
			<div class="panel-header">
				<h2>Live Preview</h2>
				<div class="panel-divider"></div>
			</div>
			
			<div class="results-sections">
				<div class="result-section">
					<h4 class="section-title">Vitals</h4>
					<div class="section-grid">
						<ResultCard name="Health" value={derivedStats.health} />
						<ResultCard name="Mana" value={derivedStats.mana} />
						<ResultCard name="Initiative" value={derivedStats.initiative} />
					</div>
				</div>

				<div class="result-section">
					<h4 class="section-title">Damage</h4>
					<div class="section-grid">
						<ResultCard name="Physical" value={derivedStats.physicalDamage} />
						<ResultCard name="Magical" value={derivedStats.magicalDamage} />
						<ResultCard name="Ranged" value={derivedStats.rangedDamage} />
					</div>
				</div>

				<div class="result-section">
					<h4 class="section-title">Defense</h4>
					<div class="section-grid">
						<ResultCard name="Physical" value={derivedStats.physicalDefense} />
						<ResultCard name="Magical" value={derivedStats.magicalDefense} />
					</div>
				</div>

				<div class="result-section">
					<h4 class="section-title">Combat</h4>
					<div class="section-grid">
						<ResultCard name="Accuracy" value={derivedStats.accuracy.toFixed(1) + '%'} />
						<ResultCard name="Evasion" value={derivedStats.evasion.toFixed(1) + '%'} />
					</div>
				</div>
			</div>
		</aside>
	{:else}
		<aside class="results-panel">
			<div class="panel-header">
				<h2>Live Preview</h2>
				<div class="panel-divider"></div>
			</div>
			<div class="results-sections">
				<p class="no-data">No valid stats available. Please check your formulas.</p>
			</div>
		</aside>
	{/if}
</div>

<style>
	.formula-workspace {
		display: grid;
		grid-template-columns: 320px 1fr 280px;
		gap: 24px;
		padding: 24px;
		min-height: calc(100vh - 200px);
		max-width: 1600px;
		margin: 0 auto;
	}

	/* Panel Headers */
	.panel-header {
		margin-bottom: 24px;
	}

	.panel-header h2 {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.panel-divider {
		height: 2px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
		border-radius: 1px;
		opacity: 0.8;
		transition: var(--transition-theme);
	}

	/* Character Panel */
	.character-panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 20px var(--shadow-light);
		height: fit-content;
		position: sticky;
		top: 24px;
		transition: var(--transition-theme);
	}

	.allocation-section {
		margin-bottom: 32px;
		padding: 16px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-secondary);
		border-radius: 12px;
		transition: var(--transition-theme);
	}

	.allocation-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.allocation-header h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.points-display {
		font-size: 18px;
		font-weight: 700;
	}

	.points-used {
		color: var(--color-primary);
	}

	.points-separator {
		color: var(--text-muted);
		margin: 0 4px;
	}

	.points-total {
		color: var(--text-secondary);
	}

	.points-remaining {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-success);
		text-align: center;
	}

	.points-remaining.over-allocated {
		color: var(--color-error);
		font-weight: 600;
	}

	.quick-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.quick-btn {
		flex: 1;
		background-color: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-primary);
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.quick-btn:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	.stats-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.stats-compact-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	/* Editor Area */
	.editor-area {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 20px var(--shadow-light);
		transition: var(--transition-theme);
	}

	.editor-header {
		margin-bottom: 24px;
	}

	.editor-header h2 {
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.helper-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.info-badge {
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 13px;
		line-height: 1.4;
		transition: var(--transition-theme);
	}

	.badge-label {
		font-weight: 600;
		color: var(--text-primary);
		margin-right: 8px;
	}

	.info-badge code {
		background-color: var(--bg-primary);
		border: 1px solid var(--border-secondary);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 12px;
		color: var(--color-primary);
	}

	.formulas-sections {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.formula-section {
		border-bottom: 1px solid var(--border-primary);
		padding-bottom: 16px;
	}

	.formula-section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.formula-section-title {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.formula-grid {
		display: grid;
		gap: 8px;
	}

	/* Results Panel */
	.results-panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 20px var(--shadow-light);
		height: fit-content;
		position: sticky;
		top: 24px;
		transition: var(--transition-theme);
	}

	.results-sections {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.result-section {
		border-bottom: 1px solid var(--border-primary);
		padding-bottom: 12px;
	}

	.result-section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.section-title {
		margin: 0 0 8px 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		gap: 6px;
	}

	.no-data {
		color: var(--color-error);
		font-size: 14px;
		text-align: center;
		padding: 16px;
	}

	/* Responsive Design */
	@media (max-width: 1400px) {
		.formula-workspace {
			grid-template-columns: 300px 1fr 260px;
		}
	}

	@media (max-width: 1200px) {
		.formula-workspace {
			grid-template-columns: 280px 1fr;
			grid-template-rows: auto 1fr auto;
		}

		.character-panel {
			position: static;
		}

		.results-panel {
			grid-column: 1 / -1;
			grid-row: 3;
			position: static;
		}
	}

	@media (max-width: 900px) {
		.formula-workspace {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}

		.character-panel {
			grid-row: 1;
			position: static;
		}

		.editor-area {
			grid-row: 2;
		}

		.results-panel {
			grid-row: 3;
		}
	}

	@media (max-width: 768px) {
		.formula-workspace {
			gap: 16px;
			padding: 16px;
		}

		.stats-compact-grid {
			grid-template-columns: 1fr;
		}

		.helper-info {
			flex-direction: column;
		}
	}
</style>