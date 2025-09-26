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
		if (ratio >= 0.8) {
			return { rating: 'excellent', color: 'var(--color-success)' };
		}
		if (ratio >= 0.6) {
			return { rating: 'good', color: 'var(--color-primary)' };
		}
		if (ratio >= 0.4) {
			return { rating: 'fair', color: 'var(--color-warning)' };
		}
		return { rating: 'poor', color: 'var(--color-error)' };
	});

	// Format end reason
	const endReasonText = $derived(() => {
		switch (turn.endReason) {
			case 'manual_end':
				return 'Manual End';
			case 'ap_depleted':
				return 'AP Depleted';
			case 'enhancement_used':
				return 'Enhancement Used';
			default:
				return 'Unknown';
		}
	});

	// Recovery type styling
	const recoveryTypeClass = $derived(() => {
		const hasEnhancement = turn.actions.some((action) => action.type === 'enhancement');
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
					{turn.actions.some((a) => a.type === 'enhancement')
						? 'Partial Recovery'
						: 'Full Recovery'}
				</span>
				<span class="recovery-amount">+{turn.recoveryAmount} AP</span>
			</div>
			<div class="recovery-details">
				{#if turn.actions.some((a) => a.type === 'enhancement')}
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
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		margin-bottom: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px var(--shadow-light);
		transition: var(--transition-theme);
	}

	.turn-header {
		background-color: var(--bg-tertiary);
		padding: 12px 16px;
		border-bottom: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.turn-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
		gap: 12px;
	}

	.turn-title h4 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.efficiency-badge {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 2px 6px;
		border-radius: 4px;
		background-color: currentColor;
		color: var(--text-inverse) !important;
		opacity: 0.9;
		transition: var(--transition-theme);
	}

	.ap-flow {
		font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
		font-size: 14px;
		color: var(--text-secondary);
		font-weight: 500;
		transition: var(--transition-theme);
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
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.actions-list {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		overflow: hidden;
		transition: var(--transition-theme);
	}

	.action-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border-bottom: 1px solid var(--border-primary);
		background-color: var(--bg-tertiary);
		transition: var(--transition-theme);
	}

	.action-item:last-child {
		border-bottom: none;
	}

	.action-description {
		font-size: 13px;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.action-cost {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		background-color: color-mix(in oklab, var(--bg-tertiary) 80%, var(--color-primary) 20%);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.turn-summary {
		margin-bottom: 16px;
		padding: 12px;
		background-color: var(--bg-tertiary);
		border-radius: 8px;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
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
		color: var(--text-secondary);
		transition: var(--transition-theme);
	}

	.summary-value {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.summary-value.spent {
		color: var(--color-error);
	}

	.recovery-section {
		margin-bottom: 16px;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid transparent;
		background: var(--bg-secondary);
		transition: var(--transition-theme);
	}

	.recovery-section.recovery-full {
		background: color-mix(in oklab, var(--bg-secondary) 80%, var(--color-success) 20%);
		border-color: color-mix(in oklab, var(--border-primary) 60%, var(--color-success) 40%);
	}

	.recovery-section.recovery-partial {
		background: color-mix(in oklab, var(--bg-secondary) 80%, var(--color-warning) 20%);
		border-color: color-mix(in oklab, var(--border-primary) 60%, var(--color-warning) 40%);
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
		color: var(--color-success);
	}

	.recovery-section.recovery-partial .recovery-type {
		color: var(--color-warning);
	}

	.recovery-amount {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-success);
	}

	.recovery-section.recovery-partial .recovery-amount {
		color: var(--color-warning);
	}

	.recovery-details {
		font-size: 12px;
		color: var(--text-secondary);
		transition: var(--transition-theme);
	}

	.next-turn {
		text-align: center;
		padding: 12px;
		background: linear-gradient(
			135deg,
			color-mix(in oklab, var(--bg-secondary) 85%, var(--color-primary) 15%) 0%,
			color-mix(in oklab, var(--bg-secondary) 70%, var(--color-primary) 30%) 100%
		);
		border-radius: 8px;
		border: 1px solid color-mix(in oklab, var(--border-primary) 60%, var(--color-primary) 40%);
		transition: var(--transition-theme);
	}

	.next-turn-label {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 4px;
		transition: var(--transition-theme);
	}

	.next-turn-ap {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-primary);
		transition: var(--transition-theme);
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
