<script lang="ts">
	import Popover from './Popover.svelte';
	import { fly } from 'svelte/transition';
	import type { Placement } from '@floating-ui/dom';
	import { tick } from 'svelte';

	export let x = 0;
	export let y = 0;

	export let placements: Placement[] = [];

	let hover = false;
	let element: SVGGElement;

	function onPointerEnterHandler() {
		hover = true;
	}
	function onPointerLeaveHandler() {
		hover = false;
	}
</script>

<g
	transform="translate({x}, {y})"
	fill-opacity=".6"
	font-size="20pt"
	font-weight="700"
	text-anchor="middle"
	cursor="pointer"
	bind:this={element}
	on:pointerenter={onPointerEnterHandler}
	on:pointerleave={onPointerLeaveHandler}
>
	<slot {hover} />
</g>

<Popover reference={element} open={hover} {placements} let:dx let:dy>
	<div class="tooltip" transition:fly={{ duration: 100, x: dx * 16, y: dy * 16 }}>
		<slot name="tooltip" />
	</div>
</Popover>

<style lang="postcss">
	.tooltip {
		@apply border-4 border-solid border-neutral-300 shadow-sm px-4 py-3;

		background-color: white;
		border-radius: 0;
		pointer-events: none;
		max-width: 36vw;
		display: flex;
		flex-direction: column;
	}
</style>
