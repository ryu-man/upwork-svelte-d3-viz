<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let data = [];
	export let open = false;
	export let disabled = false;
	export let selected = new Set<string>();

	$: sorted_data = data.sort((a, b) => {
		if (a === 'Main') {
			return -1;
		} else {
			return a - b;
		}
	});

	$: keys = new Set(selected.keys());

	$: dispatch('change', selected);

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
			<Tooltip.Root openDelay={100}>
				<Tooltip.Trigger class="flex items-center w-full">
					{keys.size} Analysis
					<ChevronsUpDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Tooltip.Trigger>
				<Tooltip.Content>
					Pick the population slice. ‘Main’ shows everyone; sub-groups focus on specific
					characteristics.
				</Tooltip.Content>
			</Tooltip.Root>
		</Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-auto whitespace-nowrap relative" role="menu" aria-label="Analyses options">
		<DropdownMenu.Label class="flex items-center justify-between">
			<div id="analyses-label">Analyses</div>

			<Button
				variant="outline"
				size="sm"
				aria-label="Clear all selected analyses"
				on:click={() => {
					selected = new Set();
					dispatch('clear');
				}}>Clear selection</Button
			>
		</DropdownMenu.Label>

		<DropdownMenu.Separator />

		<div class="flex flex-col" role="group" aria-labelledby="analyses-label">
			{#each sorted_data as group}
				{@const is_main_disabled = disabled}
				{@const is_checked = keys.has(group)}
				<Tooltip.Root openDelay={50}>
					<Tooltip.Trigger>
						<DropdownMenu.Item
							class={cn('flex gap-2', is_main_disabled && 'cursor-not-allowed opacity-50')}
							{disabled}
							role="menuitemcheckbox"
							aria-checked={is_checked}
							aria-label="{group} analysis, {is_checked ? 'selected' : 'not selected'}{is_main_disabled ? ', disabled: unselect all outcomes first' : ''}"
						>
							<Checkbox
								checked={is_checked}
								aria-hidden="true"
								on:click={() => {
									if (keys.has(group)) {
										selected.delete(group);
									} else {
										selected.add(group);
									}

									selected = selected;
								}}
							/>
							<div aria-hidden="true">{group}</div>
						</DropdownMenu.Item>
					</Tooltip.Trigger>

					{#if disabled}
						<!-- content here -->
						<Tooltip.Content
							>Please unselect all the outcomes first before slecting this analysis</Tooltip.Content
						>
					{/if}
				</Tooltip.Root>
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
