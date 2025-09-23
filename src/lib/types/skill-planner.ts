// $lib/types/skill-planner.ts - Updated with dual progression system

export type ProgressionType = 'curve' | 'per-rank';
export type DeltaType = 'flat' | 'percentage';
export type EffectValueType = 'percentage' | 'flat' | 'binary' | 'chance';

export interface RankDelta {
  fromRank: number;
  toRank: number;
  deltaValue: number;
  deltaType: DeltaType;
}

export interface EffectType {
  id: string;
  name: string;
  type: EffectValueType;
  unit: string;
  description: string;
  
  // Progression system
  progressionType: ProgressionType;
  
  // Curve-based progression (existing system)
  baseValue: number;
  targetValue: number;
  targetRank: number;
  
  // Per-rank progression (new system)
  rankDeltas: RankDelta[];
}

export interface BinaryEffect {
  id: string;
  name: string;
  description: string;
  unlockRank: number;
  chancePercentage?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  maxRank: number;
  isCombatSkill: boolean;
  effects: EffectType[];
  binaryEffects: BinaryEffect[];
  currentPoints: number;
}

export interface ITierConfig {
  tier: number;
  startRank: number;
  endRank: number;
  costPerRank: number;
}

export interface ProgressionStep {
  pointsSpent: number;
  rank: number;
  pointsInCurrentRank: number;
  totalPointsForRank: number;
  effects: Record<string, number>;
  incrementFromPrevious: Record<string, number>;
  unlockedBinaries: BinaryEffect[];
}

export interface SkillTemplate {
  id: string;
  name: string;
  description: string;
  skill: Skill;
}