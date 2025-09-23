<!-- $lib/components/SkillPlanner/SkillProgression.svelte -->
<script lang="ts">
  import type { Skill, ProgressionStep } from '$lib/types/skill-planner';
  import { SkillCalculator } from '$lib/utils/skill-calculator';
  
  type Props = {
    skill: Skill
    calculator: SkillCalculator
    currentPoints: number
  }

  let { skill = $bindable(), calculator, currentPoints = $bindable()}: Props = $props();

  let progression = $derived(calculator.generateProgression(skill));
  let currentStep = $derived(progression[Math.min(currentPoints, progression.length - 1)]);
  let maxPoints = $state(calculator.calculatePointsToRank(skill.maxRank));

  function setPoints(points: number) {
    currentPoints = Math.max(0, Math.min(points, maxPoints));
    skill.currentPoints = currentPoints;
  }

  function getRankDisplay(step: ProgressionStep): string {
    if (step.pointsInCurrentRank === 0) {
      return `Rank ${step.rank}`;
    }
    return `Rank ${step.rank} + ${step.pointsInCurrentRank}/${step.totalPointsForRank}`;
  }

  function getProgressPercentage(step: ProgressionStep): number {
    if (step.totalPointsForRank === 0) return 100;
    return (step.pointsInCurrentRank / step.totalPointsForRank) * 100;
  }

  function formatEffectValue(effectId: string, value: number, unit: string): string {
    const effect = skill.effects.find(e => e.id === effectId);
    if (!effect) return `${value}${unit}`;
    
    if (effect.type === 'percentage' || effect.type === 'chance') {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${Math.round(value)}${unit}`;
  }

  function isIncreasePositive(increment: number): boolean {
    return increment > 0;
  }
</script>

<div class="skill-progression">
  <div class="progression-header">
    <div class="skill-info">
      <h3 class="skill-name" class:combat={skill.isCombatSkill} class:utility={!skill.isCombatSkill}>
        {skill.name}
        {#if skill.isCombatSkill}
          <span class="skill-tag combat-tag">Combat</span>
        {:else}
          <span class="skill-tag utility-tag">Utility</span>
        {/if}
      </h3>
      <p class="skill-description">{skill.description}</p>
    </div>
    
    <div class="points-control">
      <label>
        Points Invested:
        <input 
          type="number" 
          min="0" 
          max={maxPoints}
          value={currentPoints}
          oninput={(e) => setPoints(parseInt(e.currentTarget.value) || 0)}
        />
      </label>
      <div class="points-info">
        <span>Max: {maxPoints} points</span>
        <span>{getRankDisplay(currentStep)}</span>
      </div>
    </div>
  </div>

  <div class="current-status">
    <div class="rank-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          style="width: {getProgressPercentage(currentStep)}%"
        ></div>
      </div>
      <span class="progress-text">
        {currentStep.pointsInCurrentRank}/{currentStep.totalPointsForRank} 
        ({getProgressPercentage(currentStep).toFixed(1)}%)
      </span>
    </div>
  </div>

  <div class="effects-display">
    <h4>Current Effects</h4>
    <div class="effects-grid">
      {#each skill.effects as effect}
        {@const currentValue = currentStep.effects[effect.id] || effect.baseValue}
        {@const increment = currentStep.incrementFromPrevious[effect.id] || 0}
        
        <div class="effect-card">
          <div class="effect-header">
            <span class="effect-name">{effect.name}</span>
            <span class="effect-value">
              {formatEffectValue(effect.id, currentValue, effect.unit)}
              {#if increment !== 0}
                <span class="increment" class:positive={isIncreasePositive(increment)} class:negative={!isIncreasePositive(increment)}>
                  ({increment > 0 ? '+' : ''}{formatEffectValue(effect.id, increment, effect.unit)})
                </span>
              {/if}
            </span>
          </div>
          <div class="effect-description">{effect.description}</div>
        </div>
      {/each}
    </div>
  </div>

  {#if skill.binaryEffects.length > 0}
    <div class="binary-effects-display">
      <h4>Special Abilities</h4>
      <div class="binary-grid">
        {#each skill.binaryEffects as binary}
          {@const isUnlocked = currentStep.unlockedBinaries.some(b => b.id === binary.id)}
          
          <div class="binary-card" class:unlocked={isUnlocked} class:locked={!isUnlocked}>
            <div class="binary-header">
              <span class="binary-name">{binary.name}</span>
              <span class="unlock-rank">Rank {binary.unlockRank}</span>
            </div>
            <div class="binary-description">
              {binary.description}
              {#if binary.chancePercentage}
                <span class="chance-info">({binary.chancePercentage}% chance)</span>
              {/if}
            </div>
            <div class="unlock-status">
              {#if isUnlocked}
                <span class="unlocked-text">✓ Unlocked</span>
              {:else}
                <span class="locked-text">Locked</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="point-slider">
    <label>
      Point Investment Slider:
      <input 
        type="range" 
        min="0" 
        max={maxPoints}
        value={currentPoints}
        oninput={(e) => setPoints(parseInt(e.currentTarget.value))}
        class="slider"
      />
    </label>
    <div class="slider-marks">
      <span>0</span>
      <span>{maxPoints}</span>
    </div>
  </div>
</div>

<style>
  .skill-progression {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .progression-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .skill-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .skill-name.combat {
    color: #dc3545;
  }

  .skill-name.utility {
    color: #6f42c1;
  }

  .skill-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
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

  .skill-description {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .points-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
  }

  .points-control label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .points-control input {
    padding: 0.375rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .points-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #6c757d;
  }

  .current-status {
    margin-bottom: 1.5rem;
  }

  .rank-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #28a745);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #495057;
    white-space: nowrap;
  }

  .effects-display, .binary-effects-display {
    margin-bottom: 1.5rem;
  }

  .effects-display h4, .binary-effects-display h4 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1rem;
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.75rem;
  }

  .effect-card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 0.75rem;
  }

  .effect-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .effect-name {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
  }

  .effect-value {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #007bff;
    font-weight: bold;
  }

  .increment {
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .increment.positive {
    color: #28a745;
  }

  .increment.negative {
    color: #dc3545;
  }

  .effect-description {
    font-size: 0.8rem;
    color: #6c757d;
    line-height: 1.3;
  }

  .binary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 0.75rem;
  }

  .binary-card {
    border-radius: 6px;
    padding: 0.75rem;
    transition: all 0.2s ease;
  }

  .binary-card.unlocked {
    background: #d4edda;
    border: 1px solid #c3e6cb;
  }

  .binary-card.locked {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    opacity: 0.7;
  }

  .binary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .binary-name {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
  }

  .unlock-rank {
    font-size: 0.8rem;
    background: #6c757d;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
  }

  .binary-description {
    font-size: 0.8rem;
    color: #495057;
    line-height: 1.3;
    margin-bottom: 0.5rem;
  }

  .chance-info {
    color: #007bff;
    font-weight: 500;
  }

  .unlock-status {
    text-align: right;
  }

  .unlocked-text {
    color: #155724;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .locked-text {
    color: #6c757d;
    font-size: 0.8rem;
  }

  .point-slider {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }

  .point-slider label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #dee2e6;
    outline: none;
    appearance: none;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: none;
  }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
</style>