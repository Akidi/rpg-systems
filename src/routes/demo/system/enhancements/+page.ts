// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  return {
    meta: {
      title: 'Enhancement System Calculator',
      description: 'Interactive calculator for spell enhancement systems in RPG games'
    }
  };
};