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
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .manager-header h3 {
    margin: 0;
    color: #495057;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn-save, .btn-load, .btn-export, .btn-import {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;
  }

  .btn-save { background: #28a745; color: white; }
  .btn-load { background: #007bff; color: white; }
  .btn-export { background: #6f42c1; color: white; }
  .btn-import { background: #fd7e14; color: white; }

  .btn-save:hover { background: #218838; }
  .btn-load:hover { background: #0056b3; }
  .btn-export:hover { background: #5a3088; }
  .btn-import:hover { background: #e86505; }

  .create-section {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .create-section h4 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  .create-controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .create-controls select {
    flex: 1;
    min-width: 200px;
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .btn-create {
    background: #28a745;
    color: white;
    border: none;
    padding: 0.375rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-create:hover:not(:disabled) {
    background: #218838;
  }

  .btn-create:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .skills-section {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h4 {
    margin: 0;
    color: #495057;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-danger:hover {
    background: #c82333;
  }

  .empty-state {
    text-align: center;
    color: #6c757d;
    padding: 2rem;
    font-style: italic;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .skill-card {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    background: #f8f9fa;
    transition: box-shadow 0.2s ease;
  }

  .skill-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .skill-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .skill-card-name {
    margin: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .skill-card-name.combat {
    color: #dc3545;
  }

  .skill-card-name.utility {
    color: #6f42c1;
  }

  .skill-tag {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
    border-radius: 8px;
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .combat-tag {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f1aeb5;
  }

  .utility-tag {
    background: #e2d9f3;
    color: #493057;
    border: 1px solid #d1b8e6;
  }

  .skill-card-actions {
    display: flex;
    gap: 0.25rem;
  }

  .btn-select, .btn-duplicate, .btn-delete {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .btn-select { background: #007bff; color: white; }
  .btn-duplicate { background: #6c757d; color: white; }
  .btn-delete { background: #dc3545; color: white; }

  .btn-select:hover { background: #0056b3; }
  .btn-duplicate:hover { background: #545b62; }
  .btn-delete:hover { background: #c82333; }

  .skill-card-description {
    color: #6c757d;
    font-size: 0.875rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }

  .skill-card-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #495057;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    width: 90vw;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-header h4 {
    margin: 0;
    color: #495057;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: #495057;
  }

  .modal-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-content textarea {
    flex: 1;
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    resize: vertical;
    margin-bottom: 1rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-copy, .btn-close {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-copy { background: #007bff; color: white; }
  .btn-close { background: #6c757d; color: white; }

  .btn-copy:hover { background: #0056b3; }
  .btn-close:hover { background: #545b62; }

  @media (max-width: 768px) {
    .manager-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      justify-content: center;
    }

    .create-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .create-controls select {
      min-width: unset;
    }

    .skills-grid {
      grid-template-columns: 1fr;
    }

    .skill-card-stats {
      grid-template-columns: 1fr;
    }
  }
</style>