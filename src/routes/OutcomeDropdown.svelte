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
	export let length = 0;
	export let maxlength = 7;
	export let selectedAnalyses = new Set();
	export let open = false;
	export let disabled = false;
	export let order: Map<string, Date> = new Map();
	export let selectedOutcomes = new Map<string, Set<string>>();

	let visibleData: any[][] = [];

	$: can_select = length <= maxlength;

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

	$: if (selectedAnalyses.size) {
		// If the use select at least one analysis then we should filter data
		visibleData = sorted_data.filter((d) => {
			const analyses = d[1];

			if (analyses.some((dd) => selectedAnalyses.has(dd))) {
				return true;
			} else {
				return false;
			}
		});
	} else {
		// Else use the sorted data
		visibleData = sorted_data;
	}

	$: keys = new Set(selectedOutcomes.keys());

	$: dispatch('change', selectedOutcomes);
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
		<DropdownMenu.Label class="flex items-center justify-between">
			<div>Outcomes</div>

			<Button
				variant="outline"
				size="sm"
				on:click={() => {
					selectedOutcomes = new Map();
					dispatch('clear');
				}}>Clear selection</Button
			>
		</DropdownMenu.Label>

		<DropdownMenu.Separator />

		{#each visibleData as [outcome, analyses]}
			{@const is_main_disabled =
				!selectedOutcomes.get(outcome)?.has('Main') &&
				!selectedOutcomes.get(outcome)?.size &&
				!can_select}
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
							if (selectedAnalyses.size && !selectedAnalyses.has('Main')) return;

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
								} else {
									selectedOutcomes.set(outcome, selected_values);
								}
								selectedOutcomes = selectedOutcomes;
								dispatch('unselect-outcome', outcome);
							} else {
								selected_values.add(analysis);
								selectedOutcomes.set(outcome, selected_values);
								selectedOutcomes = selectedOutcomes;
								dispatch('select-outcome', outcome);
							}
						}}
					>
						<Badge variant="outline">{selectedOutcomes.get(outcome)?.size ?? 0}</Badge>
						<span>{outcome}</span>
					</DropdownMenu.SubTrigger>

					<DropdownMenu.SubContent class="w-auto whitespace-nowrap">
						{#each analyses as analysis}
							{@const is_sub_disabled =
								(!selectedOutcomes.get(outcome)?.has(analysis) && !can_select) ||
								(selectedAnalyses.size && !selectedAnalyses.has(analysis))}

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
											} else {
												selectedOutcomes.set(outcome, selected_values);
											}
											selectedOutcomes = selectedOutcomes;
											dispatch('unselect-analysis', outcome);
										} else {
											selected_values.add(analysis);
											selectedOutcomes.set(outcome, selected_values);
											selectedOutcomes = selectedOutcomes;
											dispatch('select-analysis', outcome);
										}
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
