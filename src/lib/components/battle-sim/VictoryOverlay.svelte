<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let playerDefeated = false;

	const dispatch = createEventDispatcher<{ reset: void }>();

	const title = playerDefeated ? 'Defeat!' : 'Victory!';
	const message = playerDefeated
		? 'The goblins have bested you...'
		: 'You have defeated the goblins!';

	function handleReset() {
		dispatch('reset');
	}
</script>

<div class="victory-overlay">
	<div class="overlay-card">
		<h2 class="overlay-title">{title}</h2>
		<p class="overlay-message">{message}</p>
		<button class="overlay-button" type="button" on:click={handleReset}> Start New Combat </button>
	</div>
</div>

<style>
	.victory-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in oklab, var(--bg-overlay) 85%, transparent);
		z-index: 40;
		padding: 1.5rem;
	}

	.overlay-card {
		max-width: 26rem;
		width: 100%;
		text-align: center;
		border-radius: 1.25rem;
		padding: 2.5rem 2rem;
		background: linear-gradient(160deg, var(--bg-secondary) 10%, var(--bg-tertiary) 90%);
		border: 1px solid var(--border-primary);
		box-shadow: 0 24px 48px var(--shadow-heavy);
	}

	.overlay-title {
		margin: 0 0 1rem 0;
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 800;
		color: var(--text-primary);
	}

	.overlay-message {
		margin: 0 0 1.75rem 0;
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.overlay-button {
		border: none;
		border-radius: 0.9rem;
		padding: 0.8rem 2.8rem;
		font-size: 1rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--text-inverse);
		cursor: pointer;
		transition: var(--transition-theme);
		box-shadow: 0 14px 32px var(--shadow-medium);
	}

	.overlay-button:hover {
		filter: brightness(1.05);
	}

	@media (max-width: 480px) {
		.overlay-card {
			padding: 2rem 1.5rem;
		}

		.overlay-button {
			width: 100%;
		}
	}
</style>
