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
		{ type: 'balanced', name: 'Balanced', description: 'Even distribution' },
		{ type: 'warrior', name: 'Warrior', description: 'STR + CON focus' },
		{ type: 'mage', name: 'Mage', description: 'INT + WIS focus' },
		{ type: 'rogue', name: 'Rogue', description: 'DEX focus' },
		{ type: 'ranger', name: 'Ranger', description: 'DEX + WIS focus' },
		{ type: 'paladin', name: 'Paladin', description: 'STR + WIS + CHA' },
		{ type: 'assassin', name: 'Assassin', description: 'DEX + INT focus' },
		{ type: 'necromancer', name: 'Necromancer', description: 'INT + CON focus' }
	];
</script>

<div class="build-section">
	<h3>Quick Start Builds</h3>
	<div class="build-grid">
		{#each builds as build}
			<button
				class="build-card {selectedDistribution === build.type ? 'active' : ''}"
				onclick={() => onClassBuild(build.type as any)}
				aria-label="Select {build.name} build with {build.description.toLowerCase()}"
			>
				<div class="build-name">{build.name}</div>
				<div class="build-type">{build.description}</div>
			</button>
		{/each}
		
		<!-- Custom Distribution Button -->
		<button
			class="build-card custom-card {selectedDistribution === 'custom' ? 'active' : ''}"
			onclick={() => onCustomDistribution ? onCustomDistribution() : onClassBuild('custom')}
			aria-label="Create custom stat distribution"
		>
			<div class="build-name">Custom</div>
			<div class="build-type">Manual distribution</div>
		</button>
	</div>
</div>

<style>
	.build-section {
		margin-bottom: 24px;
	}

	.build-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #4b5563;
	}

	.build-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.build-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.build-card:hover {
		background: #f1f5f9;
		border-color: #667eea;
		transform: translateY(-1px);
	}

	.build-card.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-color: #667eea;
		color: white;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.custom-card {
		border-style: dashed;
		border-width: 2px;
	}

	.custom-card:hover {
		border-color: #f59e0b;
		background: #fef3c7;
	}

	.custom-card.active {
		background: linear-gradient(135deg, #f59e0b, #d97706);
		border-color: #f59e0b;
		border-style: solid;
	}

	.build-name {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.build-type {
		font-size: 12px;
		opacity: 0.7;
		text-transform: capitalize;
	}

	@media (prefers-color-scheme: dark) {
		.build-section h3 {
			color: #d1d5db;
		}

		.build-card {
			background: #111827;
			border-color: #4b5563;
			color: #e5e7eb;
		}

		.build-card:hover {
			background: #374151;
			border-color: #7c3aed;
		}

		.build-card.active {
			background: linear-gradient(135deg, #7c3aed, #a855f7);
		}

		.custom-card:hover {
			border-color: #f59e0b;
			background: #451a03;
		}

		.custom-card.active {
			background: linear-gradient(135deg, #f59e0b, #d97706);
		}
	}

	@media (max-width: 768px) {
		.build-grid {
			grid-template-columns: 1fr;
		}
	}
</style>