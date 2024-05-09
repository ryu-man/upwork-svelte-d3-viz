<script lang="ts">
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
	export let selectedOutcomes = new Set<string>();

	$: sorted_data = data.sort((a, b) => {
		if (a === 'Main') {
			return -1;
		} else {
			return a - b;
		}
	});
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
			{keys.size} Analysis
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-auto whitespace-nowrap">
		<DropdownMenu.Label>Outcomes</DropdownMenu.Label>

		<DropdownMenu.Separator />

		{#each sorted_data as group}
			{@const is_main_disabled = disabled}

			<DropdownMenu.Item
				class={cn('flex gap-2', is_main_disabled && 'cursor-not-allowed opacity-50')}
				disabled={disabled}
			>
				<Checkbox
					checked={keys.has(group)}
					on:click={() => {
						if (keys.has(group)) {
							selectedOutcomes.delete(group);
						} else {
							selectedOutcomes.add(group);
						}

						selectedOutcomes = selectedOutcomes;
					}}
				/>
				<div>{group}</div>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
