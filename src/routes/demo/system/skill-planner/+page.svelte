<!-- src/routes/demo/system/skill-planner/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Skill, ITierConfig } from '$lib/types/skill-planner';
	import { defaultTierConfigs, SkillCalculator } from '$lib/utils/skill-calculator';
	import SkillManager from '$lib/components/SkillPlanner/SkillManager.svelte';
	import SkillEditor from '$lib/components/SkillPlanner/SkillEditor.svelte';
	import SkillProgression from '$lib/components/SkillPlanner/SkillProgression.svelte';
	import ProgressionTable from '$lib/components/SkillPlanner/ProgressionTable.svelte';
	import TierConfig from '$lib/components/SkillPlanner/TierConfig.svelte';

	let tierConfigs: ITierConfig[] = $derived([...defaultTierConfigs]);
	let calculator: SkillCalculator = $derived.by(() => new SkillCalculator(tierConfigs));
	let skills: Skill[] = $state([]);
	let selectedSkill: Skill | null = $state(null);
	let showEditor = $state(false);
	let showTable = $state(false);

	function updateTierConfigs(configs: ITierConfig[]) {
		tierConfigs = configs;
	}

	function updateSkills(newSkills: Skill[]) {
		skills = newSkills;
	}

	function selectSkill(skill: Skill) {
		selectedSkill = skill;
		showEditor = false;
	}

	function updateSelectedSkill(skill: Skill) {
		if (!selectedSkill) return;

		// Update the skill in the skills array
		const index = skills.findIndex((s) => selectedSkill && s.id === selectedSkill.id);
		if (index !== -1) {
			skills[index] = skill;
			skills = [...skills];
		}
		selectedSkill = skill;
	}

	function createNewSkill() {
		const newSkill: Skill = {
			id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: 'New Skill',
			description: 'A custom skill',
			maxRank: 10,
			isCombatSkill: true,
			effects: [
				{
					id: `effect_${Date.now()}`,
					name: 'Power',
					type: 'percentage',
					baseValue: 0,
					targetValue: 100,
					targetRank: 10,
					unit: '%',
					description: 'Increases power',
          progressionType: 'curve',
          rankDeltas: [],
				}
			],
			binaryEffects: [],
			currentPoints: 0
		};

		skills = [...skills, newSkill];
		selectedSkill = newSkill;
		showEditor = true;
	}

	// Auto-save to localStorage
	onMount(() => {
		// Load skills from localStorage if available
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('skillPlannerSkills');
			if (saved) {
				try {
					skills = JSON.parse(saved);
				} catch (e) {
					console.warn('Failed to load saved skills:', e);
				}
			}
		}
	});

	// Auto-save whenever skills change
	$effect(() => {
		if (typeof window !== 'undefined' && skills.length > 0) {
			try {
				localStorage.setItem('skillPlannerSkills', JSON.stringify(skills));
			} catch (e) {
				console.warn('Failed to auto-save skills:', e);
			}
		}
	});
</script>

<svelte:head>
	<title>Skill Planner - Progressive Skill System Calculator</title>
	<meta
		name="description"
		content="Interactive calculator for progressive skill system with tier-based costs and accelerating progression curves."
	/>
</svelte:head>

<div class="skill-planner-page">
	<header class="page-header">
		<h1>Progressive Skill System Calculator</h1>
		<p class="page-description">
			Design and test skills with tier-based progression, accelerating power curves, and binary
			unlocks. Every point provides immediate value while building toward meaningful rank
			milestones.
		</p>
	</header>

	<div class="controls-section">
		<TierConfig {tierConfigs} onUpdate={updateTierConfigs} />

		<SkillManager {skills} onSkillsUpdate={updateSkills} onSelectSkill={selectSkill} />
	</div>

	{#if selectedSkill}
		<div class="skill-section">
			<div class="skill-controls">
				<div class="skill-actions">
					<button
						onclick={() => (showEditor = !showEditor)}
						class="btn-editor"
						class:active={showEditor}
					>
						{showEditor ? 'Hide Editor' : 'Edit Skill'}
					</button>

					<button
						onclick={() => (showTable = !showTable)}
						class="btn-table"
						class:active={showTable}
					>
						{showTable ? 'Hide Table' : 'Show Progression Table'}
					</button>

					<button onclick={createNewSkill} class="btn-create"> Create New Skill </button>
				</div>
			</div>

			{#if showEditor}
				<SkillEditor skill={selectedSkill} onUpdate={updateSelectedSkill} />
			{/if}

			<SkillProgression
				bind:skill={selectedSkill}
				{calculator}
				bind:currentPoints={selectedSkill.currentPoints}
			/>

			{#if showTable}
				<ProgressionTable skill={selectedSkill} {calculator} />
			{/if}
		</div>
	{:else}
		<div class="no-selection">
			<div class="no-selection-content">
				<h3>No Skill Selected</h3>
				<p>Choose a skill from the Skill Manager above, or create a new one to get started.</p>
				<button onclick={createNewSkill} class="btn-create-large"> Create New Skill </button>
			</div>
		</div>
	{/if}
</div>

<style>
	.skill-planner-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		background: #f8f9fa;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.page-header h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.page-description {
		margin: 0;
		font-size: 1.1rem;
		opacity: 0.95;
		line-height: 1.6;
		max-width: 700px;
		margin: 0 auto;
	}

	.controls-section {
		margin-bottom: 2rem;
	}

	.skill-section {
		margin-bottom: 2rem;
	}

	.skill-controls {
		margin-bottom: 1rem;
	}

	.skill-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn-editor,
	.btn-table,
	.btn-create {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-editor {
		background: #6f42c1;
		color: white;
	}

	.btn-table {
		background: #17a2b8;
		color: white;
	}

	.btn-create {
		background: #28a745;
		color: white;
	}

	.btn-editor:hover {
		background: #5a3088;
	}
	.btn-table:hover {
		background: #138496;
	}
	.btn-create:hover {
		background: #218838;
	}

	.btn-editor.active {
		background: #5a3088;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.btn-table.active {
		background: #138496;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.no-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		background: white;
		border: 2px dashed #dee2e6;
		border-radius: 12px;
		margin: 2rem 0;
	}

	.no-selection-content {
		text-align: center;
		padding: 2rem;
	}

	.no-selection-content h3 {
		margin: 0 0 1rem 0;
		color: #6c757d;
		font-size: 1.5rem;
	}

	.no-selection-content p {
		margin: 0 0 2rem 0;
		color: #6c757d;
		font-size: 1rem;
		line-height: 1.5;
	}

	.btn-create-large {
		background: #28a745;
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
	}

	.btn-create-large:hover {
		background: #218838;
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(40, 167, 69, 0.4);
	}

	@media (max-width: 768px) {
		.skill-planner-page {
			padding: 1rem;
		}

		.page-header {
			padding: 1.5rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.page-description {
			font-size: 1rem;
		}

		.skill-actions {
			justify-content: center;
			flex-direction: column;
		}

		.btn-editor,
		.btn-table,
		.btn-create {
			width: 100%;
			max-width: 300px;
		}

		.no-selection {
			min-height: 300px;
		}

		.no-selection-content {
			padding: 1.5rem;
		}
	}
</style>
