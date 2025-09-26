// src/lib/calculations/turnSystem.ts

import type {
	Action,
	Turn,
	TurnPattern,
	APRecoveryConfig,
	Character,
	SimulationResult,
	Enhancement
} from '$lib/types/turnSystem.js';
import { DEFAULT_CONFIG } from '$lib/types/turnSystem.js';

/**
 * Create basic actions
 */
export function createPhysicalAttack(): Action {
	return {
		type: 'physical_attack',
		apCost: 1,
		description: 'Physical Attack (1 AP)'
	};
}

export function createEnhancedAction(baseSkillCost: number, enhancements: Enhancement[]): Action {
	const totalEnhancementCost = enhancements.reduce((sum, enh) => sum + enh.apCost, 0);
	return {
		type: 'enhancement',
		apCost: baseSkillCost + totalEnhancementCost,
		enhancements,
		description: `Enhanced Skill (${baseSkillCost} + ${totalEnhancementCost} AP, ${enhancements.length} enhancements)`
	};
}

export function createDefendAction(type: 'quick' | 'full'): Action {
	return {
		type: type === 'quick' ? 'defend_quick' : 'defend_full',
		apCost: type === 'quick' ? 1 : 3,
		description: type === 'quick' ? 'Quick Defend (1 AP)' : 'Full Defend (3 AP)'
	};
}

/**
 * Calculate AP recovery amount
 */
function calculateRecovery(
	turn: Omit<Turn, 'recoveryAmount' | 'nextTurnAP'>,
	maxAP: number,
	config: APRecoveryConfig = DEFAULT_CONFIG
): { recoveryAmount: number; nextTurnAP: number } {
	const hasEnhancement = turn.actions.some((action) => action.type === 'enhancement');

	if (hasEnhancement) {
		// Partial recovery: random 20-40% of enhancement costs
		const enhancementCosts = turn.actions
			.filter((action) => action.type === 'enhancement')
			.reduce((sum, action) => sum + action.apCost, 0);

		const recoveryRate =
			config.minPartialRecovery +
			Math.random() * (config.maxPartialRecovery - config.minPartialRecovery);

		const recoveryAmount = Math.max(
			Math.floor(enhancementCosts * recoveryRate),
			config.minimumRecovery
		);

		const nextTurnAP = Math.min(turn.endingAP + recoveryAmount, maxAP);
		return { recoveryAmount, nextTurnAP };
	} else {
		// Full recovery: 60% of max AP
		const recoveryAmount = Math.max(
			Math.floor(maxAP * config.fullRecoveryRate),
			config.minimumRecovery
		);

		const nextTurnAP = Math.min(turn.endingAP + recoveryAmount, maxAP);
		return { recoveryAmount, nextTurnAP };
	}
}

/**
 * Simulate a single turn with a given pattern
 */
export function simulateTurn(
	startingAP: number,
	maxAP: number,
	pattern: TurnPattern,
	config: APRecoveryConfig = DEFAULT_CONFIG
): Turn {
	const actions: Action[] = [];
	let currentAP = startingAP;
	let endReason: Turn['endReason'] = 'manual_end';

	for (const actionTemplate of pattern.actions) {
		// Check if we have enough AP for this action
		if (currentAP < actionTemplate.apCost) {
			endReason = 'ap_depleted';
			break;
		}

		// Execute the action
		actions.push({ ...actionTemplate });
		currentAP -= actionTemplate.apCost;

		// Check automatic turn-ending conditions
		if (actionTemplate.type === 'enhancement') {
			endReason = 'enhancement_used';
			break;
		}

		if (actionTemplate.type === 'defend_quick' || actionTemplate.type === 'defend_full') {
			endReason = 'defend_used';
			break;
		}

		if (actionTemplate.type === 'manual_end') {
			endReason = 'manual_end';
			break;
		}

		// Check if AP is depleted after action
		if (currentAP === 0) {
			endReason = 'ap_depleted';
			break;
		}
	}

	const turn: Omit<Turn, 'recoveryAmount' | 'nextTurnAP'> = {
		actions,
		startingAP,
		endingAP: currentAP,
		endReason
	};

	const { recoveryAmount, nextTurnAP } = calculateRecovery(turn, maxAP, config);

	return {
		...turn,
		recoveryAmount,
		nextTurnAP
	};
}

/**
 * Simulate multiple turns
 */
export function simulateMultipleTurns(
	character: Character,
	pattern: TurnPattern,
	numTurns: number = 10,
	config: APRecoveryConfig = DEFAULT_CONFIG
): SimulationResult {
	const turns: Turn[] = [];
	let currentAP = character.maxAP;

	for (let i = 0; i < numTurns; i++) {
		const turn = simulateTurn(currentAP, character.maxAP, pattern, config);
		turns.push(turn);
		currentAP = turn.nextTurnAP;
	}

	// Calculate statistics
	const totalAP = turns.reduce((sum, turn) => sum + turn.startingAP, 0);
	const averageAPPerTurn = totalAP / turns.length;
	const apRatio = averageAPPerTurn / character.maxAP;

	let sustainabilityRating: SimulationResult['sustainabilityRating'];
	if (apRatio >= 0.8) sustainabilityRating = 'excellent';
	else if (apRatio >= 0.6) sustainabilityRating = 'good';
	else if (apRatio >= 0.4) sustainabilityRating = 'fair';
	else sustainabilityRating = 'poor';

	return {
		turns,
		averageAPPerTurn,
		sustainabilityRating,
		totalTurns: turns.length
	};
}
