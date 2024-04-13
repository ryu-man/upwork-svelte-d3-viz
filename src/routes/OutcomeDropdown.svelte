<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let data = [];
	export let open = false;
	export let disabled = false;
	export let order: Map<string, Date> = new Map();
	export let selectedOutcomes = new Map<string, Set<string>>();

	$: sorted_data = data.map((d) => [
		d[0],
		d[1].sort((a, b) => {
			if (a === 'Main') {
				return -1;
			} else {
				return a - b;
			}
		})
	]);
	$: keys = new Set(selectedOutcomes.keys());

	$: dispatch('change', selectedOutcomes);

	function on_outcom_click() {}
</script>

<DropdownMenu.Root closeOnItemClick={false} bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			{keys.size} outcome
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-auto whitespace-nowrap">
		<DropdownMenu.Label>Outcomes</DropdownMenu.Label>

		<DropdownMenu.Separator />

		{#each sorted_data as [outcome, analyses]}
			{@const is_main_disabled =
				!selectedOutcomes.get(outcome)?.has('Main') &&
				!selectedOutcomes.get(outcome)?.size &&
				disabled}
			{#if analyses.length}
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger
						class={cn('gap-2 cursor-pointer', is_main_disabled && 'cursor-not-allowed opacity-50')}
						disabled={is_main_disabled}
						title={is_main_disabled
							? 'section max reached! Please unselect some sub-groups first'
							: ''}
						on:click={() => {
							if (is_main_disabled) return;

							if (!order.has(outcome)) {
								order.set(outcome, new Date());
							}

							const selected_values = selectedOutcomes.get(outcome) || new Set();
							const analysis = 'Main';

							if (selected_values.has(analysis)) {
								selected_values.delete(analysis);
								if (!selected_values.size) {
									selectedOutcomes.delete(outcome);
									order.delete(outcome);
								}
							} else {
								selected_values.add(analysis);
							}

							selectedOutcomes.set(outcome, selected_values);
							selectedOutcomes = selectedOutcomes;
						}}
					>
						<Badge variant="outline">{selectedOutcomes.get(outcome)?.size ?? 0}</Badge>
						<span>{outcome}</span>
					</DropdownMenu.SubTrigger>

					<DropdownMenu.SubContent class="w-auto whitespace-nowrap">
						{#each analyses as analysis}
							{@const is_sub_disabled = !selectedOutcomes.get(outcome)?.has(analysis) && disabled}

							<DropdownMenu.Item
								class={cn('gap-2', is_sub_disabled && 'cursor-not-allowed opacity-50')}
								title={is_sub_disabled
									? 'section max reached! Please unselect some sub-groups first'
									: ''}
								disabled={is_sub_disabled}
							>
								<Checkbox
									checked={selectedOutcomes.get(outcome)?.has(analysis)}
									disabled={is_sub_disabled}
									on:click={() => {
										if (!order.has(outcome)) {
											order.set(outcome, new Date());
										}

										const selected_values = selectedOutcomes.get(outcome) || new Set();

										if (selected_values.has(analysis)) {
											selected_values.delete(analysis);

											if (!selected_values.size) {
												selectedOutcomes.delete(outcome);
												order.delete(outcome);
											}
										} else {
											selected_values.add(analysis);
										}

										selectedOutcomes.set(outcome, selected_values);
										selectedOutcomes = selectedOutcomes;
									}}
								/>
								<span>{analysis}</span>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
			{:else}
				<DropdownMenu.Item
					class={cn(is_main_disabled && 'cursor-not-allowed opacity-50')}
					disabled={is_main_disabled}
				>
					<Checkbox
						checked={keys.has(outcome)}
						on:click={() => {
							if (keys.has(outcome)) {
								selectedOutcomes.delete(outcome);
							} else {
								selectedOutcomes.set(outcome, new Set());
							}

							selectedOutcomes = selectedOutcomes;
						}}
					/>
					<span>{outcome}</span>
				</DropdownMenu.Item>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
