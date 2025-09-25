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
    { id: 'fireball', name: 'Fireball', apCost: 4, type: 'damage', icon: Flame, dot: true }
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

  let characters: CharactersState = createInitialCharacters();
  let currentTurn: CharacterKey = 'player';
  let combatLog: string[] = [];
  let turnCount = 1;
  let globalActionCount = 0;
  let selectedTarget: CharacterKey = 'enemy1';
  let enhancementMode = false;
  let selectedEnhancements: SelectedEnhancements = {};
  let selectedAction: string | null = null;
  let telegraphedActions: Partial<Record<CharacterKey, TelegraphedAction>> = {};


  $: currentCharacter = characters[currentTurn];
  $: playerDefeated = characters.player.hp <= 0;
  $: goblinsDefeated = characters.enemy1.hp <= 0 && characters.enemy2.hp <= 0;

  function getEnhancementCount(id: EnhancementId) {
    return selectedEnhancements[id] ?? 0;
  }

  function updateEnhancementCount(id: EnhancementId, count: number) {
    if (count <= 0) {
      const { [id]: _removed, ...rest } = selectedEnhancements;
      selectedEnhancements = rest;
      return;
    }
    selectedEnhancements = { ...selectedEnhancements, [id]: count };
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
    attackerKey: CharacterKey
  ) {
    const action = actions.find((item) => item.id === actionId);
    if (!action || attacker.ap < action.apCost) {
      return {
        attacker: cloneCharacter(attacker),
        targets: cloneTargets(targets)
      };
    }

    let newAttacker = cloneCharacter(attacker);
    let newTargets = cloneTargets(targets);

    newAttacker.ap -= action.apCost;

    const totalEnhancementStacks = getTotalEnhancementCount(selectedEnhancements);
    const actualManaCost = getEnhancementCost(
      totalEnhancementStacks,
      newAttacker.mana * 0.2
    );

    if (totalEnhancementStacks > 0 && newAttacker.mana < actualManaCost) {
      logMessage(`${attacker.name} lacks mana for enhancements (${actualManaCost} needed)`);
      return {
        attacker: cloneCharacter(attacker),
        targets: cloneTargets(targets)
      };
    }

    if (totalEnhancementStacks > 0) {
      newAttacker.mana = Math.max(0, newAttacker.mana - actualManaCost);
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
                logMessage(`${enemy.name} is burning for ${dotDamage} damage per tick over 12 actions`);
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
              logMessage(`${targetName} is burning for ${dotDamage} damage per tick over 12 actions`);
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
        const focusCost = newAttacker.focus + 1;
        if (newAttacker.ap >= focusCost && newAttacker.focus < newAttacker.maxFocus) {
          newAttacker.ap = newAttacker.ap - focusCost + action.apCost;
          newAttacker.focus += 1;
          newAttacker.focusDecay = 0;
          logMessage(
            `${attacker.name} builds focus (${newAttacker.focus}/${newAttacker.maxFocus}) - cost ${focusCost} AP`
          );
        } else {
          logMessage(`${attacker.name} cannot build more focus`);
        }
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

    if (attacker.ap < action.apCost) {
      logMessage(`${attacker.name} lacks AP for ${action.name} (${action.apCost} needed)`);
      return;
    }

    const totalEnhancementStacks = getTotalEnhancementCount(selectedEnhancements);
    const actualManaCost = getEnhancementCost(
      totalEnhancementStacks,
      attacker.mana * 0.2
    );
    if (attacker.mana < actualManaCost) {
      logMessage(`${attacker.name} lacks mana for enhancements (${actualManaCost} needed)`);
      return;
    }

    characters = {
      ...characters,
      [currentTurn]: {
        ...attacker,
        ap: attacker.ap - action.apCost,
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
    const targets: PartialCharactersState = caster === 'player'
      ? { enemy1: characters.enemy1, enemy2: characters.enemy2 }
      : { player: characters.player };

    const previousEnhancements = { ...selectedEnhancements };
    const previousTarget = selectedTarget;

    selectedEnhancements = { ...telegraphed.enhancements };
    if (telegraphed.targetKey) {
      selectedTarget = telegraphed.targetKey;
    }

    globalActionCount += 1;

    const result = executeAction(telegraphed.actionId, attacker, targets, caster);

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
      selectedEnhancements = Object.fromEntries(
        Object.entries(selectedEnhancements).filter(
          ([id, count]) => valid.includes(id as EnhancementId) && count > 0
        )
      ) as SelectedEnhancements;
      return;
    }

    const attacker = characters[currentTurn];
    const targets: PartialCharactersState = currentTurn === 'player'
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

  function endTurn() {
    let nextTurn: CharacterKey;
    if (currentTurn === 'player') {
      nextTurn = characters.enemy1.hp > 0 ? 'enemy1'
        : characters.enemy2.hp > 0 ? 'enemy2'
          : 'player';
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

<div class="max-w-7xl mx-auto p-4 bg-gray-900 text-white min-h-screen">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2 text-center">Combat Simulator</h1>
    <div class="text-center text-gray-400">
      <span>Turn {turnCount} - </span>
      <span class="text-yellow-400 font-semibold">{currentCharacter.name}'s Turn</span>
      <span class="ml-4 text-blue-400">Global Actions: {globalActionCount}</span>
      {#if Object.keys(telegraphedActions).length > 0}
        <div class="text-sm mt-1">
          {#each Object.entries(telegraphedActions) as [entityKey, action] (entityKey)}
            <span class="ml-4 text-orange-400">
              ⚡ {actions.find((item) => item.id === action.actionId)?.name} telegraphed for {characters[entityKey as CharacterKey]?.name}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each Object.entries(characters) as [key, char] (key)}
        <CharacterCard
          character={char}
          characterKey={key as CharacterKey}
          currentTurn={currentTurn}
          selectedTarget={selectedTarget}
          globalActionCount={globalActionCount}
          telegraphedAction={telegraphedActions[key as CharacterKey]}
          actions={actions}
          canTarget={key.startsWith('enemy') && currentTurn === 'player'}
          on:selectTarget={(event) => {
            selectedTarget = event.detail.key;
          }}
        />
      {/each}
    </div>

    <CombatLog logs={combatLog} />
  </div>

  {#if enhancementMode}
    <EnhancementPanel
      baseEnhancements={baseEnhancements}
      selectedEnhancements={selectedEnhancements}
      selectedActionId={selectedAction}
      actions={actions}
      currentCharacter={currentCharacter}
      validEnhancementsForAction={validEnhancementsForAction}
      multiTargetAvailable={isMultiTargetUseful()}
      on:increment={(event) => incrementEnhancement(event.detail.id)}
      on:decrement={(event) => decrementEnhancement(event.detail.id)}
      on:toggle={(event) => toggleBinaryEnhancement(event.detail.id, event.detail.value)}
      on:execute={executeEnhancedAction}
    />
  {/if}

  <div class="mt-6">
    <div class="flex items-center gap-4 mb-4">
      <button
        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        disabled={currentCharacter.ap <= 0 || currentCharacter.hp <= 0}
        on:click={() => {
          enhancementMode = !enhancementMode;
          if (!enhancementMode) {
            clearEnhancements();
          }
        }}
      >
        {enhancementMode ? 'Cancel Enhancements' : 'Add Enhancements'}
      </button>
      <button
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium"
        type="button"
        on:click={endTurn}
      >
        End Turn
      </button>
      <button
        class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium flex items-center gap-2"
        type="button"
        on:click={resetCombat}
      >
        <RotateCcw size={16} />
        Reset
      </button>
    </div>

    <ActionGrid
      actions={actions}
      currentCharacter={currentCharacter}
      on:action={(event) => handleAction(event.detail.id)}
    />
  </div>

  {#if playerDefeated || goblinsDefeated}
    <VictoryOverlay
      playerDefeated={playerDefeated}
      on:reset={resetCombat}
    />
  {/if}
</div>
