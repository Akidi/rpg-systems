import type { 
  Character, 
  ActionDefinition, 
  SelectedEnhancements
} from './types';

// Integration interface for the battle system
export interface AICharacter extends Character {
  ai?: CombatAI;
}

export type AIPersonality = {
  aggressiveness: number;     // 0-1, affects attack vs defense preference
  intelligence: number;       // 0-1, affects mistake frequency
  recklessness: number;       // 0-1, affects resource management
  cowardice: number;          // 0-1, affects panic thresholds
  cooperativeness: number;    // 0-1, affects team coordination
};

export type AIConfig = {
  personality: AIPersonality;
  difficultyModifier: number; // Global scaling for all decisions
  randomnessFactor: number;   // How much chaos to inject
};

export type AIDecision = {
  actionId: string;
  enhancements: SelectedEnhancements;
  targetIndex?: number; // Index in the enemy array
  confidence: number; // 0-1, how sure the AI is about this choice
};

type ActionOption = {
  action: ActionDefinition;
  utility: number;
  canAfford: boolean;
  targetIndex?: number;
};

export class CombatAI {
  private config: AIConfig;
  
  constructor(config: AIConfig) {
    this.config = config;
  }

  // Main decision entry point
  decideAction(
    self: Character,
    allies: Character[],
    enemies: Character[],
    availableActions: ActionDefinition[],
    gameContext: { turnCount: number; globalActionCount: number }
  ): AIDecision {
    // Apply goblin attention span issues
    if (this.shouldGetDistracted()) {
      return this.makeRandomDecision(availableActions, enemies);
    }

    // Evaluate all possible actions
    const actionOptions = this.evaluateActions(self, allies, enemies, availableActions, gameContext);
    
    // Apply personality and intelligence filters
    const decision = this.selectBestAction(actionOptions);
    
    // Choose enhancements for the selected action
    const enhancements = this.chooseEnhancements(
      availableActions.find(a => a.id === decision.actionId)!,
      self,
      enemies
    );

    return {
      ...decision,
      enhancements
    };
  }

  private shouldGetDistracted(): boolean {
    const distractionChance = (1 - this.config.personality.intelligence) * 0.1;
    return Math.random() < distractionChance * this.config.randomnessFactor;
  }

  private makeRandomDecision(actions: ActionDefinition[], enemies: Character[]): AIDecision {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const aliveEnemies = enemies.filter(e => e.hp > 0);
    const targetIndex = aliveEnemies.length > 0 ? 
      enemies.indexOf(aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]) : 0;

    return {
      actionId: randomAction.id,
      enhancements: {},
      targetIndex,
      confidence: 0.1
    };
  }

  private evaluateActions(
    self: Character,
    allies: Character[],
    enemies: Character[],
    actions: ActionDefinition[],
    gameContext: { turnCount: number; globalActionCount: number }
  ): ActionOption[] {
    const options: ActionOption[] = [];
    const aliveEnemies = enemies.filter(e => e.hp > 0);

    for (const action of actions) {
      const canAfford = this.canAffordAction(self, action);
      let utility = this.calculateBaseUtility(action, self, allies, aliveEnemies, gameContext);

      // Apply personality modifiers
      utility = this.applyPersonalityToUtility(utility, action);

      if (action.type === 'damage' && aliveEnemies.length > 0) {
        // Evaluate against each possible target
        aliveEnemies.forEach((enemy) => {
          const targetIndex = enemies.indexOf(enemy);
          const targetUtility = this.evaluateTarget(enemy, utility);
          
          options.push({
            action,
            utility: targetUtility,
            canAfford,
            targetIndex
          });
        });
      } else {
        options.push({
          action,
          utility,
          canAfford
        });
      }
    }

    return options.filter(opt => opt.canAfford);
  }

  private canAffordAction(self: Character, action: ActionDefinition): boolean {
    let cost = action.apCost;
    
    // Special handling for focus action
    if (action.id === 'focus') {
      if (self.focus >= self.maxFocus) return false;
      cost = self.focus + 1;
    }

    return self.ap >= cost;
  }

  private calculateBaseUtility(
    action: ActionDefinition,
    self: Character,
    allies: Character[],
    enemies: Character[],
    gameContext: { turnCount: number; globalActionCount: number }
  ): number {
    switch (action.type) {
      case 'damage':
        return this.calculateDamageUtility(action, self, enemies);
      
      case 'healing':
        return this.calculateHealUtility(self);
      
      case 'focus':
        return this.calculateFocusUtility(self, gameContext);
      
      case 'defend':
        return this.calculateDefendUtility(self, enemies);
      
      default:
        return 0.1;
    }
  }

  private calculateDamageUtility(action: ActionDefinition, self: Character, enemies: Character[]): number {
    const baseDamage = self.baseDamage;
    const focusMultiplier = 1 + self.focus * 0.25;
    const expectedDamage = baseDamage * focusMultiplier;
    
    // Higher utility if we can finish someone off
    const lowHealthEnemies = enemies.filter(e => e.hp <= expectedDamage && e.hp > 0);
    const finishBonus = lowHealthEnemies.length * 0.4;
    
    // Multi-target bonus if multiple enemies alive
    const multiTargetBonus = enemies.length > 1 ? 0.2 : 0;
    
    return 0.6 + finishBonus + multiTargetBonus;
  }

  private calculateHealUtility(self: Character): number {
    const healthPercent = self.hp / self.maxHp;
    
    // Panic threshold based on cowardice
    const panicThreshold = 0.15 + (this.config.personality.cowardice * 0.25);
    
    if (healthPercent < panicThreshold) {
      return 0.9; // High priority when panicking
    }
    
    if (healthPercent < 0.5) {
      return 0.4; // Moderate priority when injured
    }
    
    return 0.1; // Low priority when healthy
  }

  private calculateFocusUtility(
    self: Character, 
    gameContext: { turnCount: number; globalActionCount: number }
  ): number {
    if (self.focus >= self.maxFocus) return 0;
    
    // Early game focus building is more valuable
    const earlyGameBonus = gameContext.turnCount <= 3 ? 0.2 : 0;
    
    // Low AP makes focus more attractive
    const lowApBonus = self.ap <= 3 ? 0.2 : 0;
    
    // Base utility increases with current focus (stacking value)
    const stackingValue = self.focus * 0.1;
    
    return 0.3 + earlyGameBonus + lowApBonus + stackingValue;
  }

  private calculateDefendUtility(self: Character, enemies: Character[]): number {
    const healthPercent = self.hp / self.maxHp;
    const aliveEnemies = enemies.filter(e => e.hp > 0).length;
    
    // More valuable when low health and facing multiple enemies
    const healthFactor = (1 - healthPercent) * 0.4;
    const threatFactor = Math.min(aliveEnemies * 0.1, 0.3);
    
    return 0.2 + healthFactor + threatFactor;
  }

  private evaluateTarget(enemy: Character, baseUtility: number): number {
    const healthPercent = enemy.hp / enemy.maxHp;
    
    // Prefer low-health targets (finish them off)
    const finishBonus = healthPercent < 0.3 ? 0.3 : 0;
    
    // Slight preference for higher-health targets if no one is low
    const healthyTargetBonus = healthPercent > 0.7 && finishBonus === 0 ? 0.1 : 0;
    
    return baseUtility + finishBonus + healthyTargetBonus;
  }

  private applyPersonalityToUtility(
    utility: number, 
    action: ActionDefinition
  ): number {
    const personality = this.config.personality;
    
    switch (action.type) {
      case 'damage':
        utility *= (0.7 + personality.aggressiveness * 0.6);
        break;
        
      case 'healing':
      case 'defend':
        utility *= (0.7 + personality.cowardice * 0.6);
        break;
        
      case 'focus':
        // Less intelligent goblins don't value setup as much
        utility *= (0.5 + personality.intelligence * 0.8);
        break;
    }

    // Reckless goblins prefer high-cost, high-impact actions
    if (action.apCost >= 3) {
      utility *= (0.8 + personality.recklessness * 0.4);
    }

    return utility;
  }

  private selectBestAction(options: ActionOption[]): Omit<AIDecision, 'enhancements'> {
    if (options.length === 0) {
      // Fallback to basic attack if somehow no options
      return {
        actionId: 'attack',
        confidence: 0.1,
        targetIndex: 0
      };
    }

    // Sort by utility, but add some randomness based on intelligence
    const intelligenceFactor = this.config.personality.intelligence;
    const randomFactor = this.config.randomnessFactor;
    
    // Lower intelligence = more likely to pick suboptimal choices
    const sortedOptions = options.sort((a, b) => {
      const aScore = a.utility + (Math.random() - 0.5) * (1 - intelligenceFactor) * randomFactor;
      const bScore = b.utility + (Math.random() - 0.5) * (1 - intelligenceFactor) * randomFactor;
      return bScore - aScore;
    });

    const bestOption = sortedOptions[0];
    
    return {
      actionId: bestOption.action.id,
      confidence: Math.min(bestOption.utility, 0.9),
      targetIndex: bestOption.targetIndex
    };
  }

  private chooseEnhancements(
    action: ActionDefinition,
    self: Character,
    enemies: Character[]
  ): SelectedEnhancements {
    const enhancements: SelectedEnhancements = {};
    
    // Only smart and reckless goblins use enhancements
    const enhancementChance = this.config.personality.intelligence * 0.6 + 
                             this.config.personality.recklessness * 0.4;
    
    if (Math.random() > enhancementChance || self.ap <= action.apCost) {
      return enhancements;
    }

    const availableAp = self.ap - action.apCost;
    const aliveEnemies = enemies.filter(e => e.hp > 0).length;

    // Simple enhancement logic for goblins
    if (action.type === 'damage') {
      // Multi-target if multiple enemies and we have AP
      if (aliveEnemies > 1 && availableAp >= 2 && Math.random() < 0.4) {
        enhancements.multi = 1;
        return enhancements; // Goblins don't stack multiple enhancements well
      }
      
      // Power enhancement for damage
      if (availableAp >= 1 && Math.random() < 0.3) {
        enhancements.power = 1;
      }
      
      // Crit enhancement (goblins don't understand it well, sometimes use on heals)
      if (availableAp >= 1 && Math.random() < 0.2) {
        enhancements.crit = 1;
      }
    }
    
    if (action.type === 'healing') {
      // Sometimes wrongly use crit on healing (goblin mistake)
      if (availableAp >= 1 && Math.random() < 0.1) {
        enhancements.crit = 1;
      }
      
      // Correctly use power on healing
      if (availableAp >= 1 && Math.random() < 0.3) {
        enhancements.power = 1;
      }
    }

    return enhancements;
  }

  // Utility method to update AI personality mid-game if needed
  updatePersonality(newPersonality: Partial<AIPersonality>): void {
    this.config.personality = { ...this.config.personality, ...newPersonality };
  }

  // Utility method to adjust difficulty
  adjustDifficulty(modifier: number): void {
    this.config.difficultyModifier = modifier;
  }
}

// Preset AI configurations for easy use
export const AI_PRESETS = {
  GOBLIN_ALPHA: {
    personality: {
      aggressiveness: 0.8,
      intelligence: 0.3,
      recklessness: 0.7,
      cowardice: 0.2,
      cooperativeness: 0.4
    },
    difficultyModifier: 1.0,
    randomnessFactor: 0.3
  } as AIConfig,

  GOBLIN_BETA: {
    personality: {
      aggressiveness: 0.4,
      intelligence: 0.25,
      recklessness: 0.3,
      cowardice: 0.6,
      cooperativeness: 0.7
    },
    difficultyModifier: 1.0,
    randomnessFactor: 0.4
  } as AIConfig,

  SMART_ENEMY: {
    personality: {
      aggressiveness: 0.6,
      intelligence: 0.8,
      recklessness: 0.4,
      cowardice: 0.3,
      cooperativeness: 0.6
    },
    difficultyModifier: 1.2,
    randomnessFactor: 0.1
  } as AIConfig,

  BERSERKER: {
    personality: {
      aggressiveness: 0.95,
      intelligence: 0.2,
      recklessness: 0.9,
      cowardice: 0.1,
      cooperativeness: 0.1
    },
    difficultyModifier: 1.1,
    randomnessFactor: 0.5
  } as AIConfig
} as const;