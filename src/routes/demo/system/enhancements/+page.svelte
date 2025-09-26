<script lang="ts">
	import EnhancementCalculator from '$lib/components/EnhancementSystem/EnhancementCalculator.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Enhancement System Calculator</title>
	<meta
		name="description"
		content="Interactive calculator for spell enhancement systems in RPG games"
	/>
</svelte:head>

<EnhancementCalculator />
