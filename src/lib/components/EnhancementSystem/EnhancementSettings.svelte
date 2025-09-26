<script lang="ts">
	import type { DamageSettings, StealSettings } from '$lib/types/enhancement';

	interface Props {
		damageSettings: DamageSettings;
		stealSettings: StealSettings;
		apRecoverySettings: { recoveryPercent: number };
	}

	let {
		damageSettings = $bindable(),
		stealSettings = $bindable(),
		apRecoverySettings = $bindable()
	}: Props = $props();
</script>

<div class="card">
	<h2 class="card-title">Enhancement Settings</h2>
	<div class="form-group">
		<label class="form-label" for="raw-damage-percent">Raw Damage % per stack:</label>
		<input
			id="raw-damage-percent"
			type="number"
			bind:value={damageSettings.rawDamagePercent}
			class="form-input"
			min="0"
			max="50"
			step="1"
		/>
	</div>
	<div class="form-group">
		<label class="form-label" for="ap-recovery-percent">AP Recovery % (Game Design: 20-40%):</label>
		<input
			id="ap-recovery-percent"
			type="number"
			bind:value={apRecoverySettings.recoveryPercent}
			class="form-input"
			min="20"
			max="40"
			step="5"
		/>
		<div class="form-hint">Percentage of enhancement AP cost recovered next turn</div>
	</div>
	<div class="form-group">
		<label class="form-label" for="life-steal-percent">Life Steal % per stack:</label>
		<input
			id="life-steal-percent"
			type="number"
			bind:value={stealSettings.lifeStealPercent}
			class="form-input"
			min="0"
			max="10"
			step="0.1"
		/>
	</div>
	<div class="form-group">
		<label class="form-label" for="mana-steal-percent">Mana Steal % per stack:</label>
		<input
			id="mana-steal-percent"
			type="number"
			bind:value={stealSettings.manaStealPercent}
			class="form-input"
			min="0"
			max="10"
			step="0.1"
		/>
	</div>
</div>
