<script lang="ts">
	import type { CombatLogCategory, CombatLogEntry } from './types';

	type ContextToken = {
		text: string;
		class?: string;
	};

	export let logs: CombatLogEntry[] = [];

	const CATEGORY_LABELS: Record<CombatLogCategory, string> = {
		damage: 'Damage',
		healing: 'Healing',
		focus: 'Focus',
		effect: 'Effect',
		resource: 'Resource',
		system: 'System'
	};

	function formatAmount(entry: CombatLogEntry): string | null {
		if (entry.amount == null) return null;
		switch (entry.category) {
			case 'damage':
				return `-${entry.amount}`;
			case 'healing':
				return `+${entry.amount}`;
			case 'focus':
				return `${entry.amount}`;
			case 'effect':
				return `${entry.amount}`;
			default:
				return null;
		}
	}

	function getContextTokens(entry: CombatLogEntry): ContextToken[] {
		const tokens: ContextToken[] = [];
		if (entry.actor) tokens.push({ text: entry.actor, class: 'actor' });
		if (entry.action) tokens.push({ text: entry.action, class: 'action' });
		if (entry.target) tokens.push({ text: `→ ${entry.target}`, class: 'target' });
		if (entry.source && entry.source !== entry.action) tokens.push({ text: `[${entry.source}]`, class: 'source' });
		return tokens;
	}
</script>

<div class="combat-log">
	<h3 class="log-title">Combat Log</h3>
	<div class="log-entries">
		{#if logs.length === 0}
			<div class="log-empty">The battlefield awaits your command...</div>
		{:else}
			{#each logs as log (log.id)}
				{@const amount = formatAmount(log)}
				{@const contextTokens = getContextTokens(log)}
				<div class={`log-entry type--${log.category}`}>
					<div class="log-row">
						<div class="log-meta">
							<span class="meta-chip">T{log.turn}</span>
							{#if log.actionNumber > 0}
								<span class="meta-chip meta-action">A{log.actionNumber}</span>
							{/if}
							<span class={`category-chip category-chip--${log.category}`}>
								{CATEGORY_LABELS[log.category]}
							</span>
							{#if log.tags && log.tags.length > 0}
								<span class="tag-list">
									{#each log.tags as tag, index (`${log.id}-tag-${index}`)}
										<span class="tag">{tag}</span>
									{/each}
								</span>
							{/if}
						</div>
						{#if amount}
							<span class="log-amount" data-category={log.category}>{amount}</span>
						{/if}
					</div>
					<div class="log-message">{log.message}</div>
					{#if contextTokens.length > 0}
						<div class="log-context">
							{#each contextTokens as token, index (`${log.id}-context-${index}`)}
								<span class={`context-token ${token.class ?? ''}`}>{token.text}</span>
							{/each}
						</div>
					{/if}
					{#if log.detail}
						<div class="log-detail">{log.detail}</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.combat-log {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 1rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		box-shadow: 0 8px 24px var(--shadow-light);
		min-height: 100%;
	}

	.log-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.log-entries {
		height: 16rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		font-size: 0.85rem;
		color: var(--text-primary);
		padding-right: 0.35rem;
	}

	.log-empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.log-entry {
		border-radius: 0.6rem;
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		border-left: 3px solid var(--border-secondary);
		background: color-mix(in oklab, var(--bg-tertiary) 85%, var(--border-secondary) 15%);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--border-secondary) 50%, transparent);
	}

	.log-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.log-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.meta-chip,
	.category-chip {
		background: var(--bg-tertiary);
		border-radius: 0.5rem;
		padding: 0.15rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.meta-action {
		background: color-mix(in oklab, var(--color-info) 20%, var(--bg-tertiary) 80%);
	}

	.category-chip {
		font-size: 0.68rem;
		border: 1px solid transparent;
	}

	.category-chip--damage {
		border-color: color-mix(in oklab, var(--color-error) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-error) 25%);
		color: color-mix(in oklab, var(--color-error) 80%, var(--text-inverse) 20%);
	}

	.category-chip--healing {
		border-color: color-mix(in oklab, var(--color-success) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-success) 25%);
		color: color-mix(in oklab, var(--color-success) 70%, var(--text-inverse) 30%);
	}

	.category-chip--focus {
		border-color: color-mix(in oklab, var(--color-info) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-info) 25%);
		color: color-mix(in oklab, var(--color-info) 75%, var(--text-inverse) 25%);
	}

	.category-chip--effect {
		border-color: color-mix(in oklab, var(--color-secondary) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 80%, var(--color-secondary) 20%);
	}

	.category-chip--resource {
		border-color: color-mix(in oklab, var(--color-warning) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-warning) 25%);
		color: color-mix(in oklab, var(--color-warning) 70%, var(--text-primary) 30%);
	}

	.category-chip--system {
		border-color: color-mix(in oklab, var(--color-primary) 60%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 75%, var(--color-primary) 25%);
		color: color-mix(in oklab, var(--color-primary) 70%, var(--text-inverse) 30%);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.tag {
		border-radius: 0.45rem;
		padding: 0.1rem 0.4rem;
		font-size: 0.65rem;
		font-weight: 500;
		border: 1px solid color-mix(in oklab, var(--border-secondary) 70%, transparent);
		color: var(--text-secondary);
		background: color-mix(in oklab, var(--bg-tertiary) 85%, var(--border-secondary) 15%);
	}

	.log-amount {
		font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace;
		font-weight: 700;
		font-size: 0.9rem;
		padding: 0.15rem 0.45rem;
		border-radius: 0.4rem;
		align-self: flex-start;
	}

	.log-amount[data-category='damage'] {
		background: color-mix(in oklab, var(--color-error) 20%, var(--bg-tertiary) 80%);
		color: color-mix(in oklab, var(--color-error) 80%, var(--text-inverse) 20%);
	}

	.log-amount[data-category='healing'] {
		background: color-mix(in oklab, var(--color-success) 20%, var(--bg-tertiary) 80%);
		color: color-mix(in oklab, var(--color-success) 70%, var(--text-inverse) 30%);
	}

	.log-amount[data-category='focus'] {
		background: color-mix(in oklab, var(--color-info) 20%, var(--bg-tertiary) 80%);
		color: color-mix(in oklab, var(--color-info) 70%, var(--text-inverse) 30%);
	}

	.log-amount[data-category='effect'] {
		background: color-mix(in oklab, var(--color-secondary) 15%, var(--bg-tertiary) 85%);
		color: color-mix(in oklab, var(--color-secondary) 70%, var(--text-inverse) 30%);
	}

	.log-message {
		font-weight: 600;
		color: var(--text-primary);
	}

	.log-context {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.context-token {
		position: relative;
		padding-left: 0.6rem;
	}

	.context-token::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--border-secondary);
	}

	.context-token:first-child::before {
		content: '';
	}

	.context-token.target {
		color: color-mix(in oklab, var(--color-error) 60%, var(--text-secondary) 40%);
	}

	.context-token.actor {
		color: color-mix(in oklab, var(--color-info) 55%, var(--text-secondary) 45%);
	}

	.context-token.source {
		font-style: italic;
	}

	.log-detail {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.type--damage {
		border-left-color: color-mix(in oklab, var(--color-error) 80%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 82%, var(--color-error) 18%);
	}

	.type--healing {
		border-left-color: color-mix(in oklab, var(--color-success) 75%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 82%, var(--color-success) 18%);
	}

	.type--focus {
		border-left-color: color-mix(in oklab, var(--color-info) 75%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 84%, var(--color-info) 16%);
	}

	.type--effect {
		border-left-color: color-mix(in oklab, var(--color-secondary) 70%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 85%, var(--color-secondary) 15%);
	}

	.type--resource {
		border-left-color: color-mix(in oklab, var(--color-warning) 80%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 82%, var(--color-warning) 18%);
	}

	.type--system {
		border-left-color: color-mix(in oklab, var(--color-primary) 80%, transparent);
		background: color-mix(in oklab, var(--bg-tertiary) 84%, var(--color-primary) 16%);
	}

	.log-entries::-webkit-scrollbar {
		width: 0.35rem;
	}

	.log-entries::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: 1rem;
	}

	.log-entries::-webkit-scrollbar-thumb {
		background: color-mix(in oklab, var(--border-secondary) 75%, var(--color-primary) 25%);
		border-radius: 1rem;
	}

	.log-entries::-webkit-scrollbar-thumb:hover {
		background: color-mix(in oklab, var(--border-secondary) 60%, var(--color-primary) 40%);
	}
</style>
