<!-- src/lib/components/FormulaSystem/BuildSelector.svelte -->
<script lang="ts">
	interface Props {
		selectedDistribution: string;
		currentLevel: number;
		onClassBuild: (classType: 'balanced' | 'warrior' | 'mage' | 'rogue' | 'ranger' | 'paladin' | 'assassin' | 'necromancer' | 'custom') => void;
		onCustomDistribution?: () => void;
	}

	let { selectedDistribution, currentLevel, onClassBuild, onCustomDistribution }: Props = $props();

	const builds = [
		{ type: 'balanced', name: 'Balanced', description: 'Even distribution', icon: '⚖️' },
		{ type: 'warrior', name: 'Warrior', description: 'STR + CON focus', icon: '🗡️' },
		{ type: 'mage', name: 'Mage', description: 'INT + WIS focus', icon: '🔮' },
		{ type: 'rogue', name: 'Rogue', description: 'DEX focus', icon: '🗡️' },
		{ type: 'ranger', name: 'Ranger', description: 'DEX + WIS focus', icon: '🏹' },
		{ type: 'paladin', name: 'Paladin', description: 'STR + WIS + CHA', icon: '🛡️' },
		{ type: 'assassin', name: 'Assassin', description: 'DEX + INT focus', icon: '💀' },
		{ type: 'necromancer', name: 'Necromancer', description: 'INT + CON focus', icon: '☠️' }
	];
</script>

<div class="build-section">
	<h3 class="section-title">Quick Start Builds</h3>
	<div class="build-grid">
		{#each builds as build}
			<button
				class="build-card"
				class:active={selectedDistribution === build.type}
				onclick={() => onClassBuild(build.type as any)}
				aria-label="Select {build.name} build with {build.description.toLowerCase()}"
			>
				<div class="build-icon">{build.icon}</div>
				<div class="build-content">
					<div class="build-name">{build.name}</div>
					<div class="build-type">{build.description}</div>
				</div>
			</button>
		{/each}
		
		<!-- Custom Distribution Button -->
		<button
			class="build-card custom-card"
			class:active={selectedDistribution === 'custom'}
			onclick={() => onCustomDistribution ? onCustomDistribution() : onClassBuild('custom')}
			aria-label="Create custom stat distribution"
		>
			<div class="build-icon">🎨</div>
			<div class="build-content">
				<div class="build-name">Custom</div>
				<div class="build-type">Manual distribution</div>
			</div>
		</button>
	</div>
</div>

<style>
	.build-section {
		margin-bottom: 24px;
	}

	.section-title {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
		transition: var(--transition-theme);
	}

	.build-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.build-card {
		display: flex;
		align-items: center;
		gap: 10px;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 12px;
		cursor: pointer;
		transition: var(--transition-theme);
		text-align: left;
	}

	.build-card:hover {
		background-color: var(--bg-primary);
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px var(--shadow-medium);
	}

	.build-card.active {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		border-color: var(--color-primary);
		color: var(--text-inverse);
		box-shadow: 0 4px 12px rgba(var(--color-primary), 0.3);
	}

	.custom-card {
		border-style: dashed;
		border-width: 2px;
	}

	.custom-card:hover {
		border-color: var(--color-warning);
		background-color: rgba(var(--color-warning), 0.1);
	}

	.custom-card.active {
		background: linear-gradient(135deg, var(--color-warning), var(--color-accent));
		border-color: var(--color-warning);
		border-style: solid;
		color: var(--text-inverse);
	}

	.build-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.build-content {
		flex: 1;
		min-width: 0;
	}

	.build-name {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 2px;
		transition: var(--transition-theme);
	}

	.build-card.active .build-name {
		color: var(--text-inverse);
	}

	.build-type {
		font-size: 12px;
		opacity: 0.8;
		text-transform: capitalize;
		color: var(--text-muted);
		transition: var(--transition-theme);
	}

	.build-card.active .build-type {
		color: var(--text-inverse);
		opacity: 0.9;
	}

	@media (max-width: 768px) {
		.build-grid {
			grid-template-columns: 1fr;
		}

		.build-card {
			padding: 10px;
		}

		.build-icon {
			font-size: 1.25rem;
		}
	}
</style>