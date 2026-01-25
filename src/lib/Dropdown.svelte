<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import Portal from 'svelte-portal';
	import { getChartContext } from './context';
	import Popover from './Popover.svelte';

	const context = getChartContext();

	export let x = 0;
	export let y = 0;
	export let value: string;

	let element: HTMLElement;
	let open = false;

	function onclick() {
		open = !open;
	}

	function on_item_click(item: string) {
		return () => {
			value = item;
			open = false;
		};
	}
</script>

<Portal target={context.layerElement}>
	<div
		class="data-dropdown pointer-events-auto absolute top-0 left-0 py-2 px-4 flex flex-col"
		class:active={open}
		style:transform="translate({x}px, {y}px)"
	>
		<div class="flex flex-col" bind:this={element}>
			<button class="flex gap-4 text-2xl font-medium cursor-pointer py-2" on:click={onclick}>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2M7.47 9.97a.75.75 0 0 0 0 1.06l4 4a.75.75 0 0 0 1.06 0l4-4a.75.75 0 1 0-1.06-1.06L12 13.44L8.53 9.97a.75.75 0 0 0-1.06 0"
					/>
				</svg>

				<div class="capitalize">{value.replace('_', ' ')}</div>
			</button>

			{#if open}
				<button class="py-1" on:click={on_item_click('condition_1')}>Condition 1</button>
				<button class="py-1" on:click={on_item_click('condition_2')}>Condition 2</button>
				<button class="py-1" on:click={on_item_click('condition_3')}>Condition 3</button>
				<button class="py-1" on:click={on_item_click('condition_4')}>Condition 4</button>
				<button class="py-1" on:click={on_item_click('condition_5')}>Condition 5</button>
			{/if}
		</div>
	</div>
</Portal>

{#await tick() then _}
	<Popover reference={element} open={!open} placements={['top-start']}>
		<div class="tooltip" transition:fly={{ duration: 100, x: 0, y: 16 }}>
			<div class="w-fit" style:transform="translate(-25%, 0)">
				Lorem ipsum augue a ut velit faucibus elit platea
			</div>
		</div>
	</Popover>
{/await}

<style lang="postcss">
	.data-dropdown {
	}

	.data-dropdown.active {
		background-color: theme('colors.neutral.200');
	}
</style>
