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
	<h3>Saved Builds</h3>
	<div class="save-controls">
		<button class="save-btn" onclick={() => showSaveDialog = true} aria-label="Save current build">Save Current</button>
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
			<h3 id="modal-title">Save Build</h3>
			<input
				bind:value={saveName}
				placeholder="Enter build name..."
				class="save-input"
				aria-label="Build name"
			/>
			<div class="modal-actions">
				<button
					class="cancel-btn"
					onclick={() => showSaveDialog = false}
					aria-label="Cancel saving build"
				>
					Cancel
				</button>
				<button
					class="save-confirm-btn"
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
					Save
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.save-load-section {
		margin-bottom: 24px;
		padding: 16px;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.save-load-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #4b5563;
	}

	.save-controls {
		display: flex;
		gap: 8px;
	}

	.save-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.save-btn:hover {
		background: #5b67d1;
		transform: translateY(-1px);
	}

	.load-select {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 12px;
		background: white;
		cursor: pointer;
	}

	.load-select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 12px;
		padding: 24px;
		min-width: 300px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}

	.modal h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.save-input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		margin-bottom: 20px;
		box-sizing: border-box;
	}

	.save-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.cancel-btn {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn:hover {
		background: #e5e7eb;
	}

	.save-confirm-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.save-confirm-btn:hover {
		background: #5b67d1;
	}

	@media (prefers-color-scheme: dark) {
		.save-load-section {
			background: #111827;
			border-color: #4b5563;
		}

		.save-load-section h3 {
			color: #d1d5db;
		}

		.save-btn {
			background: #7c3aed;
		}

		.save-btn:hover {
			background: #6d28d9;
		}

		.load-select {
			background: #111827;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.load-select:focus {
			border-color: #7c3aed;
			box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
		}

		.modal {
			background: #1f2937;
		}

		.modal h3 {
			color: #f9fafb;
		}

		.save-input {
			background: #111827;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.save-input:focus {
			border-color: #7c3aed;
			box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
		}

		.cancel-btn {
			background: #374151;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.cancel-btn:hover {
			background: #4b5563;
		}

		.save-confirm-btn {
			background: #7c3aed;
		}

		.save-confirm-btn:hover {
			background: #6d28d9;
		}
	}
</style>