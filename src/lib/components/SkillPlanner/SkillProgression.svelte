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
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 20px;
    padding: 0;
    margin-bottom: 1.5rem;
    transition: var(--transition-theme);
    box-shadow: 
      0 4px 20px var(--shadow-light),
      inset 0 1px 0 rgba(255,255,255,0.1);
    position: relative;
    overflow: hidden;
  }

  /* Hero header section */
  .progression-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%);
    padding: 2rem 2rem 1.5rem 2rem;
    color: var(--text-inverse);
    position: relative;
    overflow: hidden;
  }

  .progression-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255,255,255,0.05) 10px,
      rgba(255,255,255,0.05) 20px
    );
    animation: headerPattern 20s linear infinite;
  }

  @keyframes headerPattern {
    0% { transform: translateX(-50px); }
    100% { transform: translateX(50px); }
  }

  .skill-info {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
  }

  .skill-name {
    margin: 0 0 0.75rem 0;
    font-size: 2rem;
    font-weight: 900;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .skill-name.combat {
    color: var(--text-inverse);
  }

  .skill-name.utility {
    color: var(--text-inverse);
  }

  .skill-tag {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
  }

  .skill-description {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    opacity: 0.95;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    max-width: 600px;
  }

  .points-control {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    padding: 1.5rem;
    min-width: 240px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }

  .points-control label {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .points-control input {
    width: 100%;
    padding: 1rem;
    background: rgba(255,255,255,0.9);
    color: var(--text-primary);
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 12px;
    font-size: 2rem;
    font-weight: 900;
    text-align: center;
    transition: var(--transition-theme);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .points-control input:focus {
    outline: none;
    border-color: rgba(255,255,255,0.8);
    box-shadow: 
      inset 0 2px 4px rgba(0,0,0,0.1),
      0 0 0 4px rgba(255,255,255,0.3);
    transform: scale(1.02);
  }

  .points-info {
    margin-top: 0.75rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .points-info span {
    opacity: 0.9;
  }

  /* Main content area */
  .skill-content {
    padding: 2rem;
  }

  .current-status {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 16px var(--shadow-light);
    position: relative;
  }

  .current-status::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    border-radius: 16px 16px 0 0;
  }

  .rank-progress {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .progress-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-label {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progress-bar {
    height: 20px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-secondary);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px var(--shadow-light);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, 
      var(--color-primary) 0%,
      var(--color-secondary) 50%,
      var(--color-success) 100%);
    border-radius: 10px;
    position: relative;
    transition: width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 0 20px rgba(var(--color-primary), 0.3);
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg,
      transparent 30%,
      rgba(255,255,255,0.4) 50%,
      transparent 70%);
    background-size: 40px 40px;
    animation: progressShimmer 3s linear infinite;
  }

  @keyframes progressShimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  .progress-text {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    border: 2px solid var(--border-primary);
    box-shadow: 0 4px 12px var(--shadow-light);
    text-align: center;
    min-width: 120px;
  }

  /* Effects section */
  .effects-display, .binary-effects-display {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 1.5rem 0;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: var(--text-inverse);
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 6px 20px var(--shadow-medium);
    position: relative;
    overflow: hidden;
  }

  .section-title::before {
    content: '';
    position: absolute;
    top: 0;
    right: -20px;
    width: 40px;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: titleShine 4s linear infinite;
  }

  @keyframes titleShine {
    0% { transform: translateX(-60px); }
    100% { transform: translateX(300px); }
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .effect-card {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    border-radius: 16px;
    padding: 0;
    transition: var(--transition-theme);
    box-shadow: 
      0 4px 16px var(--shadow-light),
      inset 0 1px 0 rgba(255,255,255,0.1);
    overflow: hidden;
    position: relative;
  }

  .effect-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px var(--shadow-heavy);
  }

  .effect-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    padding: 1.25rem;
    color: var(--text-inverse);
    position: relative;
  }

  .effect-name {
    font-weight: 800;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
  }

  .effect-content {
    padding: 1.5rem;
  }

  .effect-value-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .effect-value {
    font-family: 'Courier New', monospace;
    font-size: 2.5rem;
    font-weight: 900;
    color: var(--color-primary);
    text-shadow: 0 2px 4px var(--shadow-light);
  }

  .increment {
    font-size: 1rem;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: 2px solid;
  }

  .increment.positive {
    color: var(--color-success);
    border-color: var(--color-success);
    background: rgba(var(--color-success), 0.1);
  }

  .increment.negative {
    color: var(--color-error);
    border-color: var(--color-error);
    background: rgba(var(--color-error), 0.1);
  }

  .effect-description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
    border-left: 4px solid var(--color-primary);
  }

  /* Binary effects */
  .binary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 1.5rem;
  }

  .binary-card {
    border-radius: 16px;
    padding: 0;
    transition: var(--transition-theme);
    box-shadow: 0 4px 16px var(--shadow-light);
    overflow: hidden;
    position: relative;
    border: 2px solid;
  }

  .binary-card.unlocked {
    border-color: var(--color-success);
    background: linear-gradient(135deg, 
      rgba(var(--color-success), 0.1) 0%,
      var(--bg-secondary) 50%);
  }

  .binary-card.unlocked:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 8px 32px rgba(var(--color-success), 0.3);
  }

  .binary-card.locked {
    border-color: var(--border-secondary);
    background: var(--bg-tertiary);
    opacity: 0.6;
  }

  .binary-header {
    padding: 1.5rem 1.5rem 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .binary-name {
    font-weight: 800;
    color: var(--text-primary);
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .unlock-rank {
    font-size: 0.8rem;
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
    color: var(--text-inverse);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px var(--shadow-medium);
    white-space: nowrap;
  }

  .binary-content {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .binary-description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 8px;
    border-left: 4px solid var(--color-primary);
  }

  .chance-info {
    color: var(--color-accent);
    font-weight: 700;
  }

  .unlock-status {
    text-align: right;
  }

  .unlocked-text {
    color: var(--color-success);
    font-weight: 800;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.5rem 1.5rem;
    background: rgba(var(--color-success), 0.1);
    border-radius: 20px;
    border: 2px solid var(--color-success);
    display: inline-block;
  }

  .locked-text {
    color: var(--text-muted);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.5rem 1.5rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 1px solid var(--border-secondary);
    display: inline-block;
  }

  /* Slider section */
  .point-slider {
    margin-top: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
    border-radius: 16px;
    border: 2px solid var(--border-primary);
    box-shadow: 0 4px 16px var(--shadow-light);
    position: relative;
  }

  .point-slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    border-radius: 16px 16px 0 0;
  }

  .point-slider label {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .slider {
    width: 100%;
    height: 16px;
    border-radius: 10px;
    background: var(--bg-tertiary);
    outline: none;
    appearance: none;
    border: 2px solid var(--border-primary);
    cursor: pointer;
    box-shadow: inset 0 2px 4px var(--shadow-light);
    margin-bottom: 1rem;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    cursor: pointer;
    box-shadow: 
      0 6px 20px var(--shadow-heavy),
      inset 0 2px 0 rgba(255,255,255,0.3);
    border: 4px solid var(--text-inverse);
    transition: var(--transition-theme);
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.3);
    box-shadow: 
      0 8px 30px var(--shadow-heavy),
      inset 0 2px 0 rgba(255,255,255,0.3),
      0 0 0 6px rgba(var(--color-primary), 0.2);
  }

  .slider::-moz-range-thumb {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    cursor: pointer;
    border: 4px solid var(--text-inverse);
    box-shadow: 0 6px 20px var(--shadow-heavy);
  }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 700;
  }

  .slider-marks span {
    background: var(--bg-secondary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: 2px solid var(--border-primary);
    box-shadow: 0 2px 8px var(--shadow-light);
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .skill-info {
      flex-direction: column;
      gap: 1.5rem;
    }

    .points-control {
      min-width: unset;
      align-self: stretch;
    }
  }

  @media (max-width: 768px) {
    .progression-header {
      padding: 1.5rem;
    }

    .skill-name {
      font-size: 1.5rem;
    }

    .skill-content {
      padding: 1.5rem;
    }

    .effects-grid, .binary-grid {
      grid-template-columns: 1fr;
    }

    .rank-progress {
      flex-direction: column;
      gap: 1rem;
    }

    .progress-text {
      font-size: 1rem;
      min-width: unset;
    }

    .effect-value {
      font-size: 2rem;
    }
  }
</style>