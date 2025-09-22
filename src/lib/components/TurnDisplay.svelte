<!-- src/lib/components/TurnDisplay.svelte -->
<script lang="ts">
	import type { Turn } from '$lib/types/turnSystem.js';

	interface Props {
		turn: Turn;
		turnNumber: number;
		maxAP: number;
	}

	let { turn, turnNumber, maxAP }: Props = $props();

	// Calculate efficiency rating
	const efficiencyRating = $derived(() => {
		const ratio = turn.startingAP / maxAP;
		if (ratio >= 0.8) return { rating: 'excellent', color: '#10b981' };
		if (ratio >= 0.6) return { rating: 'good', color: '#3b82f6' };
		if (ratio >= 0.4) return { rating: 'fair', color: '#f59e0b' };
		return { rating: 'poor', color: '#ef4444' };
	});

	// Format end reason
	const endReasonText = $derived(() => {
		switch (turn.endReason) {
			case 'manual_end': return 'Manual End';
			case 'ap_depleted': return 'AP Depleted';
			case 'enhancement_used': return 'Enhancement Used';
			default: return 'Unknown';
		}
	});

	// Recovery type styling
	const recoveryTypeClass = $derived(() => {
		const hasEnhancement = turn.actions.some(action => action.type === 'enhancement');
		return hasEnhancement ? 'recovery-partial' : 'recovery-full';
	});
</script>

<div class="turn-display">
	<div class="turn-header">
		<div class="turn-title">
			<h4>Turn {turnNumber}</h4>
			<span class="efficiency-badge" style="color: {efficiencyRating().color}">
				{efficiencyRating().rating}
			</span>
		</div>
		<div class="ap-flow">
			{turn.startingAP} AP → {turn.nextTurnAP} AP
		</div>
	</div>

	<div class="turn-content">
		<div class="actions-section">
			<h5>Actions Taken:</h5>
			<div class="actions-list">
				{#each turn.actions as action, index}
					<div class="action-item">
						<span class="action-description">{action.description}</span>
						<span class="action-cost">{action.apCost} AP</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="turn-summary">
			<div class="summary-row">
				<span class="summary-label">Starting AP:</span>
				<span class="summary-value">{turn.startingAP}</span>
			</div>
			<div class="summary-row">
				<span class="summary-label">AP Spent:</span>
				<span class="summary-value spent">-{turn.startingAP - turn.endingAP}</span>
			</div>
			<div class="summary-row">
				<span class="summary-label">Remaining:</span>
				<span class="summary-value">{turn.endingAP}</span>
			</div>
			<div class="summary-row">
				<span class="summary-label">End Reason:</span>
				<span class="summary-value">{endReasonText()}</span>
			</div>
		</div>

		<div class="recovery-section {recoveryTypeClass()}">
			<div class="recovery-header">
				<span class="recovery-type">
					{turn.actions.some(a => a.type === 'enhancement') ? 'Partial Recovery' : 'Full Recovery'}
				</span>
				<span class="recovery-amount">+{turn.recoveryAmount} AP</span>
			</div>
			<div class="recovery-details">
				{#if turn.actions.some(a => a.type === 'enhancement')}
					Random 20-40% of enhancement costs
				{:else}
					60% of maximum AP pool
				{/if}
			</div>
		</div>

		<div class="next-turn">
			<div class="next-turn-label">Next Turn Starts With:</div>
			<div class="next-turn-ap">{turn.nextTurnAP} AP</div>
		</div>
	</div>
</div>

<style>
	.turn-display {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		margin-bottom: 12px;
		overflow: hidden;
	}

	.turn-header {
		background-color: #f8fafc;
		padding: 12px 16px;
		border-bottom: 1px solid #e5e7eb;
	}

	.turn-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.turn-title h4 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: #374151;
	}

	.efficiency-badge {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 2px 6px;
		border-radius: 4px;
		background-color: currentColor;
		color: white !important;
		opacity: 0.9;
	}

	.ap-flow {
		font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
		font-size: 14px;
		color: #6b7280;
		font-weight: 500;
	}

	.turn-content {
		padding: 16px;
	}

	.actions-section {
		margin-bottom: 16px;
	}

	.actions-section h5 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
	}

	.actions-list {
		background-color: #f9fafb;
		border: 1px solid #f3f4f6;
		border-radius: 6px;
		overflow: hidden;
	}

	.action-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border-bottom: 1px solid #f3f4f6;
	}

	.action-item:last-child {
		border-bottom: none;
	}

	.action-description {
		font-size: 13px;
		color: #374151;
	}

	.action-cost {
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		background-color: #e5e7eb;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.turn-summary {
		margin-bottom: 16px;
		padding: 12px;
		background-color: #f8fafc;
		border-radius: 6px;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.summary-row:last-child {
		margin-bottom: 0;
	}

	.summary-label {
		font-size: 13px;
		color: #6b7280;
	}

	.summary-value {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
	}

	.summary-value.spent {
		color: #ef4444;
	}

	.recovery-section {
		margin-bottom: 16px;
		padding: 12px;
		border-radius: 6px;
		border: 1px solid transparent;
	}

	.recovery-section.recovery-full {
		background-color: #ecfdf5;
		border-color: #bbf7d0;
	}

	.recovery-section.recovery-partial {
		background-color: #fef3c7;
		border-color: #fde68a;
	}

	.recovery-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.recovery-type {
		font-size: 14px;
		font-weight: 600;
	}

	.recovery-section.recovery-full .recovery-type {
		color: #166534;
	}

	.recovery-section.recovery-partial .recovery-type {
		color: #92400e;
	}

	.recovery-amount {
		font-size: 14px;
		font-weight: 700;
		color: #059669;
	}

	.recovery-details {
		font-size: 12px;
		color: #6b7280;
	}

	.next-turn {
		text-align: center;
		padding: 12px;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		border-radius: 6px;
		border: 1px solid #bfdbfe;
	}

	.next-turn-label {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 4px;
	}

	.next-turn-ap {
		font-size: 20px;
		font-weight: 700;
		color: #3b82f6;
	}

	/* Desktop enhancements */
	@media (min-width: 768px) {
		.turn-header {
			padding: 16px 20px;
		}

		.turn-content {
			padding: 20px;
		}

		.turn-title {
			margin-bottom: 8px;
		}

		.turn-title h4 {
			font-size: 18px;
		}

		.ap-flow {
			font-size: 16px;
		}

		.efficiency-badge {
			font-size: 12px;
			padding: 4px 8px;
		}

		.next-turn-ap {
			font-size: 24px;
		}
	}
</style>