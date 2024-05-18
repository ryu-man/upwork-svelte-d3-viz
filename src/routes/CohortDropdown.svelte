<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	export let data = [];
	export let selected: string[] = [];

	$: selected = data.filter((d) => d.selected).map((d) => d.value);

	$: dispatch('change', selected);
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
			{selected.length} cohorts
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-auto whitespace-nowrap">
		<DropdownMenu.Label class="flex items-center justify-between">
			<div>Cohorts</div>

			<Button
				variant="outline"
				size="sm"
				on:click={() => {
					data = data.map((d) => {
						d.selected = false;

						return d;
					});

					dispatch('clear');
				}}>Clear selection</Button
			>
		</DropdownMenu.Label>

		<DropdownMenu.Separator />

		{#each data as cohort (cohort.value)}
			<DropdownMenu.Item class="gap-2">
				<Checkbox
					checked={cohort.selected}
					on:click={() => {
						cohort.selected = !cohort.selected;
						data = data;
					}}
				/>
				<span>{cohort.value}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
