<script lang="ts">
	import { Sword, Shield, Target, Heart, Flame } from 'lucide-svelte';
	import BattleHeader from './BattleHeader.svelte';
	import BattlefieldLayout from './BattlefieldLayout.svelte';
	import BattleControls from './BattleControls.svelte';
	import EnhancementPanel from './EnhancementPanel.svelte';
	import VictoryOverlay from './VictoryOverlay.svelte';
	import { CombatAI, AI_PRESETS } from './combat-ai';
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
		CombatLogEntry,
		CombatLogCategory,
		Enhancement,
		EnhancementId,
		Effect,
		SelectedEnhancements,
		TelegraphedAction
	} from './types';
	import type { AIDecision, AIConfig } from './combat-ai';

	type PartialCharactersState = Partial<Record<CharacterKey, Character>>;

	const baseEnhancements: Enhancement[] = [
		{ id: 'power', name: 'Raw Power', description: '+50% damage/healing per stack', cost: 1.25 },
		{ id: 'crit', name: 'Critical Chance', description: '+25% crit chance per stack', cost: 1.25 },
		{ id: 'multi', name: 'Multi-Target', description: 'Hit all enemies (50% damage)', cost: 1.25 }
	];

	const actions: ActionDefinition[] = [
		{ id: 'attack', name: 'Attack', apCost: 1, type: 'damage', icon: Sword },
		{ id: 'heal', name: 'Heal', apCost: 1, type: 'healing', icon: Heart },
		{ id: 'focus', name: 'Focus', apCost: 1, type: 'focus', icon: Target },
		{ id: 'defend', name: 'Defend', apCost: 1, type: 'defend', icon: Shield },
		{ id: 'fireball', name: 'Fireball', apCost: 1, type: 'damage', icon: Flame, dot: true }
	];
	const createAIFromPreset = (preset: AIConfig) =>
		new CombatAI({
			personality: { ...preset.personality },
			difficultyModifier: preset.difficultyModifier,
			randomnessFactor: preset.randomnessFactor
		});

	const aiControllers: Record<CharacterKey, CombatAI | null> = {
		player: null,
		enemy1: createAIFromPreset(AI_PRESETS.GOBLIN_ALPHA),
		enemy2: createAIFromPreset(AI_PRESETS.GOBLIN_BETA)
	};

	const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

	const createInitialCharacters = (): CharactersState => ({
		player: {
			name: 'Hero',
			maxHp: 100,
			hp: 100,
			maxMana: 50,
			mana: 50,
			maxAp: 3,
			ap: 3,
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
			maxAp: 3,
			ap: 3,
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
			maxAp: 3,
			ap: 3,
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
	let combatLog = $state<CombatLogEntry[]>([]);
	let turnCount = $state(1);
	let globalActionCount = $state(0);
	let selectedTarget = $state<CharacterKey>('enemy1');
	let enhancementMode = $state(false);
	let selectedEnhancements = $state<SelectedEnhancements>({});
	let selectedAction = $state<string | null>(null);
	let telegraphedActions = $state<Partial<Record<CharacterKey, TelegraphedAction>>>({});
	let isProcessingEnemyTurn = false;

	const currentCharacter = $derived(characters[currentTurn]);
	const playerDefeated = $derived(characters.player.hp <= 0);
	const goblinsDefeated = $derived(characters.enemy1.hp <= 0 && characters.enemy2.hp <= 0);
	const characterEntries = $derived((Object.entries(characters) as [CharacterKey, Character][]));
	const telegraphSummaries = $derived(
		(Object.entries(telegraphedActions) as [CharacterKey, TelegraphedAction][]).map(([key, action]) => {
			const actionName = actions.find((item) => item.id === action.actionId)?.name ?? 'Unknown action';
			const casterName = characters[key]?.name ?? 'Unknown caster';
			return {
				id: key,
				text: `⚠ ${actionName} telegraphed for ${casterName}`
			};
		})
	);


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

	function toggleEnhancementMode() {
		enhancementMode = !enhancementMode;
		if (!enhancementMode) {
			clearEnhancements();
		}
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

	const LOG_HISTORY_LIMIT = 20;

	type CombatLogPayload = {
		message: string;
		category: CombatLogCategory;
		actor?: string;
		target?: string;
		action?: string;
		source?: string;
		amount?: number;
		critical?: boolean;
		detail?: string;
		tags?: string[];
		turn?: number;
		actionNumber?: number;
	};

	function createLogId() {
		return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
	}

	function logMessage(entry: CombatLogPayload) {
		const resolved: CombatLogEntry = {
			id: createLogId(),
			turn: entry.turn ?? turnCount,
			actionNumber: entry.actionNumber ?? globalActionCount,
			category: entry.category,
			message: entry.message,
			actor: entry.actor,
			target: entry.target,
			action: entry.action,
			source: entry.source,
			amount: entry.amount,
			critical: entry.critical ?? false,
			detail: entry.detail,
			tags: entry.tags ?? []
		};

		combatLog = [resolved, ...combatLog].slice(0, LOG_HISTORY_LIMIT);
	}

	function getAliveEnemies() {
		return (Object.entries(characters) as [CharacterKey, Character][]).filter(
			([key, char]) => key.startsWith('enemy') && char.hp > 0
		);
	}

	function isMultiTargetUseful() {
		return getAliveEnemies().length > 1;
	}

	const isEnemyKey = (key: CharacterKey) => key.startsWith('enemy');

	function getOpponentEntriesFor(actorKey: CharacterKey): [CharacterKey, Character][] {
		const actorIsEnemy = isEnemyKey(actorKey);
		return (Object.entries(characters) as [CharacterKey, Character][]).filter(([key, char]) => {
			if (key === actorKey) return false;
			if (char.hp <= 0) return false;
			return actorIsEnemy ? !isEnemyKey(key) : isEnemyKey(key);
		});
	}

	function getAlliesFor(actorKey: CharacterKey): Character[] {
		const actorIsEnemy = isEnemyKey(actorKey);
		return (Object.entries(characters) as [CharacterKey, Character][])
			.filter(
				([key, char]) =>
					key !== actorKey && char.hp > 0 && (actorIsEnemy ? isEnemyKey(key) : !isEnemyKey(key))
			)
			.map(([, char]) => char);
	}

	function hasUsableActions(actorKey: CharacterKey): boolean {
		const actor = characters[actorKey];
		if (!actor || actor.hp <= 0 || actor.ap <= 0) {
			return false;
		}
		return actions.some((action) => actor.ap >= action.apCost);
	}

	function runEnemyAction(turnKey: CharacterKey, ai: CombatAI): boolean {
		const self = characters[turnKey];
		if (!self || self.hp <= 0 || self.ap <= 0) {
			return false;
		}

		const opponentEntries = getOpponentEntriesFor(turnKey);
		const allies = getAlliesFor(turnKey);
		const opponents = opponentEntries.map(([, char]) => char);

		const decision: AIDecision = ai.decideAction(self, allies, opponents, actions, {
			turnCount,
			globalActionCount
		});

		const action = actions.find((item) => item.id === decision.actionId);
		if (!action) {
			return false;
		}

		if (self.ap < action.apCost) {
			return false;
		}

		const enhancementsRaw = Object.fromEntries(
			Object.entries(decision.enhancements ?? {}).filter(([, count]) => !!count && count > 0)
		) as SelectedEnhancements;

		let enhancementsToApply = enhancementsRaw;

		if (Object.keys(enhancementsToApply).length > 0) {
			if (!canAffordSelection(enhancementsToApply, action.id, self)) {
				enhancementsToApply = {};
			} else {
				const stacks = getTotalEnhancementCount(enhancementsToApply);
				const manaCost = getEnhancementCost(stacks, self.mana * 0.2);
				if (stacks > 0 && manaCost > self.mana) {
					enhancementsToApply = {};
				}
			}
		}

		const previousEnhancements = { ...selectedEnhancements } as SelectedEnhancements;
		const previousAction = selectedAction;
		const previousTarget = selectedTarget;

		selectedAction = action.id;

		if (Object.keys(enhancementsToApply).length > 0) {
			if (!applyEnhancementSelection(enhancementsToApply)) {
				selectedEnhancements = {};
			}
		} else {
			selectedEnhancements = {};
		}

		const fallbackTarget: CharacterKey = isEnemyKey(turnKey) ? 'player' : 'enemy1';
		let chosenTarget: CharacterKey = fallbackTarget;

		if (opponentEntries.length > 0) {
			const index = decision.targetIndex ?? 0;
			const clampedIndex = Math.max(0, Math.min(opponentEntries.length - 1, index));
			chosenTarget = opponentEntries[clampedIndex][0];
		}

		const priorAp = self.ap;
		selectedTarget = chosenTarget;

		handleAction(action.id);

		const updated = characters[turnKey];
		const actionConsumed = Boolean(updated && updated.ap < priorAp);

		selectedEnhancements = { ...previousEnhancements };
		selectedAction = previousAction;
		selectedTarget = previousTarget;

		return actionConsumed;
	}

	async function processEnemyTurn(turnKey: CharacterKey) {
		const ai = aiControllers[turnKey];
		if (!ai) {
			isProcessingEnemyTurn = false;
			return;
		}

		if (playerDefeated || goblinsDefeated || currentTurn !== turnKey) {
			isProcessingEnemyTurn = false;
			return;
		}

		await wait(220);

		let iterations = 0;
		while (
			currentTurn === turnKey &&
			!playerDefeated &&
			!goblinsDefeated &&
			characters[turnKey]?.hp > 0 &&
			iterations < 6
		) {
			if (telegraphedActions[turnKey]) {
				await wait(120);
				continue;
			}

			const acted = runEnemyAction(turnKey, ai);
			iterations += 1;

			if (!acted) {
				if (currentTurn === turnKey) {
					endTurn();
				}
				break;
			}

			await wait(360);

			if (!characters[turnKey] || characters[turnKey].hp <= 0 || characters[turnKey].ap <= 0) {
				break;
			}
		}

		if (currentTurn === turnKey && !playerDefeated && !goblinsDefeated) {
			if (!hasUsableActions(turnKey)) {
				endTurn();
			}
		}

		const shouldQueueNext = currentTurn !== 'player' && !playerDefeated && !goblinsDefeated;

		isProcessingEnemyTurn = false;

		if (shouldQueueNext) {
			startEnemyProcessing(currentTurn);

		}
	}

	function startEnemyProcessing(turnKey: CharacterKey) {
		if (turnKey === 'player' || isProcessingEnemyTurn) {
			return;
		}
		isProcessingEnemyTurn = true;
		setTimeout(() => {
			processEnemyTurn(turnKey);
		}, 0);
	}

	$effect(() => {
		if (currentTurn !== 'player' && !playerDefeated && !goblinsDefeated) {
			startEnemyProcessing(currentTurn);
		}
	});

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
					logMessage({
						category: 'damage',
						message: `${effect.name} scorches ${character.name}`,
						actor: effect.name,
						target: character.name,
						source: effect.name,
						amount: effect.damage,
						detail: 'First tick',
						tags: ['DoT'],
						actionNumber: globalActions
					});
				} else if (globalActions === effect.nextTick) {
					shouldTick = true;
					updatedEffect.nextTick = globalActions + rollNextTickInterval();
					logMessage({
						category: 'damage',
						message: `${effect.name} damages ${character.name}`,
						actor: effect.name,
						target: character.name,
						source: effect.name,
						amount: effect.damage,
						tags: ['DoT'],
						actionNumber: globalActions
					});
				} else if (actionsElapsed === 12 && !effect.hasFinalTick) {
					shouldTick = true;
					updatedEffect.hasFinalTick = true;
					logMessage({
						category: 'damage',
						message: `${effect.name} sears ${character.name}`,
						actor: effect.name,
						target: character.name,
						source: effect.name,
						amount: effect.damage,
						detail: 'Final tick',
						tags: ['DoT'],
						actionNumber: globalActions
					});
				}

				if (shouldTick) {
					newHp -= effect.damage;
				}

				if (actionsElapsed < 12) {
					activeEffects.push(updatedEffect);
				} else {
					logMessage({
						category: 'effect',
						message: `${effect.name} on ${character.name} fades`,
						target: character.name,
						source: effect.name,
						tags: ['DoT'],
						actionNumber: globalActions
					});
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
				logMessage({
					category: 'focus',
					message: `${attacker.name} cannot build more focus`,
					actor: attacker.name,
					action: action.name,
					detail: `Focus capped at ${attacker.focus}/${attacker.maxFocus}`,
					tags: ['Focus']
				});
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
			logMessage({
				category: 'resource',
				message: `${attacker.name} lacks AP for ${action.name}`,
				actor: attacker.name,
				action: action.name,
				amount: totalApCost,
				detail: `Needs ${totalApCost} AP but only has ${attacker.ap}`,
				tags: ['AP']
			});
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
			logMessage({
				category: 'resource',
				message: `${attacker.name} lacks mana for enhancements`,
				actor: attacker.name,
				action: action.name,
				amount: enhancementManaCost,
				detail: `Needs ${enhancementManaCost} mana but has ${attacker.mana}`,
				tags: ['Mana', 'Enhancement']
			});
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
					logMessage({
						category: 'focus',
						message: `${attacker.name} channels stored focus`,
						actor: attacker.name,
						action: action.name,
						detail: `${attacker.focus} stack(s) → ${focusMultiplier.toFixed(2)}x damage`,
						tags: ['Focus']
					});
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
					getAliveEnemies().forEach(([enemyKey, enemy]) => {
						const target = newTargets[enemyKey];
						if (target) {
							target.hp = Math.max(0, target.hp - damage);

							const damageTags = ['AoE'];
							if (totalEnhancementStacks > 0) damageTags.push('Enhancement');
							if (isCrit) damageTags.push('Critical');

							logMessage({
								category: 'damage',
								message: `${attacker.name} hits ${enemy.name} with ${action.name}`,
								actor: attacker.name,
								target: enemy.name,
								action: action.name,
								amount: damage,
								critical: isCrit,
								detail: 'AoE strike (50% damage per target)',
								tags: damageTags
							});

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
								logMessage({
									category: 'effect',
									message: `${enemy.name} is burning`,
									actor: attacker.name,
									target: enemy.name,
									action: action.name,
									source: 'Burning',
									amount: dotDamage,
									detail: 'Deals damage over 12 actions',
									tags: ['DoT']
								});
							}
						}
					});
				} else {
					const targetKey: CharacterKey = attackerKey === 'player' ? selectedTarget : 'player';
					const target = newTargets[targetKey];
					const targetName = target?.name ?? 'Unknown';

					if (target) {
						target.hp = Math.max(0, target.hp - damage);

						const damageTags: string[] = [];
						if (totalEnhancementStacks > 0) damageTags.push('Enhancement');
						if (isCrit) damageTags.push('Critical');

						logMessage({
							category: 'damage',
							message: `${attacker.name} hits ${targetName} with ${action.name}`,
							actor: attacker.name,
							target: targetName,
							action: action.name,
							amount: damage,
							critical: isCrit,
							detail: isCrit ? 'Critical strike!' : undefined,
							tags: damageTags
						});

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
							logMessage({
								category: 'effect',
								message: `${targetName} is burning`,
								actor: attacker.name,
								target: targetName,
								action: action.name,
								source: 'Burning',
								amount: dotDamage,
								detail: 'Deals damage over 12 actions',
								tags: ['DoT']
							});
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
					logMessage({
						category: 'focus',
						message: `${attacker.name} channels focus into healing`,
						actor: attacker.name,
						action: action.name,
						detail: `${attacker.focus} stack(s) → ${focusMultiplier.toFixed(2)}x healing`,
						tags: ['Focus']
					});
					newAttacker.focus = 0;
					newAttacker.focusDecay = 0;
				}

				const healingPowerStacks = selectedEnhancements.power ?? 0;
				if (healingPowerStacks > 0) {
					const powerMultiplier = Math.pow(1.5, healingPowerStacks);
					healing = Math.floor(healing * powerMultiplier);
				}

				newAttacker.hp = Math.min(newAttacker.maxHp, newAttacker.hp + healing);
				const healingTags: string[] = [];
				if (healingPowerStacks > 0) healingTags.push('Enhancement');
				logMessage({
					category: 'healing',
					message: `${attacker.name} restores ${healing} HP`,
					actor: attacker.name,
					target: attacker.name,
					action: action.name,
					amount: healing,
					detail: `HP now ${newAttacker.hp}/${newAttacker.maxHp}`,
					tags: healingTags
				});
				newAttacker.focusDecay += 1;
				break;
			}
			case 'focus': {
				const focusCost = baseApCost;
				newAttacker.focus += 1;
				newAttacker.focusDecay = 0;
				logMessage({
					category: 'focus',
					message: `${attacker.name} builds focus`,
					actor: attacker.name,
					action: action.name,
					amount: newAttacker.focus,
					detail: `Focus ${newAttacker.focus}/${newAttacker.maxFocus} (cost ${focusCost} AP)`,
					tags: ['Focus']
				});
				break;
			}
			case 'defend': {
				logMessage({
					category: 'effect',
					message: `${attacker.name} takes a defensive stance`,
					actor: attacker.name,
					action: action.name,
					detail: '50% damage reduction next turn',
					tags: ['Buff']
				});
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
			logMessage({
				category: 'resource',
				message: `${attacker.name} lacks AP for ${action.name}`,
				actor: attacker.name,
				action: action.name,
				amount: totalApCost,
				detail: `Needs ${totalApCost} AP but only has ${attacker.ap}`,
				tags: ['AP', 'Enhancement']
			});
			return;
		}

		const totalEnhancementStacks = getTotalEnhancementCount(selectedEnhancements);
		const actualManaCost = getEnhancementCost(totalEnhancementStacks, attacker.mana * 0.2);
		if (attacker.mana < actualManaCost) {
			logMessage({
				category: 'resource',
				message: `${attacker.name} lacks mana for enhancements`,
				actor: attacker.name,
				action: action.name,
				amount: actualManaCost,
				detail: `Needs ${actualManaCost} mana but has ${attacker.mana}`,
				tags: ['Mana', 'Enhancement']
			});
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

		const telegraphTargetName =
			currentTurn === 'player'
				? characters[selectedTarget]?.name ?? selectedTarget
				: characters.player.name;

		logMessage({
			category: 'system',
			message: `${attacker.name} prepares an enhanced ${action.name}`,
			actor: attacker.name,
			action: action.name,
			target: telegraphTargetName,
			detail: 'Telegraphed attack will resolve next turn',
			tags: ['Telegraph', 'Enhancement']
		});

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
		const telegraphedTargetName = telegraphed.targetKey
			? characters[telegraphed.targetKey]?.name ?? telegraphed.targetKey
			: caster === 'player'
				? 'All enemies'
				: characters.player.name;
		const enhancementStacks = getTotalEnhancementCount(telegraphed.enhancements);
		const telegraphTags = enhancementStacks > 0 ? ['Telegraph', 'Enhancement'] : ['Telegraph'];
		logMessage({
			category: 'system',
			message: `${attacker.name}'s telegraphed ${actionName} fires`,
			actor: attacker.name,
			action: actionName,
			target: telegraphedTargetName,
			detail: 'Stored action resolves',
			tags: telegraphTags
		});
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
	<BattleHeader
		{turnCount}
		currentCharacterName={currentCharacter.name}
		{globalActionCount}
		telegraphEntries={telegraphSummaries}
	/>

	<BattlefieldLayout
		characterEntries={characterEntries}
		{currentTurn}
		{selectedTarget}
		{globalActionCount}
		telegraphedActions={telegraphedActions}
		{actions}
		combatLog={combatLog}
		onSelectTarget={handleSelectTarget}
	/>

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

	<BattleControls
		{actions}
		currentCharacter={currentCharacter}
		enhancementMode={enhancementMode}
		onToggleEnhancements={toggleEnhancementMode}
		onEndTurn={endTurn}
		onReset={resetCombat}
		onAction={handleAction}
	/>

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

	@media (max-width: 768px) {
		.battle-sim-container {
			padding: 1rem;
		}
	}
</style>







