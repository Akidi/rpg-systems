import type { ValidState } from './ValidStates';

export type StateChangeRejectionReason = 'invalid_state' | 'invalid_transition';

export interface AppEvents {
	'game.stateChanged': { previousState: ValidState; newState: ValidState };
	'game.stateChangeRequest': { newState: ValidState };
	'game.stateChangeStarted': { previousState: ValidState; requestedState: ValidState };
	'game.stateChangeRejected': {
		previousState: ValidState;
		requestedState: ValidState;
		reason: StateChangeRejectionReason;
		message?: string;
	};
}

export type AppEventName = keyof AppEvents;
