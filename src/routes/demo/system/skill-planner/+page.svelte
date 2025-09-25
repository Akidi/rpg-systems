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
    max-width: 100vw;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    transition: var(--transition-theme);
    display: flex;
    flex-direction: column;
  }

  /* Compact header */
  .page-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%);
    color: var(--text-inverse);
    padding: 1.5rem 2rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px var(--shadow-heavy);
  }

  .page-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 15px,
      rgba(255,255,255,0.05) 15px,
      rgba(255,255,255,0.05) 30px
    );
    animation: headerShimmer 30s linear infinite;
  }

  @keyframes headerShimmer {
    0% { transform: translateX(-30px); }
    100% { transform: translateX(30px); }
  }

  .page-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 900;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
    z-index: 2;
  }

  .page-description {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.95;
    line-height: 1.5;
    position: relative;
    z-index: 2;
    max-width: 700px;
  }

  /* Main workspace - horizontal layout */
  .workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 0;
    min-height: 0;
  }

  /* Left sidebar for controls */
  .controls-sidebar {
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-primary);
    overflow-y: auto;
    padding: 1rem;
    box-shadow: 4px 0 20px var(--shadow-light);
    position: relative;
  }

  .controls-sidebar::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, 
      transparent 0%,
      var(--color-primary) 50%,
      transparent 100%);
    opacity: 0.3;
  }

  .controls-section {
    margin-bottom: 0;
  }

  /* Main content area */
  .main-content {
    overflow-y: auto;
    padding: 1rem;
    background: var(--bg-primary);
    position: relative;
  }

  /* Floating skill controls */
  .skill-controls {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(var(--bg-secondary), 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-primary);
    border-radius: 0 0 16px 16px;
    padding: 1rem 1.5rem;
    margin: -1rem -1rem 1rem -1rem;
    box-shadow: 0 4px 20px var(--shadow-medium);
  }

  .skill-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;
  }

  .btn-editor,
  .btn-table,
  .btn-create {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px var(--shadow-light);
  }

  .btn-editor {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: var(--text-inverse);
  }

  .btn-table {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    color: var(--text-inverse);
  }

  .btn-create {
    background: linear-gradient(135deg, var(--color-success) 0%, var(--color-primary) 100%);
    color: var(--text-inverse);
  }

  .btn-editor::before,
  .btn-table::before,
  .btn-create::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  .btn-editor:hover::before,
  .btn-table:hover::before,
  .btn-create:hover::before {
    left: 100%;
  }

  .btn-editor:hover,
  .btn-table:hover,
  .btn-create:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow-heavy);
  }

  .btn-editor.active,
  .btn-table.active {
    box-shadow: inset 0 4px 8px rgba(0,0,0,0.2);
    transform: translateY(1px);
  }

  /* No selection state */
  .no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    border: 2px dashed var(--border-secondary);
    border-radius: 20px;
    margin: 2rem;
    position: relative;
    overflow: hidden;
  }

  .no-selection::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(var(--color-primary), 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 50%, rgba(var(--color-secondary), 0.1) 0%, transparent 50%);
    animation: backgroundPulse 6s ease-in-out infinite alternate;
  }

  @keyframes backgroundPulse {
    0% { opacity: 0.3; }
    100% { opacity: 0.7; }
  }

  .no-selection-content {
    text-align: center;
    padding: 3rem;
    position: relative;
    z-index: 2;
  }

  .no-selection-content::before {
    content: '⚔️';
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.6;
    animation: iconBob 3s ease-in-out infinite;
  }

  @keyframes iconBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .no-selection-content h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .no-selection-content p {
    margin: 0 0 2rem 0;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .btn-create-large {
    background: linear-gradient(135deg, var(--color-success) 0%, var(--color-primary) 50%, var(--color-accent) 100%);
    color: var(--text-inverse);
    border: none;
    padding: 1.25rem 2.5rem;
    border-radius: 16px;
    cursor: pointer;
    font-size: 1.125rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: var(--transition-theme);
    box-shadow: 0 8px 32px var(--shadow-heavy);
    position: relative;
    overflow: hidden;
  }

  .btn-create-large::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.6s;
  }

  .btn-create-large:hover::before {
    left: 100%;
  }

  .btn-create-large:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 40px var(--shadow-heavy);
  }

  /* Skill section optimization */
  .skill-section {
    margin-bottom: 0;
  }

  /* Custom scrollbar for sidebar */
  .controls-sidebar::-webkit-scrollbar {
    width: 8px;
  }

  .controls-sidebar::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 4px;
  }

  .controls-sidebar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 4px;
  }

  .controls-sidebar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-primary-hover), var(--color-primary));
  }

  /* Main content scrollbar */
  .main-content::-webkit-scrollbar {
    width: 12px;
  }

  .main-content::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 6px;
  }

  .main-content::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 6px;
    border: 2px solid var(--bg-primary);
  }

  .main-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-primary-hover), var(--color-primary));
  }

  /* Responsive design */
  @media (max-width: 1200px) {
    .workspace {
      grid-template-columns: 280px 1fr;
    }
  }

  @media (max-width: 968px) {
    .workspace {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .controls-sidebar {
      border-right: none;
      border-bottom: 1px solid var(--border-primary);
      overflow-y: visible;
      padding: 1rem 1rem 0 1rem;
      box-shadow: 0 4px 20px var(--shadow-light);
    }

    .controls-sidebar::before {
      display: none;
    }

    .page-header {
      padding: 1rem 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
    }

    .skill-controls {
      margin: -1rem -1rem 0 -1rem;
      border-radius: 0;
    }

    .skill-actions {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .btn-editor,
    .btn-table,
    .btn-create {
      flex: 1;
      min-width: 120px;
      padding: 0.625rem 1rem;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 640px) {
    .skill-planner-page {
      padding: 0;
    }

    .page-header {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
    }

    .page-description {
      font-size: 0.85rem;
    }

    .controls-sidebar,
    .main-content {
      padding: 0.75rem;
    }

    .no-selection {
      margin: 1rem;
      min-height: 50vh;
    }

    .no-selection-content {
      padding: 2rem;
    }

    .no-selection-content::before {
      font-size: 3rem;
    }

    .btn-create-large {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    .skill-actions {
      flex-direction: column;
    }

    .btn-editor,
    .btn-table,
    .btn-create {
      width: 100%;
    }
  }
</style>