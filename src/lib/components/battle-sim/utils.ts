import type { EnhancementId, SelectedEnhancements } from './types';

export const rollNextTickInterval = () => Math.floor(Math.random() * 4) + 2;

export const getFocusMultiplier = (focus: number) => 1 + focus * 0.25;

export const getEnhancementCost = (enhancementCount: number, baseMana: number) => {
  if (enhancementCount <= 0) {
    return 0;
  }
  return Math.floor(baseMana * Math.pow(1.25, enhancementCount));
};

const STACKABLE_ENHANCEMENTS: EnhancementId[] = ['power', 'crit'];

export const isStackingEnhancement = (id: EnhancementId) => STACKABLE_ENHANCEMENTS.includes(id);

export const getTotalEnhancementCount = (selected: SelectedEnhancements) => {
  return Object.entries(selected).reduce((total, [id, count]) => {
    if (!count || count <= 0) {
      return total;
    }
    if (id === 'multi') {
      return total + 1;
    }
    return total + count;
  }, 0);
};

export const getEnhancementApCost = (selected: SelectedEnhancements) => {
  return Object.entries(selected).reduce((total, [id, count]) => {
    if (!count || count <= 0) {
      return total;
    }
    if (id === 'multi') {
      return total + 2;
    }
    return total + count;
  }, 0);
};

export const hasAnyEnhancements = (selected: SelectedEnhancements) => {
  return Object.values(selected).some((count) => !!count && count > 0);
};

