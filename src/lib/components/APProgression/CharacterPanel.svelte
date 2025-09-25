<!-- src/lib/components/APProgression/CharacterPanel.svelte -->
<script lang="ts">
	import type { Character, ScalingFormula } from '$lib/types/apProgression.js';

	interface Props {
		character: Character;
		selectedFormula: ScalingFormula;
		onCharacterChange: (character: Character) => void;
	}

	let { character, selectedFormula, onCharacterChange }: Props = $props();

	// Character update helper
	function updateCharacter(updates: Partial<Character>) {
		const newCharacter = { ...character, ...updates };
		onCharacterChange(newCharacter);
	}

	// Quick preset functions for character
	function setEarlyGame() {
		updateCharacter({ level: 10, dexterity: 20, ascensions: 0 });
	}

	function setMidGame() {
		updateCharacter({ level: 30, dexterity: 80, ascensions: 1 });
	}

	function setLateGame() {
		updateCharacter({ level: 100, dexterity: 200, ascensions: 3 });
	}

	function setEndGame() {
		updateCharacter({ level: 200, dexterity: 500, ascensions: 10 });
	}

	// Calculate max stat points available
	const maxStatPoints = $derived((character.level - 1) * 5);
</script>

<div class="character-panel">
	<h2 class="panel-title">
		<span class="panel-icon">👤</span>
		Character Stats
	</h2>
	
	<div class="form-group">
		<label for="characterLevel" class="form-label">Level:</label>
		<input 
			id="characterLevel"
			type="number" 
			value={character.level}
			oninput={(e) => updateCharacter({ level: parseInt((e.target as HTMLInputElement).value) || 1 })}
			min="1"
			max="10000"
			class="form-input"
		/>
		<div class="form-hint">
			Max Stat Points: {maxStatPoints.toLocaleString()}
		</div>
	</div>

	<div class="form-group">
		<label for="characterDexterity" class="form-label">Dexterity:</label>
		<input 
			id="characterDexterity"
			type="number" 
			value={character.dexterity}
			oninput={(e) => updateCharacter({ dexterity: parseInt((e.target as HTMLInputElement).value) || 0 })}
			min="0"
			max="1000"
			class="form-input"
		/>
		{#if selectedFormula.type === 'universal'}
			<div class="form-hint">Investment to reach soft cap earlier or push beyond natural limits</div>
		{:else}
			<div class="form-hint">Every 10 Dex = +1 AP (diminishing returns after 50)</div>
		{/if}
		
		<!-- Dex investment warning if over available stat points -->
		{#if character.dexterity > maxStatPoints}
			<div class="investment-warning">
				⚠️ Dex investment exceeds available stat points ({character.dexterity} > {maxStatPoints})
			</div>
		{/if}
	</div>

	<div class="form-group">
		<label for="characterAscensions" class="form-label">Ascensions:</label>
		<input 
			id="characterAscensions"
			type="number" 
			value={character.ascensions}
			oninput={(e) => updateCharacter({ ascensions: parseInt((e.target as HTMLInputElement).value) || 0 })}
			min="0"
			max="100"
			class="form-input"
		/>
		<div class="form-hint">Permanent AP bonuses from previous runs (+{character.ascensions} AP)</div>
	</div>

	<div class="character-presets">
		<h3 class="preset-title">Character Presets:</h3>
		<div class="preset-grid">
			<button onclick={setEarlyGame} class="btn btn-preset">
				<span class="preset-emoji">🌱</span>
				Early Game
				<span class="preset-stats">L10, 20 Dex</span>
			</button>
			<button onclick={setMidGame} class="btn btn-preset">
				<span class="preset-emoji">⚔️</span>
				Mid Game
				<span class="preset-stats">L30, 80 Dex</span>
			</button>
			<button onclick={setLateGame} class="btn btn-preset">
				<span class="preset-emoji">🏰</span>
				Late Game
				<span class="preset-stats">L100, 200 Dex</span>
			</button>
			<button onclick={setEndGame} class="btn btn-preset">
				<span class="preset-emoji">👑</span>
				End Game
				<span class="preset-stats">L200, 500 Dex</span>
			</button>
		</div>
	</div>

	<!-- Investment Analysis -->
	<div class="investment-analysis">
		<h4 class="analysis-title">Investment Analysis</h4>
		<div class="analysis-content">
			<div class="analysis-item">
				<span class="analysis-label">Dex Allocation:</span>
				<span class="analysis-value">
					{((character.dexterity / Math.max(1, maxStatPoints)) * 100).toFixed(1)}% of available points
				</span>
			</div>
			<div class="analysis-item">
				<span class="analysis-label">Remaining Points:</span>
				<span class="analysis-value">
					{Math.max(0, maxStatPoints - character.dexterity).toLocaleString()}
				</span>
			</div>
			<div class="analysis-item">
				<span class="analysis-label">Build Type:</span>
				<span class="analysis-value">
					{#if character.dexterity === 0}
						No Dex Build
					{:else if character.dexterity < maxStatPoints * 0.3}
						Light Dex Investment
					{:else if character.dexterity < maxStatPoints * 0.6}
						Moderate Dex Investment
					{:else}
						Heavy Dex Investment
					{/if}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.character-panel {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-left: 4px solid var(--color-secondary);
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

	.preset-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1.5rem 0 1rem 0;
		color: var(--text-primary);
	}

	.analysis-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: var(--text-primary);
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

	.form-input {
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

	.form-input:focus {
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

	.investment-warning {
		font-size: 0.75rem;
		color: var(--color-warning);
		margin-top: 0.25rem;
		padding: 0.5rem;
		background-color: rgba(var(--color-warning), 0.1);
		border-radius: 4px;
		border: 1px solid var(--color-warning);
	}

	.character-presets {
		margin-top: 1.5rem;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.btn {
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 500;
		transition: var(--transition-theme);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.btn-preset {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
	}

	.btn-preset:hover {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px var(--shadow-medium);
	}

	.preset-emoji {
		font-size: 1.25rem;
	}

	.preset-stats {
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-weight: 400;
	}

	.btn-preset:hover .preset-stats {
		color: var(--text-inverse);
		opacity: 0.8;
	}

	.investment-analysis {
		background-color: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		margin-top: 1.5rem;
	}

	.analysis-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.analysis-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background-color: var(--bg-primary);
		border-radius: 4px;
		border: 1px solid var(--border-primary);
	}

	.analysis-label {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.analysis-value {
		font-size: 0.8125rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.preset-grid {
			grid-template-columns: 1fr;
		}
		
		.analysis-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>