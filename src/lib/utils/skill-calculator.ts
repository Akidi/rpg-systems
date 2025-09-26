// $lib/utils/skill-calculator.ts - Updated with dual progression system

import type {
	ITierConfig,
	Skill,
	EffectType,
	ProgressionStep,
	BinaryEffect,
	RankDelta
} from '$lib/types/skill-planner';

export const defaultTierConfigs: ITierConfig[] = [
	{ tier: 1, startRank: 1, endRank: 3, costPerRank: 1 },
	{ tier: 2, startRank: 4, endRank: 6, costPerRank: 4 },
	{ tier: 3, startRank: 7, endRank: 9, costPerRank: 7 },
	{ tier: 4, startRank: 10, endRank: 10, costPerRank: 10 }
];

export class SkillCalculator {
	private tiers: ITierConfig[];

	constructor(tiers: ITierConfig[] = defaultTierConfigs) {
		this.tiers = [...tiers].sort((a, b) => a.startRank - b.startRank);
	}

	getTierForRank(rank: number): ITierConfig | null {
		return this.tiers.find((tier) => rank >= tier.startRank && rank <= tier.endRank) || null;
	}

	calculatePointsToRank(targetRank: number): number {
		let totalPoints = 0;

		for (let rank = 1; rank <= targetRank; rank++) {
			const tier = this.getTierForRank(rank);
			if (tier) {
				totalPoints += tier.costPerRank;
			}
		}

		return totalPoints;
	}

	calculateRankFromPoints(points: number): {
		rank: number;
		pointsInRank: number;
		pointsForRank: number;
	} {
		let remainingPoints = points;
		let currentRank = 0;

		// Find the highest complete rank we can afford
		for (let rank = 1; rank <= 20; rank++) {
			// Assuming max 20 ranks
			const tier = this.getTierForRank(rank);
			if (!tier) break;

			if (remainingPoints >= tier.costPerRank) {
				remainingPoints -= tier.costPerRank;
				currentRank = rank;
			} else {
				break;
			}
		}

		// Calculate points in current partial rank
		const nextRank = currentRank + 1;
		const nextTier = this.getTierForRank(nextRank);
		const pointsForNextRank = nextTier ? nextTier.costPerRank : 0;

		return {
			rank: currentRank,
			pointsInRank: remainingPoints,
			pointsForRank: pointsForNextRank
		};
	}

	// Calculate effect value using curve-based progression (existing system)
	private calculateCurveProgression(
		effect: EffectType,
		totalPointsSpent: number,
		maxPoints: number
	): number {
		if (totalPointsSpent === 0) return effect.baseValue;
		if (totalPointsSpent >= maxPoints) return effect.targetValue;

		// Progressive power calculation with accelerating curve
		const targetRankPoints = this.calculatePointsToRank(effect.targetRank);
		const effectProgress = Math.min(totalPointsSpent / targetRankPoints, 1);

		// Accelerating curve: more power as you get closer to target
		const acceleratedProgress = Math.pow(effectProgress, 0.8); // Adjust curve steepness

		return effect.baseValue + (effect.targetValue - effect.baseValue) * acceleratedProgress;
	}

	// Calculate effect value using per-rank progression (new system)
	private calculatePerRankProgression(effect: EffectType, currentRank: number): number {
		let value = effect.baseValue;

		// Sort deltas by fromRank to ensure proper order
		const sortedDeltas = [...effect.rankDeltas].sort((a, b) => a.fromRank - b.fromRank);

		for (const delta of sortedDeltas) {
			// Apply delta if we've reached or passed the transition rank
			if (currentRank > delta.fromRank) {
				if (delta.deltaType === 'flat') {
					value += delta.deltaValue;
				} else {
					// percentage
					value = value * (1 + delta.deltaValue / 100);
				}
			}
		}

		return value;
	}

	// Calculate effect value with between-rank progression for per-rank system
	private calculatePerRankWithProgression(
		effect: EffectType,
		currentRank: number,
		pointsInRank: number,
		pointsForRank: number
	): number {
		const currentRankValue = this.calculatePerRankProgression(effect, currentRank);

		if (pointsInRank === 0 || pointsForRank === 0) {
			return currentRankValue;
		}

		// Calculate next rank value
		const nextRankValue = this.calculatePerRankProgression(effect, currentRank + 1);
		const difference = nextRankValue - currentRankValue;

		// Calculate the 50% milestone point based on tier
		// Tier 1 (1pt): 50% at 1/1 (not applicable, completes immediately)
		// Tier 2 (4pt): 50% at 3/4
		// Tier 3 (7pt): 50% at 6/7
		// Tier 4 (10pt): 50% at 9/10
		const fiftyPercentPoint = pointsForRank === 1 ? 1 : pointsForRank - 1;

		let progressGain: number;

		if (pointsInRank < fiftyPercentPoint) {
			// First portion: accelerating to 50% of difference at fiftyPercentPoint
			const portionProgress = pointsInRank / fiftyPercentPoint;
			// Quadratic curve for smooth acceleration
			progressGain = difference * 0.5 * (portionProgress * portionProgress);
		} else {
			// Second portion: from 50% to 100%
			const remainingPoints = pointsInRank - fiftyPercentPoint;
			const remainingNeeded = pointsForRank - fiftyPercentPoint;
			const portionProgress = remainingPoints / remainingNeeded;
			// Linear progression from 50% to 100%
			progressGain = difference * (0.5 + 0.5 * portionProgress);
		}

		return currentRankValue + progressGain;
	}

	// Main effect calculation method that chooses between curve and per-rank
	calculateEffectValue(
		effect: EffectType,
		totalPointsSpent: number,
		currentRank: number,
		pointsInRank: number,
		pointsForRank: number,
		maxPoints: number
	): number {
		if (effect.progressionType === 'per-rank') {
			return this.calculatePerRankWithProgression(effect, currentRank, pointsInRank, pointsForRank);
		} else {
			return this.calculateCurveProgression(effect, totalPointsSpent, maxPoints);
		}
	}

	generateProgression(skill: Skill): ProgressionStep[] {
		const maxPoints = this.calculatePointsToRank(skill.maxRank);
		const progression: ProgressionStep[] = [];

		// Generate step for each point from 0 to maxPoints
		for (let points = 0; points <= maxPoints; points++) {
			const rankInfo = this.calculateRankFromPoints(points);

			// Calculate current effect values
			const effects: Record<string, number> = {};
			const incrementFromPrevious: Record<string, number> = {};

			for (const effect of skill.effects) {
				const currentValue = this.calculateEffectValue(
					effect,
					points,
					rankInfo.rank,
					rankInfo.pointsInRank,
					rankInfo.pointsForRank,
					maxPoints
				);

				effects[effect.id] = currentValue;

				// Calculate increment from previous step
				if (points > 0 && progression.length > 0) {
					const previousValue = progression[progression.length - 1].effects[effect.id] || 0;
					incrementFromPrevious[effect.id] = currentValue - previousValue;
				} else {
					incrementFromPrevious[effect.id] = 0;
				}
			}

			// Calculate unlocked binary effects
			const unlockedBinaries: BinaryEffect[] = skill.binaryEffects.filter(
				(binary) => rankInfo.rank >= binary.unlockRank
			);

			progression.push({
				pointsSpent: points,
				rank: rankInfo.rank,
				pointsInCurrentRank: rankInfo.pointsInRank,
				totalPointsForRank: rankInfo.pointsForRank,
				effects,
				incrementFromPrevious,
				unlockedBinaries
			});
		}

		return progression;
	}

	// Helper method to create a default per-rank effect
	createDefaultPerRankEffect(effectName: string, maxRank: number): EffectType {
		const deltas: RankDelta[] = [];

		// Create default deltas for each rank transition
		for (let rank = 0; rank < maxRank; rank++) {
			deltas.push({
				fromRank: rank,
				toRank: rank + 1,
				deltaValue: 10, // Default +10 per rank
				deltaType: 'flat'
			});
		}

		return {
			id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: effectName,
			type: 'flat',
			unit: 'points',
			description: `${effectName} increases per rank`,
			progressionType: 'per-rank',
			baseValue: 0,
			targetValue: 0, // Not used in per-rank
			targetRank: maxRank, // Not used in per-rank
			rankDeltas: deltas
		};
	}

	// Helper method to create a default curve effect
	createDefaultCurveEffect(effectName: string, targetValue: number, maxRank: number): EffectType {
		return {
			id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: effectName,
			type: 'percentage',
			unit: '%',
			description: `${effectName} increases smoothly to target`,
			progressionType: 'curve',
			baseValue: 0,
			targetValue: targetValue,
			targetRank: maxRank,
			rankDeltas: [] // Not used in curve
		};
	}
}
