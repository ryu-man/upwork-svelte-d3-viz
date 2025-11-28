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
					Pick the subgroup. ‘Main’ shows everyone; other subgroups focus on specific
					characteristics
				</Tooltip.Content>
			</Tooltip.Root>
		</Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-auto whitespace-nowrap relative">
		<DropdownMenu.Label class="flex items-center justify-between">
			<div>Analyses</div>

			<Button
				variant="outline"
				size="sm"
				on:click={() => {
					selected = new Set();
					dispatch('clear');
				}}>Clear selection</Button
			>
		</DropdownMenu.Label>

		<DropdownMenu.Separator />

		<div class="flex flex-col">
			{#each sorted_data as group}
				{@const is_main_disabled = disabled}
				<Tooltip.Root openDelay={50}>
					<Tooltip.Trigger>
						<DropdownMenu.Item
							class={cn('flex gap-2', is_main_disabled && 'cursor-not-allowed opacity-50')}
							{disabled}
						>
							<Checkbox
								checked={keys.has(group)}
								on:click={() => {
									if (keys.has(group)) {
										selected.delete(group);
									} else {
										selected.add(group);
									}

									selected = selected;
								}}
							/>
							<div>{group}</div>
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
