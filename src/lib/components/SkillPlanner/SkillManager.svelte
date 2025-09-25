<!-- $lib/components/SkillPlanner/SkillManager.svelte -->
<script lang="ts">
  import type { Skill } from '$lib/types/skill-planner';
  import { skillTemplates } from '$lib/data/skill-templates';
  import { browser } from '$app/environment';
  
  type Props = {
    skills: Skill[]
    onSkillsUpdate: (skills: Skill[]) => void
    onSelectSkill: (skill: Skill) => void
  }

  let { skills = $bindable(), onSkillsUpdate, onSelectSkill }: Props = $props();

  let selectedTemplate = $state('');
  let importData = $state('');
  let showImport = $state(false);
  let showExport = $state(false);
  let exportData = $state('');

  function createSkillFromTemplate(templateId: string) {
    const template = skillTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newSkill: Skill = {
      ...template.skill,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentPoints: 0
    };

    skills = [...skills, newSkill];
    onSkillsUpdate(skills);
    selectedTemplate = '';
  }

  function deleteSkill(skillId: string) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    skills = skills.filter(s => s.id !== skillId);
    onSkillsUpdate(skills);
  }

  function duplicateSkill(skill: Skill) {
    const duplicated: Skill = {
      ...structuredClone(skill),
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${skill.name} (Copy)`,
      currentPoints: 0
    };
    skills = [...skills, duplicated];
    onSkillsUpdate(skills);
  }

  function saveSkills() {
    if (!browser) return;
    try {
      localStorage.setItem('skillPlannerSkills', JSON.stringify(skills));
      alert('Skills saved successfully!');
    } catch (error) {
      alert('Failed to save skills: ' + error);
    }
  }

  function loadSkills() {
    if (!browser) return;
    try {
      const saved = localStorage.getItem('skillPlannerSkills');
      if (saved) {
        const loadedSkills = JSON.parse(saved) as Skill[];
        skills = loadedSkills;
        onSkillsUpdate(skills);
        alert('Skills loaded successfully!');
      } else {
        alert('No saved skills found.');
      }
    } catch (error) {
      alert('Failed to load skills: ' + error);
    }
  }

  function exportSkills() {
    exportData = JSON.stringify(skills, null, 2);
    showExport = true;
  }

  function importSkills() {
    try {
      const imported = JSON.parse(importData) as Skill[];
      // Validate basic structure
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected an array');
      }
      
      // Add imported skills with new IDs to avoid conflicts
      const importedWithNewIds = imported.map(skill => ({
        ...skill,
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        currentPoints: 0
      }));
      
      skills = [...skills, ...importedWithNewIds];
      onSkillsUpdate(skills);
      importData = '';
      showImport = false;
      alert(`Successfully imported ${importedWithNewIds.length} skills!`);
    } catch (error) {
      alert('Failed to import skills: ' + error);
    }
  }

  function copyToClipboard() {
    if (browser && navigator.clipboard) {
      navigator.clipboard.writeText(exportData);
      alert('Copied to clipboard!');
    }
  }

  function clearAllSkills() {
    if (!confirm('Are you sure you want to delete ALL skills? This cannot be undone.')) return;
    skills = [];
    onSkillsUpdate(skills);
  }

  // Handle modal backdrop clicks
  function handleExportOverlayClick(e: Event) {
    if (e.target === e.currentTarget) {
      showExport = false;
    }
  }

  function handleImportOverlayClick(e: Event) {
    if (e.target === e.currentTarget) {
      showImport = false;
    }
  }

  // Handle keyboard events for accessibility
  function handleExportOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      showExport = false;
    }
  }

  function handleImportOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      showImport = false;
    }
  }
</script>

<div class="skill-manager">
  <div class="manager-header">
    <h3>Skill Manager</h3>
    <div class="header-actions">
      <button onclick={saveSkills} class="btn-save">Save to Browser</button>
      <button onclick={loadSkills} class="btn-load">Load from Browser</button>
      <button onclick={exportSkills} class="btn-export">Export Data</button>
      <button onclick={() => showImport = true} class="btn-import">Import Data</button>
    </div>
  </div>

  <div class="create-section">
    <h4>Create New Skill</h4>
    <div class="create-controls">
      <select bind:value={selectedTemplate}>
        <option value="">Select a template...</option>
        {#each skillTemplates as template}
          <option value={template.id}>{template.name}</option>
        {/each}
      </select>
      <button 
        onclick={() => createSkillFromTemplate(selectedTemplate)} 
        disabled={!selectedTemplate}
        class="btn-create"
      >
        Create Skill
      </button>
    </div>
  </div>

  <div class="skills-section">
    <div class="section-header">
      <h4>Current Skills ({skills.length})</h4>
      {#if skills.length > 0}
        <button onclick={clearAllSkills} class="btn-danger">Clear All</button>
      {/if}
    </div>

    {#if skills.length === 0}
      <div class="empty-state">
        <p>No skills created yet. Use a template above to get started!</p>
      </div>
    {:else}
      <div class="skills-grid">
        {#each skills as skill}
          <div class="skill-card">
            <div class="skill-card-header">
              <h5 class="skill-card-name" class:combat={skill.isCombatSkill} class:utility={!skill.isCombatSkill}>
                {skill.name}
                {#if skill.isCombatSkill}
                  <span class="skill-tag combat-tag">Combat</span>
                {:else}
                  <span class="skill-tag utility-tag">Utility</span>
                {/if}
              </h5>
              <div class="skill-card-actions">
                <button onclick={() => onSelectSkill(skill)} class="btn-select">Select</button>
                <button onclick={() => duplicateSkill(skill)} class="btn-duplicate">Copy</button>
                <button onclick={() => deleteSkill(skill.id)} class="btn-delete">×</button>
              </div>
            </div>
            
            <p class="skill-card-description">{skill.description}</p>
            
            <div class="skill-card-stats">
              <span>Max Rank: {skill.maxRank}</span>
              <span>Effects: {skill.effects.length}</span>
              <span>Abilities: {skill.binaryEffects.length}</span>
              <span>Points: {skill.currentPoints}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Export Modal -->
{#if showExport}
  <div 
    class="modal-overlay" 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="export-modal-title"
    onclick={handleExportOverlayClick}
    onkeydown={handleExportOverlayKeydown}
    tabindex="-1"
  >
    <div class="modal">
      <div class="modal-header">
        <h4 id="export-modal-title">Export Skills Data</h4>
        <button onclick={() => showExport = false} class="modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-content">
        <p>Copy this data to share or backup your skills:</p>
        <textarea readonly bind:value={exportData} rows="15" aria-label="Exported skill data"></textarea>
        <div class="modal-actions">
          <button onclick={copyToClipboard} class="btn-copy">Copy to Clipboard</button>
          <button onclick={() => showExport = false} class="btn-close">Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Import Modal -->
{#if showImport}
  <div 
    class="modal-overlay" 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="import-modal-title"
    onclick={handleImportOverlayClick}
    onkeydown={handleImportOverlayKeydown}
    tabindex="-1"
  >
    <div class="modal">
      <div class="modal-header">
        <h4 id="import-modal-title">Import Skills Data</h4>
        <button onclick={() => showImport = false} class="modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-content">
        <p>Paste exported skills data here:</p>
        <textarea 
          bind:value={importData} 
          rows="15" 
          placeholder="Paste JSON data here..."
          aria-label="Import skill data input"
        ></textarea>
        <div class="modal-actions">
          <button onclick={importSkills} disabled={!importData.trim()} class="btn-import">Import Skills</button>
          <button onclick={() => showImport = false} class="btn-close">Cancel</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .skill-manager {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 0;
    margin-bottom: 1rem;
    transition: var(--transition-theme);
    box-shadow: 0 8px 32px var(--shadow-light);
    overflow: hidden;
    position: relative;
  }

  .skill-manager::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));
    border-radius: 16px 16px 0 0;
  }

  .manager-header {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
    padding: 1.25rem 1.5rem;
    color: var(--text-inverse);
    position: relative;
    overflow: hidden;
  }

  .manager-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 12px,
      rgba(255,255,255,0.05) 12px,
      rgba(255,255,255,0.05) 24px
    );
    animation: managerPattern 20s linear infinite;
  }

  @keyframes managerPattern {
    0% { transform: translateX(-24px); }
    100% { transform: translateX(24px); }
  }

  .manager-header h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .header-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    position: relative;
    z-index: 2;
  }

  .btn-save, .btn-load, .btn-export, .btn-import {
    padding: 0.5rem 0.75rem;
    border: 2px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-inverse);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    position: relative;
    overflow: hidden;
  }

  .btn-save::before, .btn-load::before, .btn-export::before, .btn-import::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.4s;
  }

  .btn-save:hover::before, .btn-load:hover::before, .btn-export:hover::before, .btn-import:hover::before {
    left: 100%;
  }

  .btn-save:hover, .btn-load:hover, .btn-export:hover, .btn-import:hover {
    background: rgba(255,255,255,0.25);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .manager-content {
    padding: 1.5rem;
  }

  /* Create section - compact */
  .create-section {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 4px 16px var(--shadow-light);
    position: relative;
    overflow: hidden;
  }

  .create-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-success), var(--color-primary));
  }

  .create-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .create-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .create-controls select {
    padding: 0.75rem;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    color: var(--text-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-theme);
    box-shadow: inset 0 2px 4px var(--shadow-light);
  }

  .create-controls select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 
      inset 0 2px 4px var(--shadow-light),
      0 0 0 3px rgba(var(--color-primary), 0.2);
  }

  .btn-create {
    background: linear-gradient(135deg, var(--color-success) 0%, var(--color-primary) 100%);
    color: var(--text-inverse);
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    box-shadow: 0 4px 16px var(--shadow-medium);
    position: relative;
    overflow: hidden;
  }

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

  .btn-create:hover::before {
    left: 100%;
  }

  .btn-create:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow-heavy);
  }

  .btn-create:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }

  /* Skills section - compact scrollable */
  .skills-section {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 16px var(--shadow-light);
    overflow: hidden;
    position: relative;
    max-height: 400px;
  }

  .skills-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  }

  .section-header {
    background: var(--bg-tertiary);
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .section-header h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-danger {
    background: linear-gradient(135deg, var(--color-error) 0%, var(--color-primary) 100%);
    color: var(--text-inverse);
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    box-shadow: 0 2px 8px var(--shadow-medium);
  }

  .btn-danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-heavy);
  }

  .skills-container {
    padding: 1rem;
    overflow-y: auto;
    max-height: 320px;
  }

  .skills-container::-webkit-scrollbar {
    width: 6px;
  }

  .skills-container::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }

  .skills-container::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 3px;
  }

  .empty-state {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem 1rem;
    position: relative;
  }

  .empty-state::before {
    content: '⚔️';
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.75rem;
    opacity: 0.5;
    animation: emptyBob 3s ease-in-out infinite;
  }

  @keyframes emptyBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .skills-grid {
    display: grid;
    gap: 0.75rem;
  }

  .skill-card {
    border: 2px solid var(--border-primary);
    border-radius: 10px;
    padding: 1rem;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    transition: var(--transition-theme);
    box-shadow: 0 2px 8px var(--shadow-light);
    position: relative;
    overflow: hidden;
  }

  .skill-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    opacity: 0;
    transition: opacity 0.3s;
  }

  .skill-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px var(--shadow-medium);
    border-color: var(--color-primary);
  }

  .skill-card:hover::before {
    opacity: 1;
  }

  .skill-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 0.75rem;
  }

  .skill-card-name {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    line-height: 1.3;
  }

  .skill-card-name.combat {
    color: var(--color-error);
  }

  .skill-card-name.utility {
    color: var(--color-primary);
  }

  .skill-tag {
    font-size: 0.6rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    white-space: nowrap;
  }

  .combat-tag {
    background: linear-gradient(135deg, var(--color-error) 0%, var(--color-primary) 100%);
    color: var(--text-inverse);
  }

  .utility-tag {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: var(--text-inverse);
  }

  .skill-card-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .btn-select, .btn-duplicate, .btn-delete {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-inverse);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    position: relative;
    overflow: hidden;
  }

  .btn-select { background: var(--color-primary); }
  .btn-duplicate { background: var(--color-secondary); }
  .btn-delete { background: var(--color-error); }

  .btn-select::before, .btn-duplicate::before, .btn-delete::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.3s;
  }

  .btn-select:hover::before, .btn-duplicate:hover::before, .btn-delete:hover::before {
    left: 100%;
  }

  .btn-select:hover, .btn-duplicate:hover, .btn-delete:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--shadow-medium);
  }

  .skill-card-description {
    color: var(--text-secondary);
    font-size: 0.8rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .skill-card-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
    font-size: 0.7rem;
    color: var(--text-primary);
  }

  .skill-card-stats span {
    background: var(--bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    border: 1px solid var(--border-primary);
  }

  /* Modal Styles */
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
    backdrop-filter: blur(8px);
  }

  .modal {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    border: 2px solid var(--border-primary);
    border-radius: 16px;
    width: 90vw;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px var(--shadow-heavy);
    overflow: hidden;
    position: relative;
  }

  .modal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  }

  .modal-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    padding: 1.25rem 1.5rem;
    color: var(--text-inverse);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .modal-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(255,255,255,0.05) 8px,
      rgba(255,255,255,0.05) 16px
    );
  }

  .modal-header h4 {
    margin: 0;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 2;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .modal-close {
    background: rgba(255,255,255,0.2);
    border: 2px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-inverse);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: var(--transition-theme);
    position: relative;
    z-index: 2;
  }

  .modal-close:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1) rotate(90deg);
  }

  .modal-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-content p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .modal-content textarea {
    flex: 1;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    color: var(--text-primary);
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    resize: vertical;
    margin-bottom: 1rem;
    transition: var(--transition-theme);
    min-height: 200px;
    box-shadow: inset 0 2px 4px var(--shadow-light);
  }

  .modal-content textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 
      inset 0 2px 4px var(--shadow-light),
      0 0 0 3px rgba(var(--color-primary), 0.2);
  }

  .modal-content textarea::placeholder {
    color: var(--text-muted);
    font-style: italic;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .btn-copy, .btn-close {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-inverse);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition-theme);
    position: relative;
    overflow: hidden;
  }

  .btn-copy { 
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  }
  .btn-close { 
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--text-muted) 100%);
  }

  .btn-copy::before, .btn-close::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  .btn-copy:hover::before, .btn-close:hover::before {
    left: 100%;
  }

  .btn-copy:hover, .btn-close:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--shadow-medium);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .manager-header {
      padding: 1rem;
    }

    .header-actions {
      grid-template-columns: 1fr 1fr;
      gap: 0.375rem;
    }

    .btn-save, .btn-load, .btn-export, .btn-import {
      padding: 0.375rem 0.5rem;
      font-size: 0.7rem;
    }

    .manager-content {
      padding: 1rem;
    }

    .create-section,
    .skills-section {
      margin-bottom: 1rem;
    }

    .skills-section {
      max-height: 300px;
    }

    .skills-container {
      max-height: 220px;
    }

    .skill-card-stats {
      grid-template-columns: 1fr;
    }

    .modal {
      width: 95vw;
      max-width: none;
    }

    .modal-actions {
      flex-direction: column;
    }

    .btn-copy, .btn-close {
      width: 100%;
    }
  }
</style>