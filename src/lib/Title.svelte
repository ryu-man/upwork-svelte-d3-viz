<script lang="ts">
	import { getChartContext } from './context';
	import Popover from './Popover.svelte';
	import { fly } from 'svelte/transition';

	const context = getChartContext();

	export let x = 0;
	export let y = 0;

	let hover = false;
	let element: HTMLElement;

	$: domRect = element?.getBoundingClientRect();

	function resizer(node: HTMLElement) {
		const observer = new ResizeObserver(() => {
			domRect = node.getBoundingClientRect();
		});

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	function onPointerEnterHandler() {
		hover = true;
	}
	function onPointerLeaveHandler() {
		hover = false;
	}
</script>

<div
	class="mb-8 cursor-pointer w-fit"
	bind:this={element}
	use:resizer
	on:pointerenter={onPointerEnterHandler}
	on:pointerleave={onPointerLeaveHandler}
>
	<slot {hover} />
</div>

<Popover reference={element} open={hover} placements={['bottom-start']} let:dx let:dy>
	<div class="tooltip" transition:fly={{ duration: 100, x: dx * 16, y: dy * 16 }}>
		<slot name="tooltip" />
	</div>
</Popover>

<style lang="postcss">
	.tooltip {
		@apply border-4 border-solid border-neutral-300 shadow-sm px-4 py-3;

		background-color: white;
		pointer-events: none;
		max-width: 36vw;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 4px 1px rgba(0 0 0 / 0.1);
	}
</style>
