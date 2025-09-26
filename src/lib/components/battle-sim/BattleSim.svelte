<script lang="ts">
	import { RotateCcw, Sword, Shield, Target, Heart, Flame } from 'lucide-svelte';
	import CharacterCard from './CharacterCard.svelte';
	import CombatLog from './CombatLog.svelte';
	import EnhancementPanel from './EnhancementPanel.svelte';
	import ActionGrid from './ActionGrid.svelte';
	import VictoryOverlay from './VictoryOverlay.svelte';
	import {
		getEnhancementCost,
		getFocusMultiplier,
		rollNextTickInterval,
		getTotalEnhancementCount,
		getEnhancementApCost,
		hasAnyEnhancements
	} from './utils';
	import type {
		ActionDefinition,
		Character,
		CharacterKey,
		CharactersState,
		Enhancement,
		EnhancementId,
		Effect,
		SelectedEnhancements,
		TelegraphedAction
	} from './types';

	type PartialCharactersState = Partial<Record<CharacterKey, Character>>;

	const baseEnhancements: Enhancement[] = [
		{ id: 'power', name: 'Raw Power', description: '+50% damage/healing per stack', cost: 1.25 },
		{ id: 'crit', name: 'Critical Chance', description: '+25% crit chance per stack', cost: 1.25 },
		{ id: 'multi', name: 'Multi-Target', description: 'Hit all enemies (50% damage)', cost: 1.25 }
	];

	const actions: ActionDefinition[] = [
		{ id: 'attack', name: 'Attack', apCost: 2, type: 'damage', icon: Sword },
		{ id: 'heal', name: 'Heal', apCost: 3, type: 'healing', icon: Heart },
		{ id: 'focus', name: 'Focus', apCost: 1, type: 'focus', icon: Target },
		{ id: 'defend', name: 'Defend', apCost: 2, type: 'defend', icon: Shield },
		{ id: 'fireball', name: 'Fireball', apCost: 1, type: 'damage', icon: Flame, dot: true }
	];

	const createInitialCharacters = (): CharactersState => ({
		player: {
			name: 'Hero',
			maxHp: 100,
			hp: 100,
			maxMana: 50,
			mana: 50,
			maxAp: 10,
			ap: 10,
			focus: 0,
			maxFocus: 4,
			focusDecay: 0,
			effects: [],
			baseDamage: 15,
			baseHealing: 12
		},
		enemy1: {
			name: 'Goblin Alpha',
			maxHp: 60,
			hp: 60,
			maxMana: 30,
			mana: 30,
			maxAp: 10,
			ap: 10,
			focus: 0,
			maxFocus: 4,
			focusDecay: 0,
			effects: [],
			baseDamage: 10,
			baseHealing: 8
		},
		enemy2: {
			name: 'Goblin Beta',
			maxHp: 50,
			hp: 50,
			maxMana: 25,
			mana: 25,
			maxAp: 10,
			ap: 10,
			focus: 0,
			maxFocus: 4,
			focusDecay: 0,
			effects: [],
			baseDamage: 8,
			baseHealing: 6
		}
	});

	let characters = $state(createInitialCharacters());
	let currentTurn = $state<CharacterKey>('player');
	let combatLog = $state<string[]>([]);
	let turnCount = $state(1);
	let globalActionCount = $state(0);
	let selectedTarget = $state<CharacterKey>('enemy1');
	let enhancementMode = $state(false);
	let selectedEnhancements = $derived<SelectedEnhancements>({});
	let selectedAction = $state<string | null>(null);
	let telegraphedActions = $derived<Partial<Record<CharacterKey, TelegraphedAction>>>({});

	const currentCharacter = $derived(characters[currentTurn]);
	const playerDefeated = $derived(characters.player.hp <= 0);
	const goblinsDefeated = $derived(characters.enemy1.hp <= 0 && characters.enemy2.hp <= 0);

	function getEnhancementCount(id: EnhancementId) {
		return selectedEnhancements[id] ?? 0;
	}

	function updateEnhancementCount(id: EnhancementId, count: number) {
		const next = { ...selectedEnhancements } as Record<EnhancementId, number>;
		if (count <= 0) {
			delete next[id];
		} else {
			next[id] = count;
		}
		applyEnhancementSelection(next as SelectedEnhancements);
	}

	function incrementEnhancement(id: EnhancementId) {
		if (id === 'multi') {
			updateEnhancementCount(id, 1);
			return;
		}
		updateEnhancementCount(id, getEnhancementCount(id) + 1);
	}

	function decrementEnhancement(id: EnhancementId) {
		const current = getEnhancementCount(id);
		if (current <= 0) return;
		updateEnhancementCount(id, current - 1);
	}

	function toggleBinaryEnhancement(id: EnhancementId, value: boolean) {
		updateEnhancementCount(id, value ? 1 : 0);
	}

	function clearEnhancements() {
		selectedEnhancements = {};
		selectedAction = null;
	}

	function sanitizeEnhancements(selection: SelectedEnhancements): SelectedEnhancements {
		return Object.fromEntries(
			Object.entries(selection).filter(([, count]) => !!count && count > 0)
		) as SelectedEnhancements;
	}

	function getActionDefinition(actionId: string | null) {
		return actionId ? (actions.find((item) => item.id === actionId) ?? null) : null;
	}

	function getTotalApCostForSelection(
		selection: SelectedEnhancements,
		actionId: string | null,
		actor: Character
	) {
		const action = getActionDefinition(actionId);
		const baseCost = action?.apCost ?? 0;
		return baseCost + getEnhancementApCost(selection);
	}

	function canAffordSelection(
		selection: SelectedEnhancements,
		actionId: string | null,
		actor: Character
	) {
		const totalCost = getTotalApCostForSelection(selection, actionId, actor);
		return totalCost <= actor.ap;
	}

	function applyEnhancementSelection(selection: SelectedEnhancements) {
		const actor = characters[currentTurn];
		if (!actor) {
			return false;
		}
		const sanitized = sanitizeEnhancements(selection);
		if (!canAffordSelection(sanitized, selectedAction, actor)) {
			return false;
		}
		selectedEnhancements = sanitized;
		return true;
	}

	function cloneCharacter(character: Character): Character {
		return {
			...character,
			effects: character.effects.map((effect) => ({ ...effect })) as Effect[]
		};
	}

	function cloneTargets(targets: PartialCharactersState): PartialCharactersState {
		const cloned: PartialCharactersState = {};
		(Object.keys(targets) as CharacterKey[]).forEach((key) => {
			const target = targets[key];
			if (target) {
				cloned[key] = cloneCharacter(target);
			}
		});
		return cloned;
	}

	function logMessage(message: string) {
		const entry = `Turn ${turnCount}: ${message}`;
		combatLog = [entry, ...combatLog].slice(0, 10);
	}

	function getAliveEnemies() {
		return (Object.entries(characters) as [CharacterKey, Character][]).filter(
			([key, char]) => key.startsWith('enemy') && char.hp > 0
		);
	}

	function isMultiTargetUseful() {
		return getAliveEnemies().length > 1;
	}

	function validEnhancementsForAction(actionId: string): EnhancementId[] {
		const action = actions.find((item) => item.id === actionId);
		if (!action) return [] as EnhancementId[];

		switch (action.type) {
			case 'damage':
				return ['power', 'crit', 'multi'];
			case 'healing':
				return ['power'];
			default:
				return [];
		}
	}

	function applyFocusDecay(character: Character): Character {
		if (character.focusDecay >= 3 && character.focus > 0) {
			return {
				...character,
				focus: Math.max(0, character.focus - 1),
				focusDecay: 0
			};
		}
		return character;
	}

	function processDoTEffects(character: Character, globalActions: number): Character {
		let newHp = character.hp;
		const activeEffects: Effect[] = [];

		character.effects.forEach((effect) => {
			if (effect.type === 'dot') {
				const updatedEffect = { ...effect };
				const actionsElapsed = globalActions - effect.startAction;
				let shouldTick = false;

				if (actionsElapsed === 1 && !effect.hasFirstTick) {
					shouldTick = true;
					updatedEffect.hasFirstTick = true;
					updatedEffect.nextTick = globalActions + rollNextTickInterval();
					logMessage(`${character.name} takes ${effect.damage} ${effect.name} damage (First Tick)`);
				} else if (globalActions === effect.nextTick) {
					shouldTick = true;
					updatedEffect.nextTick = globalActions + rollNextTickInterval();
					logMessage(`${character.name} takes ${effect.damage} ${effect.name} damage`);
				} else if (actionsElapsed === 12 && !effect.hasFinalTick) {
					shouldTick = true;
					updatedEffect.hasFinalTick = true;
					logMessage(`${character.name} takes ${effect.damage} ${effect.name} damage (Final Tick)`);
				}

				if (shouldTick) {
					newHp -= effect.damage;
				}

				if (actionsElapsed < 12) {
					activeEffects.push(updatedEffect);
				} else {
					logMessage(`${effect.name} effect on ${character.name} has ended`);
				}
			} else if (effect.duration > 0) {
				activeEffects.push({
					...effect,
					duration: effect.duration - 1
				});
			}
		});

		return {
			...character,
			hp: Math.max(0, newHp),
			effects: activeEffects
		};
	}

	function executeAction(
		actionId: string,
		attacker: Character,
		targets: PartialCharactersState,
		attackerKey: CharacterKey,
		options: { skipResourceCosts?: boolean } = {}
	) {
		const action = actions.find((item) => item.id === actionId);
		if (!action) {
			return {
				attacker: cloneCharacter(attacker),
				targets: cloneTargets(targets)
			};
		}

		const { skipResourceCosts = false } = options;

		let baseApCost = action.apCost;
		if (action.type === 'focus') {
			if (attacker.focus >= attacker.maxFocus) {
				logMessage(`${attacker.name} cannot build more focus`);
				return {
					attacker: cloneCharacter(attacker),
					targets: cloneTargets(targets)
				};
			}
			baseApCost = attacker.focus + 1;
		}

		const enhancementApCost = getEnhancementApCost(selectedEnhancements);
		const totalApCost = baseApCost + enhancementApCost;

		if (!skipResourceCosts && attacker.ap < totalApCost) {
			logMessage(`${attacker.name} lacks AP for ${action.name} (${totalApCost} needed)`);
			return {
				attacker: cloneCharacter(attacker),
				targets: cloneTargets(targets)
			};
		}

		let newAttacker = cloneCharacter(attacker);
		let newTargets = cloneTargets(targets);

		if (!skipResourceCosts) {
			newAttacker.ap = Math.max(0, newAttacker.ap - totalApCost);
		}

		const totalEnhancementStacks = getTotalEnhancementCount(selectedEnhancements);
		const enhancementManaCost = skipResourceCosts
			? 0
			: getEnhancementCost(totalEnhancementStacks, newAttacker.mana * 0.2);

		if (
			!skipResourceCosts &&
			totalEnhancementStacks > 0 &&
			newAttacker.mana < enhancementManaCost
		) {
			logMessage(`${attacker.name} lacks mana for enhancements (${enhancementManaCost} needed)`);
			return {
				attacker: cloneCharacter(attacker),
				targets: cloneTargets(targets)
			};
		}

		if (!skipResourceCosts && totalEnhancementStacks > 0) {
			newAttacker.mana = Math.max(0, newAttacker.mana - enhancementManaCost);
		}

		switch (action.type) {
			case 'damage': {
				let damage = attacker.baseDamage;

				if (attacker.focus > 0) {
					const focusMultiplier = getFocusMultiplier(attacker.focus);
					damage = Math.floor(damage * focusMultiplier);
					logMessage(
						`${attacker.name} uses ${attacker.focus} focus stacks (${focusMultiplier}x multiplier)`
					);
					newAttacker.focus = 0;
					newAttacker.focusDecay = 0;
				}

				const powerStacks = selectedEnhancements.power ?? 0;
				if (powerStacks > 0) {
					const powerMultiplier = Math.pow(1.5, powerStacks);
					damage = Math.floor(damage * powerMultiplier);
				}

				let isCrit = false;
				let critChance = 0.1;
				const critStacks = selectedEnhancements.crit ?? 0;
				if (critStacks > 0) {
					let tempCrit = critChance * 100;
					for (let i = 0; i < critStacks; i += 1) {
						tempCrit = Math.ceil(tempCrit * 1.25);
						if (tempCrit >= 100) {
							tempCrit = 100;
							break;
						}
					}
					critChance = tempCrit / 100;
				}

				if (Math.random() < critChance) {
					damage = Math.floor(damage * 2);
					isCrit = true;
				}

				const multiSelected = (selectedEnhancements.multi ?? 0) > 0;
				if (multiSelected && isMultiTargetUseful()) {
					damage = Math.floor(damage * 0.5);
					logMessage(
						`${attacker.name} ${action.name}s all enemies for ${damage} damage each${
							isCrit ? ' (CRIT!)' : ''
						}`
					);

					getAliveEnemies().forEach(([enemyKey, enemy]) => {
						const target = newTargets[enemyKey];
						if (target) {
							target.hp = Math.max(0, target.hp - damage);

							if (action.dot) {
								const dotDamage = Math.floor(damage * 0.3);
								const newDoT = {
									type: 'dot' as const,
									name: 'Burning',
									damage: dotDamage,
									startAction: globalActionCount + 1,
									nextTick: globalActionCount + 1 + rollNextTickInterval(),
									hasFirstTick: false,
									hasFinalTick: false
								};
								target.effects = [...target.effects, newDoT];
								logMessage(
									`${enemy.name} is burning for ${dotDamage} damage per tick over 12 actions`
								);
							}
						}
					});
				} else {
					const targetKey: CharacterKey = attackerKey === 'player' ? selectedTarget : 'player';
					const target = newTargets[targetKey];
					const targetName = target?.name ?? 'Unknown';

					logMessage(
						`${attacker.name} ${action.name}s ${targetName} for ${damage} damage${
							isCrit ? ' (CRIT!)' : ''
						}`
					);
					if (target) {
						target.hp = Math.max(0, target.hp - damage);

						if (action.dot) {
							const dotDamage = Math.floor(damage * 0.3);
							const newDoT = {
								type: 'dot' as const,
								name: 'Burning',
								damage: dotDamage,
								startAction: globalActionCount + 1,
								nextTick: globalActionCount + 1 + rollNextTickInterval(),
								hasFirstTick: false,
								hasFinalTick: false
							};
							target.effects = [...target.effects, newDoT];
							logMessage(
								`${targetName} is burning for ${dotDamage} damage per tick over 12 actions`
							);
						}
					}
				}

				newAttacker.focusDecay += 1;
				break;
			}
			case 'healing': {
				let healing = attacker.baseHealing;

				if (attacker.focus > 0) {
					const focusMultiplier = getFocusMultiplier(attacker.focus);
					healing = Math.floor(healing * focusMultiplier);
					logMessage(
						`${attacker.name} uses ${attacker.focus} focus stacks (${focusMultiplier}x multiplier)`
					);
					newAttacker.focus = 0;
					newAttacker.focusDecay = 0;
				}

				const healingPowerStacks = selectedEnhancements.power ?? 0;
				if (healingPowerStacks > 0) {
					const powerMultiplier = Math.pow(1.5, healingPowerStacks);
					healing = Math.floor(healing * powerMultiplier);
				}

				newAttacker.hp = Math.min(newAttacker.maxHp, newAttacker.hp + healing);
				logMessage(`${attacker.name} heals for ${healing} HP`);
				newAttacker.focusDecay += 1;
				break;
			}
			case 'focus': {
				const focusCost = baseApCost;
				newAttacker.focus += 1;
				newAttacker.focusDecay = 0;
				logMessage(
					`${attacker.name} builds focus (${newAttacker.focus}/${newAttacker.maxFocus}) - cost ${focusCost} AP`
				);
				break;
			}
			case 'defend': {
				logMessage(`${attacker.name} defends (50% damage reduction next turn)`);
				newAttacker.effects = [
					...newAttacker.effects,
					{
						type: 'buff' as const,
						name: 'Defending',
						effect: 'damage_reduction',
						value: 0.5,
						duration: 1
					}
				];
				newAttacker.ap = 0;
				newAttacker.focusDecay += 1;
				break;
			}
		}

		return { attacker: newAttacker, targets: newTargets };
	}

	function executeEnhancedAction() {
		if (!selectedAction || !hasAnyEnhancements(selectedEnhancements)) {
			return;
		}

		const attacker = characters[currentTurn];
		const action = actions.find((item) => item.id === selectedAction);
		if (!action) return;

		const enhancementApCost = getEnhancementApCost(selectedEnhancements);
		const totalApCost = action.apCost + enhancementApCost;

		if (attacker.ap < totalApCost) {
			logMessage(`${attacker.name} lacks AP for ${action.name} (${totalApCost} needed)`);
			return;
		}

		const totalEnhancementStacks = getTotalEnhancementCount(selectedEnhancements);
		const actualManaCost = getEnhancementCost(totalEnhancementStacks, attacker.mana * 0.2);
		if (attacker.mana < actualManaCost) {
			logMessage(`${attacker.name} lacks mana for enhancements (${actualManaCost} needed)`);
			return;
		}

		characters = {
			...characters,
			[currentTurn]: {
				...attacker,
				ap: attacker.ap - totalApCost,
				mana: Math.max(0, attacker.mana - actualManaCost)
			}
		};

		telegraphedActions = {
			...telegraphedActions,
			[currentTurn]: {
				actionId: selectedAction,
				enhancements: { ...selectedEnhancements },
				caster: currentTurn,
				targetKey: selectedTarget
			}
		};

		logMessage(`${attacker.name} prepares an enhanced ${action.name} (will fire next turn)`);

		clearEnhancements();
		enhancementMode = false;

		endTurn();
	}

	function executeTelegraphedAction(caster: CharacterKey) {
		const telegraphed = telegraphedActions[caster];
		if (!telegraphed) return;

		const attacker = characters[caster];
		const targets: PartialCharactersState =
			caster === 'player'
				? { enemy1: characters.enemy1, enemy2: characters.enemy2 }
				: { player: characters.player };

		const previousEnhancements = { ...selectedEnhancements };
		const previousTarget = selectedTarget;

		selectedEnhancements = { ...telegraphed.enhancements };
		if (telegraphed.targetKey) {
			selectedTarget = telegraphed.targetKey;
		}

		globalActionCount += 1;

		const result = executeAction(telegraphed.actionId, attacker, targets, caster, {
			skipResourceCosts: true
		});

		const updatedCharacters: CharactersState = {
			...characters,
			[caster]: processDoTEffects(result.attacker, globalActionCount)
		};

		(Object.entries(result.targets) as [CharacterKey, Character][]).forEach(([key, value]) => {
			updatedCharacters[key] = processDoTEffects(value, globalActionCount);
		});

		characters = updatedCharacters;

		selectedEnhancements = previousEnhancements;
		selectedTarget = previousTarget;

		const { [caster]: _removed, ...rest } = telegraphedActions;
		telegraphedActions = rest;

		const actionName = actions.find((item) => item.id === telegraphed.actionId)?.name ?? 'Action';
		logMessage(`${attacker.name}'s telegraphed ${actionName} fires!`);
	}

	function handleAction(actionId: string) {
		if (enhancementMode) {
			selectedAction = actionId;
			const valid = validEnhancementsForAction(actionId);
			const filtered = Object.fromEntries(
				Object.entries(selectedEnhancements).filter(
					([id, count]) => valid.includes(id as EnhancementId) && count > 0
				)
			) as SelectedEnhancements;
			if (!applyEnhancementSelection(filtered)) {
				selectedEnhancements = {};
			}
			return;
		}

		const attacker = characters[currentTurn];
		const targets: PartialCharactersState =
			currentTurn === 'player'
				? { enemy1: characters.enemy1, enemy2: characters.enemy2 }
				: { player: characters.player };

		globalActionCount += 1;

		const result = executeAction(actionId, attacker, targets, currentTurn);

		const updatedCharacters: CharactersState = {
			...characters,
			[currentTurn]: processDoTEffects(result.attacker, globalActionCount)
		};

		(Object.entries(result.targets) as [CharacterKey, Character][]).forEach(([key, value]) => {
			updatedCharacters[key] = processDoTEffects(value, globalActionCount);
		});

		characters = updatedCharacters;

		if (result.attacker.ap <= 0) {
			endTurn();
		}
	}

	function handleSelectTarget(key: CharacterKey) {
		selectedTarget = key;
	}

	function endTurn() {
		let nextTurn: CharacterKey;
		if (currentTurn === 'player') {
			nextTurn =
				characters.enemy1.hp > 0 ? 'enemy1' : characters.enemy2.hp > 0 ? 'enemy2' : 'player';
		} else if (currentTurn === 'enemy1') {
			nextTurn = characters.enemy2.hp > 0 ? 'enemy2' : 'player';
		} else {
			nextTurn = 'player';
		}

		const currentCharacterState = applyFocusDecay(characters[currentTurn]);
		const nextCharacterState = characters[nextTurn];
		const recoveredAP = Math.floor(nextCharacterState.maxAp * 0.6);

		characters = {
			...characters,
			[currentTurn]: currentCharacterState,
			[nextTurn]: {
				...nextCharacterState,
				ap: Math.min(nextCharacterState.maxAp, nextCharacterState.ap + recoveredAP),
				mana: Math.min(nextCharacterState.maxMana, nextCharacterState.mana + 5)
			}
		};

		currentTurn = nextTurn;
		if (nextTurn === 'player') {
			turnCount += 1;
		}

		enhancementMode = false;
		clearEnhancements();

		if (telegraphedActions[nextTurn]) {
			const caster = nextTurn;
			setTimeout(() => {
				executeTelegraphedAction(caster);
			}, 50);
		}
	}

	function resetCombat() {
		characters = createInitialCharacters();
		currentTurn = 'player';
		combatLog = [];
		turnCount = 1;
		globalActionCount = 0;
		selectedTarget = 'enemy1';
		telegraphedActions = {};
		enhancementMode = false;
		clearEnhancements();
	}
</script>

<div class="battle-sim-container">
	<div class="battle-header">
		<h1 class="battle-title">Combat Simulator</h1>
		<div class="battle-turn-meta">
			<span>Turn {turnCount}</span>
			<span class="separator" aria-hidden="true"></span>
			<span class="current-turn">{currentCharacter.name}'s Turn</span>
			<span class="separator" aria-hidden="true"></span>
			<span class="global-actions">Global Actions: {globalActionCount}</span>
		</div>
		{#if Object.keys(telegraphedActions).length > 0}
			<div class="telegraph-row">
				{#each Object.entries(telegraphedActions) as [entityKey, action] (entityKey)}
					<span class="telegraph-pill">
						⚡ {actions.find((item) => item.id === action.actionId)?.name} telegraphed for {characters[
							entityKey as CharacterKey
						]?.name}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
			{#each Object.entries(characters) as [key, char] (key)}
				<CharacterCard
					character={char}
					characterKey={key as CharacterKey}
					{currentTurn}
					{selectedTarget}
					{globalActionCount}
					telegraphedAction={telegraphedActions[key as CharacterKey]}
					{actions}
					canTarget={key.startsWith('enemy') && currentTurn === 'player'}
					selectTarget={handleSelectTarget}
				/>
			{/each}
		</div>

		<CombatLog logs={combatLog} />
	</div>

	{#if enhancementMode}
		<EnhancementPanel
			{baseEnhancements}
			{selectedEnhancements}
			selectedActionId={selectedAction}
			{actions}
			{currentCharacter}
			{validEnhancementsForAction}
			multiTargetAvailable={isMultiTargetUseful()}
			onIncrement={incrementEnhancement}
			onDecrement={decrementEnhancement}
			onToggle={toggleBinaryEnhancement}
			onExecute={executeEnhancedAction}
		/>
	{/if}

	<div class="control-section">
		<div class="control-bar">
			<button
				class="action-button accent"
				type="button"
				disabled={currentCharacter.ap <= 0 || currentCharacter.hp <= 0}
				onclick={() => {
					enhancementMode = !enhancementMode;
					if (!enhancementMode) {
						clearEnhancements();
					}
				}}
			>
				{enhancementMode ? 'Cancel Enhancements' : 'Add Enhancements'}
			</button>
			<button class="action-button neutral" type="button" onclick={endTurn}> End Turn </button>
			<button class="action-button danger" type="button" onclick={resetCombat}>
				<RotateCcw size={16} class="button-icon" />
				Reset
			</button>
		</div>

		<ActionGrid {actions} {currentCharacter} onAction={(actionId) => handleAction(actionId)} />
	</div>

	{#if playerDefeated || goblinsDefeated}
		<VictoryOverlay {playerDefeated} onReset={resetCombat} />
	{/if}
</div>

<style>
	.battle-sim-container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 1.5rem;
		background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		color: var(--text-primary);
		min-height: 100vh;
	}

	.battle-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.battle-title {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
		text-shadow: 0 4px 20px var(--shadow-medium);
	}

	.battle-turn-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.battle-turn-meta .current-turn {
		color: var(--color-warning);
		font-weight: 600;
	}

	.battle-turn-meta .global-actions {
		color: var(--color-info);
		font-weight: 500;
	}

	.battle-turn-meta .separator::before {
		content: '•';
		color: var(--text-muted);
	}

	.telegraph-row {
		margin-top: 0.75rem;
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.telegraph-pill {
		background: color-mix(in srgb, var(--color-warning) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-warning) 35%, transparent);
		color: var(--color-warning);
		font-size: 0.85rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		box-shadow: 0 4px 12px var(--shadow-light);
	}

	.control-section {
		margin-top: 2rem;
	}

	.control-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.action-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 600;
		border: 1px solid transparent;
		cursor: pointer;
		transition: var(--transition-theme);
	}

	.action-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.action-button.accent {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--text-inverse);
		box-shadow: 0 8px 24px var(--shadow-medium);
	}

	.action-button.accent:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.action-button.neutral {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border-color: var(--border-secondary);
	}

	.action-button.neutral:hover:not(:disabled) {
		border-color: var(--color-primary);
		box-shadow: 0 4px 12px var(--shadow-light);
	}

	.action-button.danger {
		background: var(--color-error);
		color: var(--text-inverse);
	}

	.action-button.danger:hover:not(:disabled) {
		filter: brightness(1.08);
	}

	.button-icon {
		width: 1rem;
		height: 1rem;
	}

	@media (max-width: 768px) {
		.battle-sim-container {
			padding: 1rem;
		}

		.control-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.action-button {
			justify-content: center;
			width: 100%;
		}
	}
</style>
