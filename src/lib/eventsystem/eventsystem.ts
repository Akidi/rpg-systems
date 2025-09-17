import { cuid } from '$lib/utils';
import { logger } from '$lib/logging';
import type { AppEvents } from '$lib/shared/AppEvents';

type EventHandler<TEvents, K extends keyof TEvents> = (payload: TEvents[K]) => void;

type EventListeners<TEvents> = Partial<{
	[K in keyof TEvents]: Map<string, EventHandler<TEvents, K>>;
}>;

class EventSystem<TEvents extends { [K in keyof TEvents]: unknown }> {
	private listeners: EventListeners<TEvents> = {};

	private getListeners<T extends keyof TEvents>(
		eventName: T
	): Map<string, EventHandler<TEvents, T>> {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = new Map();
		}
		return this.listeners[eventName]!;
	}

	on<T extends keyof TEvents>(eventName: T, handler: EventHandler<TEvents, T>): () => void {
		const id = cuid();
		this.getListeners(eventName).set(id, handler);

		logger.debug('events', `Registered listener for ${String(eventName)}`, { id });

		return () => this.off(eventName, id);
	}

	once<T extends keyof TEvents>(eventName: T, handler: EventHandler<TEvents, T>): () => void {
		const id = cuid();

		const onceHandler: EventHandler<TEvents, T> = (payload) => {
			handler(payload);
			this.off(eventName, id);
		};

		this.getListeners(eventName).set(id, onceHandler);

		logger.debug('events', `Registered one-time listener for ${String(eventName)}`, { id });

		return () => this.off(eventName, id);
	}

	private off(eventName: keyof TEvents, id: string): void {
		const success = this.listeners[eventName]?.delete(id);

		if (success) {
			logger.debug('events', `Removed listener for ${String(eventName)}`, { id });
		}
	}

	emit<T extends keyof TEvents>(eventName: T, payload: TEvents[T]): void {
		const listeners = this.listeners[eventName];

		if (listeners && listeners.size > 0) {
			logger.info(
				'events',
				`Emitting ${String(eventName)} to ${listeners.size} listener(s)`,
				payload
			);

			listeners.forEach((handler) => {
				try {
					handler(payload);
				} catch (error) {
					logger.error('events', `Error in listener for ${String(eventName)}`, { error, payload });
				}
			});
		} else {
			logger.debug('events', `No listeners for ${String(eventName)}`, payload);
		}
	}

	clear(eventName?: keyof TEvents): void {
		if (eventName) {
			this.listeners[eventName]?.clear();
			logger.info('events', `Cleared all listeners for ${String(eventName)}`);
		} else {
			this.listeners = {};
			logger.info('events', 'Cleared all listeners');
		}
	}

	hasListeners<T extends keyof TEvents>(eventName: T): boolean {
		const listeners = this.listeners[eventName];
		return listeners ? listeners.size > 0 : false;
	}

	getListenerCount<T extends keyof TEvents>(eventName: T): number {
		return this.listeners[eventName]?.size ?? 0;
	}

	debugInfo(): void {
		const eventCounts: Record<string, number> = {};
		let totalListeners = 0;

		(Object.keys(this.listeners) as Array<keyof TEvents>).forEach(eventName => {
      const listeners = this.listeners[eventName];
      if (listeners) {
        const count = listeners.size;
        eventCounts[String(eventName)] = count;
        totalListeners += count;
      }
    });

		console.table([{
			'Total Events': Object.keys(this.listeners).length,
			'Total Listeners': totalListeners,
			'Events with Listeners': Object.keys(eventCounts).length
		}]);

		if (Object.keys(eventCounts).length > 0) {
			console.table([eventCounts]);
		}
	}
}

export const gEvents = new EventSystem<AppEvents>();
