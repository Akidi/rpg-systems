<!-- src/lib/components/FormulaSystem/SaveLoadPanel.svelte -->
<script lang="ts">
	import type { CharacterStats, DerivedStats, FormulaSet, CharacterBuild } from '$lib/types/formulaPlanner.js';

	interface SavedBuild {
		name: string;
		level: number;
		statDistribution: 'balanced' | 'warrior' | 'mage' | 'rogue' | 'custom';
		stats: CharacterStats;
		formulas: Record<keyof DerivedStats, string>;
		savedAt: string;
	}

	interface Props {
		selectedBuild: CharacterBuild;
		currentFormulas: FormulaSet;
		onStatUpdate: (statName: keyof CharacterStats, value: number) => void;
		onFormulaUpdate: (statName: keyof DerivedStats, formula: string) => void;
	}

	let { selectedBuild, currentFormulas, onStatUpdate, onFormulaUpdate }: Props = $props();

	function saveCurrentBuild(name: string) {
		const builds = getSavedBuilds();
		const buildToSave: SavedBuild = {
			...selectedBuild,
			name,
			formulas: { ...currentFormulas.formulas },
			savedAt: new Date().toISOString()
		};
		
		builds[name] = buildToSave;
		localStorage.setItem('formulaPlanner_builds', JSON.stringify(builds));
		savedBuilds = { ...builds };
	}

	function getSavedBuilds(): Record<string, SavedBuild> {
		try {
			const saved = localStorage.getItem('formulaPlanner_builds');
			return saved ? JSON.parse(saved) : {};
		} catch {
			return {};
		}
	}

	function loadBuild(buildName: string) {
		const builds = getSavedBuilds();
		const build = builds[buildName];
		if (build) {
			Object.entries(build.stats).forEach(([key, value]) => {
				onStatUpdate(key as keyof CharacterStats, value as number);
			});
			Object.entries(build.formulas).forEach(([key, value]) => {
				onFormulaUpdate(key as keyof DerivedStats, value as string);
			});
			savedBuilds = { ...builds };
		}
	}

	function deleteBuild(buildName: string) {
		const builds = getSavedBuilds();
		delete builds[buildName];
		localStorage.setItem('formulaPlanner_builds', JSON.stringify(builds));
		savedBuilds = { ...builds };
	}

	let showSaveDialog = $state(false);
	let saveName = $state('');
	let savedBuilds = $state<Record<string, SavedBuild>>(getSavedBuilds());
</script>

<div class="save-load-section">
	<h3 class="section-title">
		<span class="title-icon">💾</span>
		Saved Builds
	</h3>
	<div class="save-controls">
		<button class="save-btn" onclick={() => showSaveDialog = true} aria-label="Save current build">
			Save Current
		</button>
		<select
			class="load-select"
			onchange={(e) => {
				const buildName = (e.target as HTMLSelectElement).value;
				if (buildName) loadBuild(buildName);
			}}
			aria-label="Load a saved build"
		>
			<option value="">Load Saved Build...</option>
			{#each Object.keys(savedBuilds) as buildName}
				<option value={buildName}>{buildName}</option>
			{/each}
		</select>
	</div>
</div>

{#if showSaveDialog}
	<div 
		class="modal-overlay" 
		onclick={() => showSaveDialog = false}
		onkeydown={(e) => e.key === 'Escape' && (showSaveDialog = false)}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	>
		<div 
			class="modal" 
			onclick={(e) => e.stopPropagation()} 
			onkeydown={(e) => e.stopPropagation()}
			role="dialog" 
			aria-labelledby="modal-title"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<h3 id="modal-title">Save Build</h3>
				<button 
					class="close-btn"
					onclick={() => showSaveDialog = false}
					aria-label="Close dialog"
				>
					×
				</button>
			</div>
			<input
				bind:value={saveName}
				placeholder="Enter build name..."
				class="save-input"
				aria-label="Build name"
			/>
			<div class="modal-actions">
				<button
					class="btn btn-secondary"
					onclick={() => showSaveDialog = false}
					aria-label="Cancel saving build"
				>
					Cancel
				</button>
				<button
					class="btn btn-primary"
					onclick={() => {
						if (saveName.trim()) {
							saveCurrentBuild(saveName.trim());
							savedBuilds = getSavedBuilds();
							showSaveDialog = false;
							saveName = '';
						}
					}}
					aria-label="Save build with current name"
				>
					Save Build
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.save-load-section {
		margin-bottom: 24px;
		padding: 16px;
		background-color: var(--bg-tertiary);
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.section-title {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title-icon {
		font-size: 1.25rem;
	}

	.save-controls {
		display: flex;
		gap: 8px;
	}

	.save-btn {
		background-color: var(--color-primary);
		color: var(--text-inverse);
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.save-btn:hover {
		background-color: var(--color-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	.load-select {
		flex: 1;
		padding: 8px 12px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		font-size: 12px;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.load-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary), 0.1);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--bg-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 0;
		min-width: 300px;
		max-width: 90vw;
		box-shadow: 0 20px 40px var(--shadow-heavy);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border-primary);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: var(--transition-theme);
	}

	.close-btn:hover {
		color: var(--color-error);
		background-color: rgba(var(--color-error), 0.1);
	}

	.save-input {
		width: 100%;
		padding: 12px 24px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		font-size: 14px;
		margin: 20px 0;
		box-sizing: border-box;
		border-left: none;
		border-right: none;
		transition: var(--transition-theme);
	}

	.save-input:focus {
		outline: none;
		background-color: var(--bg-tertiary);
		border-color: var(--color-primary);
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding: 20px 24px;
		border-top: 1px solid var(--border-primary);
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.btn-secondary {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
	}

	.btn-secondary:hover {
		background-color: var(--bg-primary);
		border-color: var(--color-secondary);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--text-inverse);
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
		box-shadow: 0 2px 4px var(--shadow-medium);
	}

	/* Mobile responsive */
	@media (max-width: 480px) {
		.save-controls {
			flex-direction: column;
		}

		.modal {
			margin: 20px;
			min-width: auto;
		}

		.modal-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>