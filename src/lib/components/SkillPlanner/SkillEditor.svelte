<!-- $lib/components/SkillPlanner/SkillEditor.svelte - Updated with dual progression system -->
<script lang="ts">
	import type {
		Skill,
		EffectType,
		BinaryEffect,
		RankDelta,
		ProgressionType,
		DeltaType
	} from '$lib/types/skill-planner';

	interface Props {
		skill: Skill;
		onUpdate: (skill: Skill) => void;
	}

	let { skill, onUpdate }: Props = $props();

	function updateSkill(field: keyof Skill, value: any) {
		skill = { ...skill, [field]: value };
		onUpdate(skill);
	}

	function updateEffect(index: number, field: keyof EffectType, value: any) {
		const effects = [...skill.effects];
		effects[index] = { ...effects[index], [field]: value };
		updateSkill('effects', effects);
	}

	function updateEffectProgressionType(index: number, type: ProgressionType) {
		const effects = [...skill.effects];
		const effect = effects[index];

		// Initialize appropriate fields based on type
		if (type === 'per-rank' && (!effect.rankDeltas || effect.rankDeltas.length === 0)) {
			// Create default rank deltas
			const deltas: RankDelta[] = [];
			for (let rank = 0; rank < skill.maxRank; rank++) {
				deltas.push({
					fromRank: rank,
					toRank: rank + 1,
					deltaValue: 10,
					deltaType: 'flat'
				});
			}
			effects[index] = {
				...effect,
				progressionType: type,
				rankDeltas: deltas
			};
		} else {
			effects[index] = { ...effect, progressionType: type };
		}

		updateSkill('effects', effects);
	}

	function updateRankDelta(
		effectIndex: number,
		deltaIndex: number,
		field: keyof RankDelta,
		value: any
	) {
		const effects = [...skill.effects];
		const rankDeltas = [...effects[effectIndex].rankDeltas];
		rankDeltas[deltaIndex] = { ...rankDeltas[deltaIndex], [field]: value };
		effects[effectIndex] = { ...effects[effectIndex], rankDeltas };
		updateSkill('effects', effects);
	}

	function addRankDelta(effectIndex: number) {
		const effects = [...skill.effects];
		const effect = effects[effectIndex];
		const currentDeltas = effect.rankDeltas || [];

		const newDelta: RankDelta = {
			fromRank: currentDeltas.length,
			toRank: currentDeltas.length + 1,
			deltaValue: 10,
			deltaType: 'flat'
		};

		effects[effectIndex] = {
			...effect,
			rankDeltas: [...currentDeltas, newDelta]
		};

		updateSkill('effects', effects);
	}

	function removeRankDelta(effectIndex: number, deltaIndex: number) {
		const effects = [...skill.effects];
		const rankDeltas = effects[effectIndex].rankDeltas.filter((_, i) => i !== deltaIndex);
		effects[effectIndex] = { ...effects[effectIndex], rankDeltas };
		updateSkill('effects', effects);
	}

	function addEffect() {
		const newEffect: EffectType = {
			id: `effect_${Date.now()}`,
			name: 'New Effect',
			type: 'percentage',
			unit: '%',
			description: 'New effect description',
			progressionType: 'curve',
			baseValue: 0,
			targetValue: 100,
			targetRank: skill.maxRank,
			rankDeltas: []
		};
		updateSkill('effects', [...skill.effects, newEffect]);
	}

	function removeEffect(index: number) {
		const effects = skill.effects.filter((_, i) => i !== index);
		updateSkill('effects', effects);
	}

	function updateBinaryEffect(index: number, field: keyof BinaryEffect, value: any) {
		const binaryEffects = [...skill.binaryEffects];
		binaryEffects[index] = { ...binaryEffects[index], [field]: value };
		updateSkill('binaryEffects', binaryEffects);
	}

	function addBinaryEffect() {
		const newBinary: BinaryEffect = {
			id: `binary_${Date.now()}`,
			name: 'New Binary Effect',
			description: 'New binary effect description',
			unlockRank: Math.max(1, Math.floor(skill.maxRank / 2))
		};
		updateSkill('binaryEffects', [...skill.binaryEffects, newBinary]);
	}

	function removeBinaryEffect(index: number) {
		const binaryEffects = skill.binaryEffects.filter((_, i) => i !== index);
		updateSkill('binaryEffects', binaryEffects);
	}

	function generateRankDeltasFromCurve(effectIndex: number) {
		const effect = skill.effects[effectIndex];
		if (effect.progressionType !== 'curve') return;

		const deltas: RankDelta[] = [];
		const totalIncrease = effect.targetValue - effect.baseValue;
		const increasePerRank = totalIncrease / skill.maxRank;

		for (let rank = 0; rank < skill.maxRank; rank++) {
			deltas.push({
				fromRank: rank,
				toRank: rank + 1,
				deltaValue: Math.round(increasePerRank * 10) / 10, // Round to 1 decimal
				deltaType: 'flat'
			});
		}

		const effects = [...skill.effects];
		effects[effectIndex] = {
			...effect,
			progressionType: 'per-rank',
			rankDeltas: deltas
		};
		updateSkill('effects', effects);
	}
</script>

<div class="skill-editor">
	<div class="skill-header">
		<h3>Skill Editor</h3>
	</div>

	<div class="basic-info">
		<label>
			Name:
			<input
				type="text"
				value={skill.name}
				oninput={(e) => updateSkill('name', e.currentTarget.value)}
			/>
		</label>

		<label>
			Description:
			<textarea
				value={skill.description}
				oninput={(e) => updateSkill('description', e.currentTarget.value)}
				rows="2"
			></textarea>
		</label>

		<div class="inline-fields">
			<label>
				Max Rank:
				<input
					type="number"
					min="1"
					max="20"
					value={skill.maxRank}
					oninput={(e) => updateSkill('maxRank', parseInt(e.currentTarget.value))}
				/>
			</label>

			<label class="checkbox-label">
				<input
					type="checkbox"
					checked={skill.isCombatSkill}
					onchange={(e) => updateSkill('isCombatSkill', e.currentTarget.checked)}
				/>
				Combat Skill (Enhanceable)
			</label>
		</div>
	</div>

	<div class="effects-section">
		<div class="section-header">
			<h4>Effects</h4>
			<button onclick={addEffect} class="btn-add">Add Effect</button>
		</div>

		{#each skill.effects as effect, index}
			<div class="effect-item">
				<div class="effect-header">
					<input
						type="text"
						value={effect.name}
						oninput={(e) => updateEffect(index, 'name', e.currentTarget.value)}
						placeholder="Effect name"
						class="effect-name"
					/>
					<button onclick={() => removeEffect(index)} class="btn-remove">×</button>
				</div>

				<div class="effect-fields">
					<label>
						Type:
						<select
							value={effect.type}
							onchange={(e) => updateEffect(index, 'type', e.currentTarget.value)}
						>
							<option value="percentage">Percentage</option>
							<option value="flat">Flat</option>
							<option value="binary">Binary</option>
							<option value="chance">Chance</option>
						</select>
					</label>

					<label>
						Unit:
						<input
							type="text"
							value={effect.unit}
							oninput={(e) => updateEffect(index, 'unit', e.currentTarget.value)}
							placeholder="%, points, etc."
						/>
					</label>

					<label>
						Progression Type:
						<select
							value={effect.progressionType}
							onchange={(e) =>
								updateEffectProgressionType(index, e.currentTarget.value as ProgressionType)}
						>
							<option value="curve">Smooth Curve</option>
							<option value="per-rank">Per-Rank Deltas</option>
						</select>
					</label>
				</div>

				<label class="description-field">
					Description:
					<input
						type="text"
						value={effect.description}
						oninput={(e) => updateEffect(index, 'description', e.currentTarget.value)}
						placeholder="Effect description"
					/>
				</label>

				<!-- Curve-based progression fields -->
				{#if effect.progressionType === 'curve'}
					<div class="progression-fields curve-fields">
						<label>
							Base Value:
							<input
								type="number"
								step="0.1"
								value={effect.baseValue}
								oninput={(e) => updateEffect(index, 'baseValue', parseFloat(e.currentTarget.value))}
							/>
						</label>

						<label>
							Target Value:
							<input
								type="number"
								step="0.1"
								value={effect.targetValue}
								oninput={(e) =>
									updateEffect(index, 'targetValue', parseFloat(e.currentTarget.value))}
							/>
						</label>

						<label>
							Target Rank:
							<input
								type="number"
								min="1"
								max={skill.maxRank}
								value={effect.targetRank}
								oninput={(e) => updateEffect(index, 'targetRank', parseInt(e.currentTarget.value))}
							/>
						</label>

						<button onclick={() => generateRankDeltasFromCurve(index)} class="btn-convert">
							Convert to Per-Rank
						</button>
					</div>
				{/if}

				<!-- Per-rank progression fields -->
				{#if effect.progressionType === 'per-rank'}
					<div class="progression-fields per-rank-fields">
						<div class="per-rank-header">
							<label>
								Base Value:
								<input
									type="number"
									step="0.1"
									value={effect.baseValue}
									oninput={(e) =>
										updateEffect(index, 'baseValue', parseFloat(e.currentTarget.value))}
								/>
							</label>
							<button onclick={() => addRankDelta(index)} class="btn-add-delta"
								>Add Rank Delta</button
							>
						</div>

						<div class="rank-deltas">
							{#each effect.rankDeltas as delta, deltaIndex}
								<div class="delta-item">
									<div class="delta-header">
										<span class="delta-label">Rank {delta.fromRank} → {delta.toRank}</span>
										<button
											onclick={() => removeRankDelta(index, deltaIndex)}
											class="btn-remove-small">×</button
										>
									</div>

									<div class="delta-fields">
										<label>
											From Rank:
											<input
												type="number"
												min="0"
												max={skill.maxRank - 1}
												value={delta.fromRank}
												oninput={(e) =>
													updateRankDelta(
														index,
														deltaIndex,
														'fromRank',
														parseInt(e.currentTarget.value)
													)}
											/>
										</label>

										<label>
											To Rank:
											<input
												type="number"
												min="1"
												max={skill.maxRank}
												value={delta.toRank}
												oninput={(e) =>
													updateRankDelta(
														index,
														deltaIndex,
														'toRank',
														parseInt(e.currentTarget.value)
													)}
											/>
										</label>

										<label>
											Delta Value:
											<input
												type="number"
												step="0.1"
												value={delta.deltaValue}
												oninput={(e) =>
													updateRankDelta(
														index,
														deltaIndex,
														'deltaValue',
														parseFloat(e.currentTarget.value)
													)}
											/>
										</label>

										<label>
											Delta Type:
											<select
												value={delta.deltaType}
												onchange={(e) =>
													updateRankDelta(
														index,
														deltaIndex,
														'deltaType',
														e.currentTarget.value as DeltaType
													)}
											>
												<option value="flat">Flat (+X)</option>
												<option value="percentage">Percentage (+X%)</option>
											</select>
										</label>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="binary-effects-section">
		<div class="section-header">
			<h4>Binary Effects (Unlocked at Ranks)</h4>
			<button onclick={addBinaryEffect} class="btn-add">Add Binary Effect</button>
		</div>

		{#each skill.binaryEffects as binary, index}
			<div class="binary-item">
				<div class="binary-header">
					<input
						type="text"
						value={binary.name}
						oninput={(e) => updateBinaryEffect(index, 'name', e.currentTarget.value)}
						placeholder="Binary effect name"
						class="binary-name"
					/>
					<button onclick={() => removeBinaryEffect(index)} class="btn-remove">×</button>
				</div>

				<div class="binary-fields">
					<label>
						Unlock Rank:
						<input
							type="number"
							min="1"
							max={skill.maxRank}
							value={binary.unlockRank}
							oninput={(e) =>
								updateBinaryEffect(index, 'unlockRank', parseInt(e.currentTarget.value))}
						/>
					</label>

					<label>
						Chance % (optional):
						<input
							type="number"
							min="0"
							max="100"
							value={binary.chancePercentage || ''}
							oninput={(e) =>
								updateBinaryEffect(
									index,
									'chancePercentage',
									e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined
								)}
							placeholder="Leave empty if no chance"
						/>
					</label>
				</div>

				<label class="description-field">
					Description:
					<textarea
						value={binary.description}
						oninput={(e) => updateBinaryEffect(index, 'description', e.currentTarget.value)}
						placeholder="Binary effect description"
						rows="2"
					></textarea>
				</label>
			</div>
		{/each}
	</div>
</div>

<style>
	.skill-editor {
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 0;
		margin-bottom: 1.5rem;
		transition: var(--transition-theme);
		box-shadow: 0 8px 32px var(--shadow-light);
		overflow: hidden;
		position: relative;
	}

	.skill-editor::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--color-primary),
			var(--color-secondary),
			var(--color-accent)
		);
		border-radius: 16px 16px 0 0;
	}

	.editor-header {
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
		padding: 1.5rem 2rem;
		color: var(--text-inverse);
		position: relative;
		overflow: hidden;
	}

	.editor-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			135deg,
			transparent,
			transparent 15px,
			rgba(255, 255, 255, 0.05) 15px,
			rgba(255, 255, 255, 0.05) 30px
		);
		animation: editorPattern 25s linear infinite;
	}

	@keyframes editorPattern {
		0% {
			transform: translate(-30px, -30px);
		}
		100% {
			transform: translate(30px, 30px);
		}
	}

	.skill-header h3 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		z-index: 2;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.editor-content {
		padding: 2rem;
		max-height: 70vh;
		overflow-y: auto;
	}

	.editor-content::-webkit-scrollbar {
		width: 8px;
	}

	.editor-content::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: 4px;
	}

	.editor-content::-webkit-scrollbar-thumb {
		background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
		border-radius: 4px;
	}

	/* Basic info section */
	.basic-info {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
		border: 2px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 16px var(--shadow-light);
		position: relative;
	}

	.basic-info::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-success), var(--color-primary));
	}

	.basic-info label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.inline-fields {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.5rem;
		align-items: end;
	}

	.checkbox-label {
		flex-direction: row !important;
		align-items: center;
		gap: 0.75rem;
		background: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--border-primary);
		transition: var(--transition-theme);
	}

	.checkbox-label:hover {
		border-color: var(--color-primary);
	}

	.checkbox-label input[type='checkbox'] {
		width: 20px;
		height: 20px;
		accent-color: var(--color-primary);
	}

	.basic-info input,
	.basic-info textarea {
		padding: 0.75rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		color: var(--text-primary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		transition: var(--transition-theme);
		box-shadow: inset 0 2px 4px var(--shadow-light);
	}

	.basic-info input:focus,
	.basic-info textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow:
			inset 0 2px 4px var(--shadow-light),
			0 0 0 3px rgba(var(--color-primary), 0.2);
		transform: scale(1.01);
	}

	/* Section styling */
	.effects-section,
	.binary-effects-section {
		margin-bottom: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--text-inverse);
		border-radius: 12px;
		box-shadow: 0 4px 16px var(--shadow-medium);
		position: relative;
		overflow: hidden;
	}

	.section-header::before {
		content: '';
		position: absolute;
		top: 0;
		right: -20px;
		width: 40px;
		height: 100%;
		background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		animation: sectionShine 3s linear infinite;
	}

	@keyframes sectionShine {
		0% {
			transform: translateX(-60px);
		}
		100% {
			transform: translateX(200px);
		}
	}

	.section-header h4 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		z-index: 2;
	}

	.btn-add,
	.btn-add-delta,
	.btn-convert {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-inverse);
		border: 2px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		backdrop-filter: blur(10px);
		transition: var(--transition-theme);
		position: relative;
		z-index: 2;
		overflow: hidden;
	}

	.btn-add::before,
	.btn-add-delta::before,
	.btn-convert::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.4s;
	}

	.btn-add:hover::before,
	.btn-add-delta:hover::before,
	.btn-convert:hover::before {
		left: 100%;
	}

	.btn-add:hover,
	.btn-add-delta:hover,
	.btn-convert:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	/* Effect/Binary items */
	.effect-item,
	.binary-item {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
		border: 2px solid var(--border-primary);
		border-radius: 12px;
		padding: 0;
		margin-bottom: 1.5rem;
		box-shadow: 0 6px 20px var(--shadow-light);
		overflow: hidden;
		position: relative;
		transition: var(--transition-theme);
	}

	.effect-item::before,
	.binary-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
	}

	.effect-item:hover,
	.binary-item:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 10px 30px var(--shadow-medium);
	}

	.effect-header,
	.binary-header {
		background: var(--bg-tertiary);
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-primary);
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.effect-name,
	.binary-name {
		flex: 1;
		font-weight: 700;
		font-size: 1rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		color: var(--text-primary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		padding: 0.75rem;
		transition: var(--transition-theme);
		box-shadow: inset 0 2px 4px var(--shadow-light);
	}

	.effect-name:focus,
	.binary-name:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow:
			inset 0 2px 4px var(--shadow-light),
			0 0 0 3px rgba(var(--color-primary), 0.2);
		transform: scale(1.01);
	}

	.btn-remove,
	.btn-remove-small {
		background: linear-gradient(135deg, var(--color-error) 0%, var(--color-primary) 100%);
		color: var(--text-inverse);
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		font-weight: 900;
		transition: var(--transition-theme);
		box-shadow: 0 4px 12px var(--shadow-medium);
		flex-shrink: 0;
		position: relative;
		overflow: hidden;
	}

	.btn-remove-small {
		width: 28px;
		height: 28px;
		font-size: 1rem;
	}

	.btn-remove::before,
	.btn-remove-small::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
		transition: left 0.3s;
	}

	.btn-remove:hover::before,
	.btn-remove-small:hover::before {
		left: 100%;
	}

	.btn-remove:hover,
	.btn-remove-small:hover {
		transform: scale(1.2) rotate(90deg);
		box-shadow: 0 6px 20px var(--shadow-heavy);
	}

	.effect-content,
	.binary-content {
		padding: 1.5rem;
	}

	.effect-fields,
	.binary-fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.effect-fields label,
	.binary-fields label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.description-field {
		grid-column: 1 / -1;
		margin-bottom: 1rem;
	}

	.description-field label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.effect-fields input,
	.effect-fields select,
	.binary-fields input,
	.description-field input,
	.description-field textarea {
		padding: 0.75rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		color: var(--text-primary);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		transition: var(--transition-theme);
		box-shadow: inset 0 2px 4px var(--shadow-light);
	}

	.effect-fields input:focus,
	.effect-fields select:focus,
	.binary-fields input:focus,
	.description-field input:focus,
	.description-field textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow:
			inset 0 2px 4px var(--shadow-light),
			0 0 0 3px rgba(var(--color-primary), 0.2);
		transform: scale(1.01);
	}

	/* Progression fields styling */
	.progression-fields {
		background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
		border: 2px solid var(--border-secondary);
		border-radius: 10px;
		padding: 1.5rem;
		margin-top: 1.5rem;
		box-shadow: 0 4px 16px var(--shadow-light);
		position: relative;
	}

	.progression-fields::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-secondary), var(--color-accent));
	}

	.curve-fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		align-items: end;
	}

	.per-rank-fields {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.per-rank-header {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.rank-deltas {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.rank-deltas::-webkit-scrollbar {
		width: 6px;
	}

	.rank-deltas::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: 3px;
	}

	.rank-deltas::-webkit-scrollbar-thumb {
		background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
		border-radius: 3px;
	}

	.delta-item {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		padding: 0;
		box-shadow: 0 2px 8px var(--shadow-light);
		overflow: hidden;
		position: relative;
	}

	.delta-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
	}

	.delta-header {
		background: var(--bg-tertiary);
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-primary);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.delta-label {
		font-weight: 700;
		color: var(--color-primary);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.delta-fields {
		padding: 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
	}

	.delta-fields label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.delta-fields input,
	.delta-fields select {
		padding: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		transition: var(--transition-theme);
		box-shadow: inset 0 1px 2px var(--shadow-light);
	}

	.delta-fields input:focus,
	.delta-fields select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow:
			inset 0 1px 2px var(--shadow-light),
			0 0 0 2px rgba(var(--color-primary), 0.2);
	}

	/* Mobile responsive */
	@media (max-width: 1024px) {
		.editor-content {
			max-height: 60vh;
		}

		.inline-fields {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.effect-fields,
		.binary-fields {
			grid-template-columns: 1fr;
		}

		.curve-fields {
			grid-template-columns: 1fr;
		}

		.per-rank-header {
			flex-direction: column;
			align-items: stretch;
		}

		.delta-fields {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.editor-header {
			padding: 1.25rem 1.5rem;
		}

		.skill-header h3 {
			font-size: 1.25rem;
		}

		.editor-content {
			padding: 1.5rem;
			max-height: 50vh;
		}

		.basic-info,
		.progression-fields {
			padding: 1.25rem;
		}

		.section-header {
			padding: 0.875rem 1.25rem;
			flex-direction: column;
			gap: 0.75rem;
		}

		.effect-header,
		.binary-header {
			padding: 1rem;
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.btn-remove,
		.btn-remove-small {
			align-self: flex-end;
			width: 32px;
			height: 32px;
		}

		.rank-deltas {
			max-height: 200px;
		}
	}
</style>
