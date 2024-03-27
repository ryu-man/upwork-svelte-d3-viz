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

	export let selected_analyses = new Map<string, Set<string>>();

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
	$: keys = new Set(selected_analyses.keys());

	$: dispatch('change', Array.from(selected_analyses.entries()));

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
			{#if analyses.length}
				{@const is_disabled = !selected_analyses.get(outcome)?.has('Main') && disabled}

				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger
						class={cn('gap-2 cursor-pointer', is_disabled && 'cursor-not-allowed')}
						title={is_disabled ? 'section max reached! Please unselect some sub-groups first' : ''}
						on:click={() => {
							if (is_disabled) return;

							const selected_values = selected_analyses.get(outcome) || new Set();
							const analysis = 'Main';

							if (selected_values.has(analysis)) {
								selected_values.delete(analysis);
							} else {
								selected_values.add(analysis);
							}

							selected_analyses.set(outcome, selected_values);
							selected_analyses = selected_analyses;
						}}
					>
						<Badge variant="outline">{selected_analyses.get(outcome)?.size ?? 0}</Badge>
						<span>{outcome}</span>
					</DropdownMenu.SubTrigger>

					<DropdownMenu.SubContent class="w-auto whitespace-nowrap">
						{#each analyses as analysis}
							{@const is_disabled = !selected_analyses.get(outcome)?.has(analysis) && disabled}

							<DropdownMenu.Item
								class={cn('gap-2', is_disabled && 'cursor-not-allowed')}
								title={is_disabled
									? 'section max reached! Please unselect some sub-groups first'
									: ''}
							>
								<Checkbox
									checked={selected_analyses.get(outcome)?.has(analysis)}
									disabled={is_disabled}
									on:click={() => {
										const selected_values = selected_analyses.get(outcome) || new Set();
										if (selected_values.has(analysis)) {
											selected_values.delete(analysis);

											if (!selected_values.size) {
												selected_analyses.delete(outcome);
											}
										} else {
											selected_values.add(analysis);
										}
										selected_analyses.set(outcome, selected_values);
										selected_analyses = selected_analyses;
									}}
								/>
								<span>{analysis}</span>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
			{:else}
				<DropdownMenu.Item>
					<Checkbox
						checked={keys.has(outcome)}
						on:click={() => {
							if (keys.has(outcome)) {
								selected_analyses.delete(outcome);
							} else {
								selected_analyses.set(outcome, new Set());
							}

							selected_analyses = selected_analyses;
						}}
					/>
					<span>{outcome}</span>
				</DropdownMenu.Item>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
