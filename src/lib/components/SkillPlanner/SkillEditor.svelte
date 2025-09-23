<!-- $lib/components/SkillPlanner/SkillEditor.svelte - Updated with dual progression system -->
<script lang="ts">
  import type { Skill, EffectType, BinaryEffect, RankDelta, ProgressionType, DeltaType } from '$lib/types/skill-planner';
  
  interface Props {
    skill: Skill;
    onUpdate: (skill: Skill) => void;
  }

  let { skill, onUpdate }: Props = $props();

  function updateSkill(field: keyof Skill, value: any) {
    skill = { ...skill, [field]: value };
    onUpdate(skill);
  }

  function updateEffect(index: number, field: keyof EffectType, value: any) {
    const effects = [...skill.effects];
    effects[index] = { ...effects[index], [field]: value };
    updateSkill('effects', effects);
  }

  function updateEffectProgressionType(index: number, type: ProgressionType) {
    const effects = [...skill.effects];
    const effect = effects[index];
    
    // Initialize appropriate fields based on type
    if (type === 'per-rank' && (!effect.rankDeltas || effect.rankDeltas.length === 0)) {
      // Create default rank deltas
      const deltas: RankDelta[] = [];
      for (let rank = 0; rank < skill.maxRank; rank++) {
        deltas.push({
          fromRank: rank,
          toRank: rank + 1,
          deltaValue: 10,
          deltaType: 'flat'
        });
      }
      effects[index] = { 
        ...effect, 
        progressionType: type,
        rankDeltas: deltas
      };
    } else {
      effects[index] = { ...effect, progressionType: type };
    }
    
    updateSkill('effects', effects);
  }

  function updateRankDelta(effectIndex: number, deltaIndex: number, field: keyof RankDelta, value: any) {
    const effects = [...skill.effects];
    const rankDeltas = [...effects[effectIndex].rankDeltas];
    rankDeltas[deltaIndex] = { ...rankDeltas[deltaIndex], [field]: value };
    effects[effectIndex] = { ...effects[effectIndex], rankDeltas };
    updateSkill('effects', effects);
  }

  function addRankDelta(effectIndex: number) {
    const effects = [...skill.effects];
    const effect = effects[effectIndex];
    const currentDeltas = effect.rankDeltas || [];
    
    const newDelta: RankDelta = {
      fromRank: currentDeltas.length,
      toRank: currentDeltas.length + 1,
      deltaValue: 10,
      deltaType: 'flat'
    };
    
    effects[effectIndex] = {
      ...effect,
      rankDeltas: [...currentDeltas, newDelta]
    };
    
    updateSkill('effects', effects);
  }

  function removeRankDelta(effectIndex: number, deltaIndex: number) {
    const effects = [...skill.effects];
    const rankDeltas = effects[effectIndex].rankDeltas.filter((_, i) => i !== deltaIndex);
    effects[effectIndex] = { ...effects[effectIndex], rankDeltas };
    updateSkill('effects', effects);
  }

  function addEffect() {
    const newEffect: EffectType = {
      id: `effect_${Date.now()}`,
      name: 'New Effect',
      type: 'percentage',
      unit: '%',
      description: 'New effect description',
      progressionType: 'curve',
      baseValue: 0,
      targetValue: 100,
      targetRank: skill.maxRank,
      rankDeltas: []
    };
    updateSkill('effects', [...skill.effects, newEffect]);
  }

  function removeEffect(index: number) {
    const effects = skill.effects.filter((_, i) => i !== index);
    updateSkill('effects', effects);
  }

  function updateBinaryEffect(index: number, field: keyof BinaryEffect, value: any) {
    const binaryEffects = [...skill.binaryEffects];
    binaryEffects[index] = { ...binaryEffects[index], [field]: value };
    updateSkill('binaryEffects', binaryEffects);
  }

  function addBinaryEffect() {
    const newBinary: BinaryEffect = {
      id: `binary_${Date.now()}`,
      name: 'New Binary Effect',
      description: 'New binary effect description',
      unlockRank: Math.max(1, Math.floor(skill.maxRank / 2))
    };
    updateSkill('binaryEffects', [...skill.binaryEffects, newBinary]);
  }

  function removeBinaryEffect(index: number) {
    const binaryEffects = skill.binaryEffects.filter((_, i) => i !== index);
    updateSkill('binaryEffects', binaryEffects);
  }

  function generateRankDeltasFromCurve(effectIndex: number) {
    const effect = skill.effects[effectIndex];
    if (effect.progressionType !== 'curve') return;
    
    const deltas: RankDelta[] = [];
    const totalIncrease = effect.targetValue - effect.baseValue;
    const increasePerRank = totalIncrease / skill.maxRank;
    
    for (let rank = 0; rank < skill.maxRank; rank++) {
      deltas.push({
        fromRank: rank,
        toRank: rank + 1,
        deltaValue: Math.round(increasePerRank * 10) / 10, // Round to 1 decimal
        deltaType: 'flat'
      });
    }
    
    const effects = [...skill.effects];
    effects[effectIndex] = {
      ...effect,
      progressionType: 'per-rank',
      rankDeltas: deltas
    };
    updateSkill('effects', effects);
  }
</script>

<div class="skill-editor">
  <div class="skill-header">
    <h3>Skill Editor</h3>
  </div>

  <div class="basic-info">
    <label>
      Name:
      <input 
        type="text" 
        value={skill.name}
        oninput={(e) => updateSkill('name', e.currentTarget.value)}
      />
    </label>

    <label>
      Description:
      <textarea 
        value={skill.description}
        oninput={(e) => updateSkill('description', e.currentTarget.value)}
        rows="2"
      ></textarea>
    </label>

    <div class="inline-fields">
      <label>
        Max Rank:
        <input 
          type="number" 
          min="1" 
          max="20"
          value={skill.maxRank}
          oninput={(e) => updateSkill('maxRank', parseInt(e.currentTarget.value))}
        />
      </label>

      <label class="checkbox-label">
        <input 
          type="checkbox" 
          checked={skill.isCombatSkill}
          onchange={(e) => updateSkill('isCombatSkill', e.currentTarget.checked)}
        />
        Combat Skill (Enhanceable)
      </label>
    </div>
  </div>

  <div class="effects-section">
    <div class="section-header">
      <h4>Effects</h4>
      <button onclick={addEffect} class="btn-add">Add Effect</button>
    </div>

    {#each skill.effects as effect, index}
      <div class="effect-item">
        <div class="effect-header">
          <input 
            type="text" 
            value={effect.name}
            oninput={(e) => updateEffect(index, 'name', e.currentTarget.value)}
            placeholder="Effect name"
            class="effect-name"
          />
          <button onclick={() => removeEffect(index)} class="btn-remove">×</button>
        </div>

        <div class="effect-fields">
          <label>
            Type:
            <select value={effect.type} onchange={(e) => updateEffect(index, 'type', e.currentTarget.value)}>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
              <option value="binary">Binary</option>
              <option value="chance">Chance</option>
            </select>
          </label>

          <label>
            Unit:
            <input 
              type="text" 
              value={effect.unit}
              oninput={(e) => updateEffect(index, 'unit', e.currentTarget.value)}
              placeholder="%, points, etc."
            />
          </label>

          <label>
            Progression Type:
            <select 
              value={effect.progressionType} 
              onchange={(e) => updateEffectProgressionType(index, e.currentTarget.value as ProgressionType)}
            >
              <option value="curve">Smooth Curve</option>
              <option value="per-rank">Per-Rank Deltas</option>
            </select>
          </label>
        </div>

        <label class="description-field">
          Description:
          <input 
            type="text" 
            value={effect.description}
            oninput={(e) => updateEffect(index, 'description', e.currentTarget.value)}
            placeholder="Effect description"
          />
        </label>

        <!-- Curve-based progression fields -->
        {#if effect.progressionType === 'curve'}
          <div class="progression-fields curve-fields">
            <label>
              Base Value:
              <input 
                type="number" 
                step="0.1"
                value={effect.baseValue}
                oninput={(e) => updateEffect(index, 'baseValue', parseFloat(e.currentTarget.value))}
              />
            </label>

            <label>
              Target Value:
              <input 
                type="number" 
                step="0.1"
                value={effect.targetValue}
                oninput={(e) => updateEffect(index, 'targetValue', parseFloat(e.currentTarget.value))}
              />
            </label>

            <label>
              Target Rank:
              <input 
                type="number" 
                min="1" 
                max={skill.maxRank}
                value={effect.targetRank}
                oninput={(e) => updateEffect(index, 'targetRank', parseInt(e.currentTarget.value))}
              />
            </label>

            <button onclick={() => generateRankDeltasFromCurve(index)} class="btn-convert">
              Convert to Per-Rank
            </button>
          </div>
        {/if}

        <!-- Per-rank progression fields -->
        {#if effect.progressionType === 'per-rank'}
          <div class="progression-fields per-rank-fields">
            <div class="per-rank-header">
              <label>
                Base Value:
                <input 
                  type="number" 
                  step="0.1"
                  value={effect.baseValue}
                  oninput={(e) => updateEffect(index, 'baseValue', parseFloat(e.currentTarget.value))}
                />
              </label>
              <button onclick={() => addRankDelta(index)} class="btn-add-delta">Add Rank Delta</button>
            </div>

            <div class="rank-deltas">
              {#each effect.rankDeltas as delta, deltaIndex}
                <div class="delta-item">
                  <div class="delta-header">
                    <span class="delta-label">Rank {delta.fromRank} → {delta.toRank}</span>
                    <button onclick={() => removeRankDelta(index, deltaIndex)} class="btn-remove-small">×</button>
                  </div>
                  
                  <div class="delta-fields">
                    <label>
                      From Rank:
                      <input 
                        type="number" 
                        min="0" 
                        max={skill.maxRank - 1}
                        value={delta.fromRank}
                        oninput={(e) => updateRankDelta(index, deltaIndex, 'fromRank', parseInt(e.currentTarget.value))}
                      />
                    </label>
                    
                    <label>
                      To Rank:
                      <input 
                        type="number" 
                        min="1" 
                        max={skill.maxRank}
                        value={delta.toRank}
                        oninput={(e) => updateRankDelta(index, deltaIndex, 'toRank', parseInt(e.currentTarget.value))}
                      />
                    </label>
                    
                    <label>
                      Delta Value:
                      <input 
                        type="number" 
                        step="0.1"
                        value={delta.deltaValue}
                        oninput={(e) => updateRankDelta(index, deltaIndex, 'deltaValue', parseFloat(e.currentTarget.value))}
                      />
                    </label>
                    
                    <label>
                      Delta Type:
                      <select 
                        value={delta.deltaType} 
                        onchange={(e) => updateRankDelta(index, deltaIndex, 'deltaType', e.currentTarget.value as DeltaType)}
                      >
                        <option value="flat">Flat (+X)</option>
                        <option value="percentage">Percentage (+X%)</option>
                      </select>
                    </label>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="binary-effects-section">
    <div class="section-header">
      <h4>Binary Effects (Unlocked at Ranks)</h4>
      <button onclick={addBinaryEffect} class="btn-add">Add Binary Effect</button>
    </div>

    {#each skill.binaryEffects as binary, index}
      <div class="binary-item">
        <div class="binary-header">
          <input 
            type="text" 
            value={binary.name}
            oninput={(e) => updateBinaryEffect(index, 'name', e.currentTarget.value)}
            placeholder="Binary effect name"
            class="binary-name"
          />
          <button onclick={() => removeBinaryEffect(index)} class="btn-remove">×</button>
        </div>

        <div class="binary-fields">
          <label>
            Unlock Rank:
            <input 
              type="number" 
              min="1" 
              max={skill.maxRank}
              value={binary.unlockRank}
              oninput={(e) => updateBinaryEffect(index, 'unlockRank', parseInt(e.currentTarget.value))}
            />
          </label>

          <label>
            Chance % (optional):
            <input 
              type="number" 
              min="0" 
              max="100"
              value={binary.chancePercentage || ''}
              oninput={(e) => updateBinaryEffect(index, 'chancePercentage', e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined)}
              placeholder="Leave empty if no chance"
            />
          </label>
        </div>

        <label class="description-field">
          Description:
          <textarea 
            value={binary.description}
            oninput={(e) => updateBinaryEffect(index, 'description', e.currentTarget.value)}
            placeholder="Binary effect description"
            rows="2"
          ></textarea>
        </label>
      </div>
    {/each}
  </div>
</div>

<style>
  .skill-editor {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .skill-header h3 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  .basic-info {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .basic-info label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .inline-fields {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: end;
  }

  .checkbox-label {
    flex-direction: row !important;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-label input[type="checkbox"] {
    width: auto;
  }

  .basic-info input, .basic-info textarea {
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .basic-info input:focus, .basic-info textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .effects-section, .binary-effects-section {
    margin-bottom: 1rem;
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

  .btn-add, .btn-add-delta, .btn-convert {
    background: #28a745;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-convert {
    background: #6f42c1;
  }

  .btn-add:hover, .btn-add-delta:hover {
    background: #218838;
  }

  .btn-convert:hover {
    background: #5a3088;
  }

  .effect-item, .binary-item {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .effect-header, .binary-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .effect-name, .binary-name {
    flex: 1;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .btn-remove, .btn-remove-small {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .btn-remove-small {
    width: 20px;
    height: 20px;
    font-size: 0.875rem;
  }

  .btn-remove:hover, .btn-remove-small:hover {
    background: #c82333;
  }

  .effect-fields, .binary-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .effect-fields label, .binary-fields label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .description-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .effect-fields input, .effect-fields select,
  .binary-fields input,
  .description-field input, .description-field textarea {
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .effect-fields input:focus, .effect-fields select:focus,
  .binary-fields input:focus,
  .description-field input:focus, .description-field textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  /* Progression type specific styles */
  .progression-fields {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .curve-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    align-items: end;
  }

  .per-rank-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .per-rank-header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
  }

  .rank-deltas {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .delta-item {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.75rem;
  }

  .delta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .delta-label {
    font-weight: 600;
    color: #495057;
    font-size: 0.875rem;
  }

  .delta-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .delta-fields label {
    font-size: 0.8rem;
  }

  .delta-fields input, .delta-fields select {
    padding: 0.25rem;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    .inline-fields {
      grid-template-columns: 1fr;
    }

    .effect-fields, .binary-fields {
      grid-template-columns: 1fr;
    }

    .curve-fields {
      grid-template-columns: 1fr;
    }

    .per-rank-header {
      flex-direction: column;
      align-items: stretch;
    }

    .delta-fields {
      grid-template-columns: 1fr;
    }
  }
</style>