<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	export let data = [];

	let selected_cohorts = new Map(data.filter((d) => d.selected).map((d) => d.value));

	$: {
		data.forEach((d) => {
			selected_cohorts.set(d.value, d);
		});
		selected_cohorts = selected_cohorts;
	}

	$: dispatch('change', Array.from(selected_cohorts));
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
			{selected_cohorts.size} cohorts
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-auto whitespace-nowrap">
		<DropdownMenu.Label>Cohorts</DropdownMenu.Label>

		<DropdownMenu.Separator />

		{#each data as cohort (cohort.value)}
			<DropdownMenu.Item class="gap-2">
				<Checkbox
					checked={selected_cohorts.has(cohort.value) || cohort.selected}
					on:click={() => {
						if (selected_cohorts.has(cohort.value)) {
							selected_cohorts.delete(cohort.value);
							cohort.selected = false;
						} else {
							selected_cohorts.add(cohort.value);
							cohort.selected = true;
						}

						selected_cohorts = selected_cohorts;
					}}
				/>
				<span>{cohort.value}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
