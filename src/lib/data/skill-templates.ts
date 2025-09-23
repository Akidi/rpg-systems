// $lib/data/skill-templates.ts - Updated with new required fields

import type { SkillTemplate } from '$lib/types/skill-planner';

export const skillTemplates: SkillTemplate[] = [
  {
    id: 'stamina_template',
    name: 'Stamina (Utility)',
    description: 'Increases max HP and regeneration - demonstrates curve progression',
    skill: {
      id: 'template_stamina',
      name: 'Stamina',
      description: 'Increases max HP and regeneration',
      maxRank: 7,
      isCombatSkill: false,
      currentPoints: 0,
      effects: [
        {
          id: 'hp_bonus',
          name: 'Max HP Bonus',
          type: 'percentage',
          baseValue: 0,
          targetValue: 63,
          targetRank: 7,
          unit: '%',
          description: 'increase to maximum health',
          progressionType: 'curve',
          rankDeltas: []
        },
        {
          id: 'hp_regen',
          name: 'HP Regeneration',
          type: 'flat',
          baseValue: 0,
          targetValue: 2,
          targetRank: 7,
          unit: ' HP/turn',
          description: 'health restored per turn',
          progressionType: 'curve',
          rankDeltas: []
        },
        {
          id: 'healing_bonus',
          name: 'Healing Received',
          type: 'percentage',
          baseValue: 0,
          targetValue: 10,
          targetRank: 7,
          unit: '%',
          description: 'bonus to all healing received',
          progressionType: 'curve',
          rankDeltas: []
        }
      ],
      binaryEffects: [
        {
          id: 'death_resist',
          name: 'Death Resistance',
          description: 'Chance to survive fatal damage with 1 HP',
          unlockRank: 5,
          chancePercentage: 10
        }
      ]
    }
  },
  {
    id: 'focus_mastery_template',
    name: 'Focus Mastery (Combat)',
    description: 'Master the Focus system - demonstrates complex curve progression',
    skill: {
      id: 'template_focus_mastery',
      name: 'Focus Mastery',
      description: 'Master the Focus system for combat advantages',
      maxRank: 10,
      isCombatSkill: true,
      currentPoints: 0,
      effects: [
        {
          id: 'focus_defense',
          name: 'Focus Defense',
          type: 'percentage',
          baseValue: 0,
          targetValue: 10,
          targetRank: 10,
          unit: '%',
          description: 'defense per Focus stack',
          progressionType: 'curve',
          rankDeltas: []
        },
        {
          id: 'focus_dodge',
          name: 'Focus Dodge',
          type: 'percentage',
          baseValue: 0,
          targetValue: 4,
          targetRank: 10,
          unit: '%',
          description: 'dodge per Focus stack',
          progressionType: 'curve',
          rankDeltas: []
        },
        {
          id: 'focus_crit',
          name: 'Focus Critical',
          type: 'percentage',
          baseValue: 0,
          targetValue: 3,
          targetRank: 10,
          unit: '%',
          description: 'crit chance per Focus stack',
          progressionType: 'curve',
          rankDeltas: []
        }
      ],
      binaryEffects: [
        {
          id: 'focus_unlock',
          name: 'Focus Action Unlock',
          description: 'Unlocks Focus action (1-2-3-4 AP costs)',
          unlockRank: 1
        },
        {
          id: 'ap_reduction',
          name: 'AP Cost Reduction',
          description: 'Reduces all Focus AP costs by 1 (min 1 AP)',
          unlockRank: 4
        },
        {
          id: 'sequence_protection',
          name: 'Sequence Protection',
          description: 'Non-Focus sequences don\'t count toward stack loss',
          unlockRank: 6,
          chancePercentage: 75
        },
        {
          id: 'fifth_stack',
          name: '5th Focus Stack',
          description: 'Can build 5th Focus stack at 4 AP',
          unlockRank: 10
        }
      ]
    }
  },
  {
    id: 'combat_reflexes_template',
    name: 'Combat Reflexes (Utility)',
    description: 'Initiative and defensive improvements - demonstrates per-rank progression',
    skill: {
      id: 'template_combat_reflexes',
      name: 'Combat Reflexes',
      description: 'Initiative and defensive improvements with per-rank scaling',
      maxRank: 7,
      isCombatSkill: false,
      currentPoints: 0,
      effects: [
        {
          id: 'initiative_bonus',
          name: 'Initiative Bonus',
          type: 'flat',
          baseValue: 0,
          targetValue: 0, // Not used in per-rank
          targetRank: 7, // Not used in per-rank
          unit: ' initiative',
          description: 'bonus to turn order',
          progressionType: 'per-rank',
          rankDeltas: [
            { fromRank: 0, toRank: 1, deltaValue: 2, deltaType: 'flat' },
            { fromRank: 1, toRank: 2, deltaValue: 3, deltaType: 'flat' },
            { fromRank: 2, toRank: 3, deltaValue: 5, deltaType: 'flat' },
            { fromRank: 3, toRank: 4, deltaValue: 7, deltaType: 'flat' },
            { fromRank: 4, toRank: 5, deltaValue: 10, deltaType: 'flat' },
            { fromRank: 5, toRank: 6, deltaValue: 15, deltaType: 'flat' },
            { fromRank: 6, toRank: 7, deltaValue: 20, deltaType: 'flat' }
          ]
        },
        {
          id: 'dodge_chance',
          name: 'Dodge Chance',
          type: 'percentage',
          baseValue: 0,
          targetValue: 0, // Not used in per-rank
          targetRank: 7, // Not used in per-rank
          unit: '%',
          description: 'chance to avoid attacks',
          progressionType: 'per-rank',
          rankDeltas: [
            { fromRank: 0, toRank: 1, deltaValue: 2, deltaType: 'flat' },
            { fromRank: 1, toRank: 2, deltaValue: 3, deltaType: 'flat' },
            { fromRank: 2, toRank: 3, deltaValue: 4, deltaType: 'flat' },
            { fromRank: 3, toRank: 4, deltaValue: 5, deltaType: 'flat' },
            { fromRank: 4, toRank: 5, deltaValue: 6, deltaType: 'flat' },
            { fromRank: 5, toRank: 6, deltaValue: 7, deltaType: 'flat' },
            { fromRank: 6, toRank: 7, deltaValue: 8, deltaType: 'flat' }
          ]
        }
      ],
      binaryEffects: [
        {
          id: 'counter_attack',
          name: 'Counter Attack',
          description: 'Chance to counter-attack when dodging',
          unlockRank: 3,
          chancePercentage: 25
        },
        {
          id: 'bonus_turn',
          name: 'Bonus Turn',
          description: 'Small chance for bonus turn',
          unlockRank: 7,
          chancePercentage: 5
        }
      ]
    }
  },
  {
    id: 'bargaining_template',
    name: 'Bargaining (Utility)',
    description: 'Merchant interactions - demonstrates mixed progression types',
    skill: {
      id: 'template_bargaining',
      name: 'Bargaining',
      description: 'Improve merchant interactions and economy',
      maxRank: 7,
      isCombatSkill: false,
      currentPoints: 0,
      effects: [
        {
          id: 'price_improvement',
          name: 'Price Improvement',
          type: 'percentage',
          baseValue: 0,
          targetValue: 0, // Not used in per-rank
          targetRank: 7, // Not used in per-rank
          unit: '%',
          description: 'better buy/sell prices',
          progressionType: 'per-rank',
          rankDeltas: [
            { fromRank: 0, toRank: 1, deltaValue: 5, deltaType: 'flat' },
            { fromRank: 1, toRank: 2, deltaValue: 7, deltaType: 'flat' },
            { fromRank: 2, toRank: 3, deltaValue: 8, deltaType: 'flat' },
            { fromRank: 3, toRank: 4, deltaValue: 10, deltaType: 'flat' },
            { fromRank: 4, toRank: 5, deltaValue: 12, deltaType: 'flat' },
            { fromRank: 5, toRank: 6, deltaValue: 15, deltaType: 'flat' },
            { fromRank: 6, toRank: 7, deltaValue: 20, deltaType: 'flat' }
          ]
        }
      ],
      binaryEffects: [
        {
          id: 'rare_access',
          name: 'Rare Item Access',
          description: 'Access to rare merchant inventory',
          unlockRank: 5
        },
        {
          id: 'reputation_bonus',
          name: 'Merchant Reputation',
          description: 'Unlocks unique deals and exclusive items',
          unlockRank: 7
        }
      ]
    }
  },
  {
    id: 'fireball_template',
    name: 'Fireball (Combat)',
    description: 'Damage spell - demonstrates high-value per-rank progression',
    skill: {
      id: 'template_fireball',
      name: 'Fireball',
      description: 'Launch fireballs at enemies with escalating damage',
      maxRank: 10,
      isCombatSkill: true,
      currentPoints: 0,
      effects: [
        {
          id: 'fire_damage',
          name: 'Fire Damage',
          type: 'flat',
          baseValue: 20,
          targetValue: 0, // Not used in per-rank
          targetRank: 10, // Not used in per-rank
          unit: ' damage',
          description: 'base fire damage dealt',
          progressionType: 'per-rank',
          rankDeltas: [
            { fromRank: 0, toRank: 1, deltaValue: 30, deltaType: 'flat' },
            { fromRank: 1, toRank: 2, deltaValue: 50, deltaType: 'flat' },
            { fromRank: 2, toRank: 3, deltaValue: 75, deltaType: 'flat' },
            { fromRank: 3, toRank: 4, deltaValue: 100, deltaType: 'flat' },
            { fromRank: 4, toRank: 5, deltaValue: 125, deltaType: 'flat' },
            { fromRank: 5, toRank: 6, deltaValue: 20, deltaType: 'percentage' },
            { fromRank: 6, toRank: 7, deltaValue: 25, deltaType: 'percentage' },
            { fromRank: 7, toRank: 8, deltaValue: 30, deltaType: 'percentage' },
            { fromRank: 8, toRank: 9, deltaValue: 35, deltaType: 'percentage' },
            { fromRank: 9, toRank: 10, deltaValue: 40, deltaType: 'percentage' }
          ]
        }
      ],
      binaryEffects: [
        {
          id: 'burn_chance',
          name: 'Burn Effect',
          description: 'Chance to inflict burning damage over time',
          unlockRank: 3,
          chancePercentage: 25
        },
        {
          id: 'area_damage',
          name: 'Area of Effect',
          description: 'Fireball hits nearby enemies for 50% damage',
          unlockRank: 6
        },
        {
          id: 'piercing_flames',
          name: 'Piercing Flames',
          description: 'Ignores 50% of fire resistance',
          unlockRank: 9
        }
      ]
    }
  }
];