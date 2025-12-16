<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronsUpDown } from 'lucide-svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils';

	const dispatch = createEventDispatcher();

	export let data = [];
	export let length = 0;
	export let maxlength = 7;
	export let selectedAnalyses = new Set();
	export let open = false;
	export let disabled = false;
	export let order: Map<string, Date> = new Map();
	export let selected = new Map<string, Set<string>>();

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

	$: keys = new Set(selected.keys());

	$: dispatch('change', selected);
</script>

<DropdownMenu.Root closeOnItemClick={false} bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Tooltip.Root openDelay={100}>
			<Tooltip.Trigger>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-haspopup="menu"
					aria-label="Outcomes selector: {keys.size} {keys.size === 1 ? 'outcome' : 'outcomes'} selected"
					class="w-[200px] justify-between"
				>
					<span aria-hidden="true">{keys.size} outcome{keys.size > 1 ? 's' : ''}</span>
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				Pick the health outcome(s) to plot. This will show the hazard ratios over time
			</Tooltip.Content>
		</Tooltip.Root>
	</DropdownMenu.Trigger>
	
	<!-- Screen reader announcements -->
	<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
		{keys.size} {keys.size === 1 ? 'outcome' : 'outcomes'} selected
	</div>

	<DropdownMenu.Content class="w-auto whitespace-nowrap" role="menu" aria-label="Outcomes options">
		<DropdownMenu.Label class="flex items-center justify-between">
			<div id="outcomes-label">Outcomes</div>

			<Button
				variant="outline"
				size="sm"
				aria-label="Clear all selected outcomes"
				on:click={() => {
					selected = new Map();
					dispatch('clear');
				}}>Clear selection</Button
			>
		</DropdownMenu.Label>

		<DropdownMenu.Separator />

		<div class="flex flex-col" role="group" aria-labelledby="outcomes-label">
			{#each visibleData as [outcome, analyses]}
				{@const is_main_disabled =
					!selected.get(outcome)?.has('Main') && !selected.get(outcome)?.size && !can_select}
				{@const selected_count = selected.get(outcome)?.size ?? 0}

				<DropdownMenu.Sub>
					<Tooltip.Root openDelay={50}>
						<Tooltip.Trigger>
							<DropdownMenu.SubTrigger
								class={cn(
									'gap-2 cursor-pointer',
									is_main_disabled && 'cursor-not-allowed opacity-50'
								)}
								disabled={is_main_disabled}
								aria-label="{outcome}, {selected_count} {selected_count === 1 ? 'analysis' : 'analyses'} selected{is_main_disabled ? ', disabled: maximum selections reached' : ''}"
								aria-haspopup="menu"
								on:click={() => {
									if (is_main_disabled) return;
									if (selectedAnalyses.size && !selectedAnalyses.has('Main')) return;

									if (!order.has(outcome)) {
										order.set(outcome, new Date());
									}

									const selected_values = selected.get(outcome) || new Set();
									const analysis = 'Main';

									if (selected_values.has(analysis)) {
										selected_values.delete(analysis);

										if (!selected_values.size) {
											selected.delete(outcome);
											order.delete(outcome);
										} else {
											selected.set(outcome, selected_values);
										}
										selected = selected;
										dispatch('unselect-outcome', outcome);
									} else {
										selected_values.add(analysis);
										selected.set(outcome, selected_values);
										selected = selected;
										dispatch('select-outcome', outcome);
									}
								}}
							>
									<Badge variant="outline" aria-hidden="true">{selected.get(outcome)?.size ?? 0}</Badge>
									<span aria-hidden="true">{outcome}</span>
							</DropdownMenu.SubTrigger>
						</Tooltip.Trigger>

						{#if is_main_disabled}
							<Tooltip.Content>
								Section max reached! Please unselect some sub-groups first
							</Tooltip.Content>
						{/if}
					</Tooltip.Root>

					<DropdownMenu.SubContent class="w-auto whitespace-nowrap flex flex-col" role="menu" aria-label="{outcome} analyses">
						{#each analyses as analysis}
							{@const is_filtered_out = !!selectedAnalyses.size && !selectedAnalyses.has(analysis)}
							{@const is_not_selected = !selected.get(outcome)?.has(analysis)}
							{@const is_sub_disabled = (is_not_selected && !can_select) || is_filtered_out}
							{@const is_checked = selected.get(outcome)?.has(analysis)}

							<Tooltip.Root openDelay={50}>
								<Tooltip.Trigger>
									<DropdownMenu.Item
										class={cn('gap-2', is_sub_disabled && 'cursor-not-allowed opacity-50')}
										disabled={is_sub_disabled}
										role="menuitemcheckbox"
										aria-checked={is_checked}
										aria-label="{analysis} for {outcome}, {is_checked ? 'selected' : 'not selected'}{is_sub_disabled ? (is_filtered_out ? ', filtered out by analyses selection' : ', maximum selections reached') : ''}"
									>
										<Checkbox
											checked={is_checked}
											disabled={is_sub_disabled}
											aria-hidden="true"
											on:click={() => {
												if (!order.has(outcome)) {
													order.set(outcome, new Date());
												}

												const selected_values = selected.get(outcome) || new Set();

												if (selected_values.has(analysis)) {
													selected_values.delete(analysis);

													if (!selected_values.size) {
														selected.delete(outcome);
														order.delete(outcome);
													} else {
														selected.set(outcome, selected_values);
													}
													selected = selected;
													dispatch('unselect-analysis', outcome);
												} else {
													selected_values.add(analysis);
													selected.set(outcome, selected_values);
													selected = selected;
													dispatch('select-analysis', outcome);
												}
											}}
										/>
										<div aria-hidden="true">{analysis}</div>
									</DropdownMenu.Item>
								</Tooltip.Trigger>

								{#if is_filtered_out || !can_select}
									<Tooltip.Content>
										{is_filtered_out
											? 'This item was filtered out in the analyses dropdown'
											: !can_select
											? 'Section max reached! Please unselect some sub-groups first'
											: ''}
									</Tooltip.Content>
								{/if}
							</Tooltip.Root>
						{/each}
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
