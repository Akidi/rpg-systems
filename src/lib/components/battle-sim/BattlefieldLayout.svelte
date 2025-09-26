<script lang="ts">
	import CharacterCard from './CharacterCard.svelte';
	import CombatLog from './CombatLog.svelte';
	import type {
		ActionDefinition,
		Character,
		CharacterKey,
		CombatLogEntry,
		TelegraphedAction
	} from './types';

	type CharacterEntry = [CharacterKey, Character];

	type Props = {
		characterEntries: CharacterEntry[];
		currentTurn: CharacterKey;
		selectedTarget: CharacterKey;
		globalActionCount: number;
		telegraphedActions: Partial<Record<CharacterKey, TelegraphedAction>>;
		actions: ActionDefinition[];
		combatLog: CombatLogEntry[];
		onSelectTarget: (key: CharacterKey) => void;
	};

	let {
		characterEntries = [],
		currentTurn,
		selectedTarget,
		globalActionCount,
		telegraphedActions = {},
		actions = [],
		combatLog = [],
		onSelectTarget
	}: Props = $props();
</script>

<div class="battle-layout grid grid-cols-1 gap-6 lg:grid-cols-3">
	<div class="character-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
		{#each characterEntries as [key, char] (key)}
			<CharacterCard
				character={char}
				characterKey={key}
				{currentTurn}
				{selectedTarget}
				{globalActionCount}
				telegraphedAction={telegraphedActions[key]}
				{actions}
				canTarget={key.startsWith('enemy') && currentTurn === 'player'}
				selectTarget={onSelectTarget}
			/>
		{/each}
	</div>

	<CombatLog logs={combatLog} />
</div>

<style>
	.battle-layout {
		width: 100%;
	}

	.character-grid {
		width: 100%;
	}
</style>
