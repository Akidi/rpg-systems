<!-- $lib/components/SkillPlanner/ProgressionTable.svelte -->
<script lang="ts">
  import type { Skill, ProgressionStep } from '$lib/types/skill-planner';
  import { SkillCalculator } from '$lib/utils/skill-calculator';

  type Props = {
    skill: Skill
    calculator: SkillCalculator
  }

  let { skill = $bindable(), calculator }: Props = $props();
  
  let progression = $derived.by(() => calculator.generateProgression(skill));
  
  function formatValue(effectId: string, value: number, unit: string): string {
    const effect = skill.effects.find(e => e.id === effectId);
    if (!effect) return `${value}${unit}`;
    
    if (effect.type === 'percentage' || effect.type === 'chance') {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${Math.round(value)}${unit}`;
  }

  function formatIncrement(effectId: string, increment: number, unit: string, isRankComplete: boolean, totalValue: number): string {
    if (increment === 0) return '-';
    
    const effect = skill.effects.find(e => e.id === effectId);
    if (!effect) return `+${increment}${unit}`;
    
    const sign = increment > 0 ? '+' : '';
    let incrementText = '';
    
    if (effect.type === 'percentage' || effect.type === 'chance') {
      incrementText = `${sign}${increment.toFixed(1)}${unit}`;
    } else {
      incrementText = `${sign}${Math.round(increment)}${unit}`;
    }
    
    // Add cumulative total for rank completions
    if (isRankComplete && increment !== 0) {
      const totalText = effect.type === 'percentage' || effect.type === 'chance' 
        ? `${totalValue.toFixed(1)}${unit}` 
        : `${Math.round(totalValue)}${unit}`;
      incrementText += ` (Total: ${totalText})`;
    }
    
    return incrementText;
  }

  function getRankClass(step: ProgressionStep): string {
    if (step.pointsInCurrentRank === 0) return 'rank-complete';
    return 'rank-partial';
  }

  function getBinaryEffectsText(step: ProgressionStep): string {
    if (step.unlockedBinaries.length === 0) return '-';
    return step.unlockedBinaries.map(b => b.name).join(', ');
  }

  function isNewBinaryUnlocked(step: ProgressionStep, prevStep: ProgressionStep | null): boolean {
    if (!prevStep) return step.unlockedBinaries.length > 0;
    return step.unlockedBinaries.length > prevStep.unlockedBinaries.length;
  }
</script>

<div class="progression-table">
  <h4>Complete Progression Table</h4>
  
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Points</th>
          <th>Rank</th>
          <th>Progress</th>
          {#each skill.effects as effect}
            <th>
              {effect.name}
              <span class="unit">({effect.unit})</span>
            </th>
          {/each}
          {#if skill.binaryEffects.length > 0}
            <th>Unlocked Abilities</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each progression as step, index}
          {@const prevStep = index > 0 ? progression[index - 1] : null}
          <tr 
            class={getRankClass(step)} 
            class:new-binary={isNewBinaryUnlocked(step, prevStep)}
            class:tier-boundary={step.pointsInCurrentRank === 0 && step.rank > 0}
          >
            <td class="points-cell">{step.pointsSpent}</td>
            <td class="rank-cell">
              {#if step.pointsInCurrentRank === 0}
                <strong>{step.rank}</strong>
              {:else}
                <span class="rank-partial-text">
                  {step.rank} + {step.pointsInCurrentRank}/{step.totalPointsForRank}
                </span>
              {/if}
            </td>
            <td class="progress-cell">
              {#if step.totalPointsForRank > 0}
                <div class="mini-progress">
                  <div 
                    class="mini-progress-fill" 
                    style="width: {(step.pointsInCurrentRank / step.totalPointsForRank) * 100}%"
                  ></div>
                </div>
                <span class="progress-percent">
                  {((step.pointsInCurrentRank / step.totalPointsForRank) * 100).toFixed(0)}%
                </span>
              {:else}
                <span class="complete-mark">✓</span>
              {/if}
            </td>
            
            {#each skill.effects as effect}
              <td class="effect-cell">
                <div class="effect-value">
                  {formatValue(effect.id, step.effects[effect.id] || 0, effect.unit)}
                </div>
                {#if step.incrementFromPrevious[effect.id] !== 0}
                  {@const isRankComplete = step.pointsInCurrentRank === 0 && step.rank > 0}
                  <div class="effect-increment" class:positive={step.incrementFromPrevious[effect.id] > 0}>
                    {formatIncrement(effect.id, step.incrementFromPrevious[effect.id] || 0, effect.unit, isRankComplete, step.effects[effect.id] || 0)}
                  </div>
                {/if}
              </td>
            {/each}
            
            {#if skill.binaryEffects.length > 0}
              <td class="binary-cell" class:has-new-binary={isNewBinaryUnlocked(step, prevStep)}>
                {getBinaryEffectsText(step)}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .progression-table {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .progression-table h4 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  thead {
    background: #f8f9fa;
  }

  th {
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    position: sticky;
    top: 0;
    background: #f8f9fa;
    z-index: 10;
  }

  .unit {
    font-weight: 400;
    color: #6c757d;
    font-size: 0.8rem;
  }

  tbody tr {
    border-bottom: 1px solid #dee2e6;
    transition: background-color 0.2s ease;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  .rank-complete {
    background-color: #e8f5e8 !important;
  }

  .rank-complete:hover {
    background-color: #d4edda !important;
  }

  .tier-boundary {
    border-top: 2px solid #007bff;
  }

  .new-binary {
    background-color: #fff3cd !important;
  }

  .new-binary:hover {
    background-color: #ffeaa7 !important;
  }

  td {
    padding: 0.75rem 0.5rem;
    vertical-align: middle;
  }

  .points-cell {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #495057;
    text-align: center;
    min-width: 60px;
  }

  .rank-cell {
    min-width: 80px;
    text-align: center;
  }

  .rank-partial-text {
    color: #6c757d;
    font-size: 0.8rem;
  }

  .progress-cell {
    min-width: 100px;
    text-align: center;
  }

  .mini-progress {
    width: 60px;
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto 0.25rem;
  }

  .mini-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #28a745);
    transition: width 0.3s ease;
  }

  .progress-percent {
    font-size: 0.75rem;
    color: #6c757d;
  }

  .complete-mark {
    color: #28a745;
    font-weight: bold;
    font-size: 1rem;
  }

  .effect-cell {
    text-align: center;
    min-width: 100px;
  }

  .effect-value {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #007bff;
  }

  .effect-increment {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.2rem;
  }

  .effect-increment.positive {
    color: #28a745;
  }

  .binary-cell {
    max-width: 200px;
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .has-new-binary {
    font-weight: 600;
    color: #856404;
  }

  @media (max-width: 768px) {
    .table-container {
      font-size: 0.8rem;
    }
    
    th, td {
      padding: 0.5rem 0.25rem;
    }
    
    .unit {
      display: block;
      font-size: 0.7rem;
    }
  }
</style>