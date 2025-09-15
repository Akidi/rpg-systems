<script>
	import { gEvents } from "$lib/eventsystem";
	import { logger } from "$lib/logging";
  gEvents.on("game.stateChangeRequest", payload => {
    logger.info("events", "Received game.stateChangeRequest", payload);
  })
</script>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<button onclick={() => gEvents.emit("game.stateChangeRequest", {newState: "main_menu"})}>Main Menu</button>