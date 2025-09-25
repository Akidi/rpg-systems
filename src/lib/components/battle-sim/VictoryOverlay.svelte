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

<div class="fixed inset-0 bg-black/70 flex items-center justify-center">
  <div class="bg-gray-800 p-8 rounded-lg text-center max-w-md">
    <h2 class="text-2xl font-bold mb-4">{title}</h2>
    <p class="text-gray-300 mb-6">{message}</p>
    <button
      class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
      type="button"
      on:click={handleReset}
    >
      Start New Combat
    </button>
  </div>
</div>
