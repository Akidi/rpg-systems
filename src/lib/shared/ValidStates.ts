export type ValidStateMap = Record<ValidState, ValidState[]>

export const ValidStates = {
  UNINITIALIZED: "uninitialized",
  IDLE: "idle",
  MAINMENU: "main_menu",
  BEGINCOMBAT: "begin_combat",
  INCOMBAT: "in_combat",
  ENDCOMBAT: "end_combat",
} as const;

export type ValidState = typeof ValidStates[keyof typeof ValidStates];

export const ValidStateTransitions: ValidStateMap = {
  [ValidStates.UNINITIALIZED]: [ValidStates.MAINMENU, ValidStates.IDLE],
  [ValidStates.IDLE]: [ValidStates.IDLE,ValidStates.MAINMENU],
  [ValidStates.MAINMENU]: [ValidStates.IDLE, ValidStates.MAINMENU],
  [ValidStates.BEGINCOMBAT]: [ValidStates.INCOMBAT],
  [ValidStates.INCOMBAT]: [ValidStates.ENDCOMBAT],
  [ValidStates.ENDCOMBAT]: [ValidStates.BEGINCOMBAT, ValidStates.IDLE, ValidStates.MAINMENU],
} as const;