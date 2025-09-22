// src/lib/types/turnSystem.ts

export interface Enhancement {
	name: string;
	apCost: number;
	description?: string;
}

export interface Action {
	type: 'physical_attack' | 'enhancement' | 'defend_quick' | 'defend_full' | 'manual_end';
	apCost: number;
	enhancements?: Enhancement[]; // Only for enhancement actions
	description: string;
}

export interface Turn {
	actions: Action[];
	startingAP: number;
	endingAP: number;
	endReason: 'manual_end' | 'ap_depleted' | 'enhancement_used' | 'defend_used';
	recoveryAmount: number;
	nextTurnAP: number;
}

export interface TurnPattern {
	name: string;
	description: string;
	actions: Action[];
}

export interface APRecoveryConfig {
	fullRecoveryRate: number; // 0.6 = 60%
	minPartialRecovery: number; // 0.2 = 20%
	maxPartialRecovery: number; // 0.4 = 40%
	minimumRecovery: number; // 1 AP minimum
}

export interface Character {
	level: number;
	dexterity: number;
	ascensions: number;
	maxAP: number;
}

export interface SimulationResult {
	turns: Turn[];
	averageAPPerTurn: number;
	sustainabilityRating: 'excellent' | 'good' | 'fair' | 'poor';
	totalTurns: number;
}

// Predefined enhancements
export const ENHANCEMENTS: Record<string, Enhancement> = {
	basic: { name: 'Basic Enhancement', apCost: 1, description: '+damage, +crit chance' },
	multiTarget: { name: 'Multi-Target', apCost: 2, description: 'Hit multiple enemies' },
	powerful: { name: 'Powerful Enhancement', apCost: 3, description: 'Major damage boost' },
	ultimate: { name: 'Ultimate Enhancement', apCost: 4, description: 'Maximum power' }
};

// Default configuration
export const DEFAULT_CONFIG: APRecoveryConfig = {
	fullRecoveryRate: 0.6,
	minPartialRecovery: 0.2,
	maxPartialRecovery: 0.4,
	minimumRecovery: 1
};

// Predefined turn patterns
export const TURN_PATTERNS: Record<string, TurnPattern> = {
	conservative: {
		name: 'Conservative',
		description: 'Physical attacks until manual end',
		actions: [
			{ type: 'physical_attack', apCost: 1, description: 'Physical Attack (1 AP)' },
			{ type: 'physical_attack', apCost: 1, description: 'Physical Attack (1 AP)' },
			{ type: 'physical_attack', apCost: 1, description: 'Physical Attack (1 AP)' },
			{ type: 'manual_end', apCost: 0, description: 'End Turn' }
		]
	},
	
	balanced: {
		name: 'Balanced',
		description: 'Attacks then enhanced skill (auto-ends turn)',
		actions: [
			{ type: 'physical_attack', apCost: 1, description: 'Physical Attack (1 AP)' },
			{ type: 'physical_attack', apCost: 1, description: 'Physical Attack (1 AP)' },
			{ 
				type: 'enhancement', 
				apCost: 2, 
				description: 'Enhanced Skill (1 + 1 AP, 1 enhancement)',
				enhancements: [{ name: 'Basic Enhancement', apCost: 1, description: 'Basic boost' }]
			}
		]
	},
	
	aggressive: {
		name: 'Aggressive',
		description: 'Enhanced skill immediately (auto-ends turn)',
		actions: [
			{ 
				type: 'enhancement', 
				apCost: 4, 
				description: 'Enhanced Skill (1 + 3 AP, 2 enhancements)',
				enhancements: [
					{ name: 'Basic Enhancement', apCost: 1, description: 'Basic boost' },
					{ name: 'Multi-Target', apCost: 2, description: 'Hit multiple enemies' }
				]
			}
		]
	}
};