<script lang="ts">
	import Popover from './Popover.svelte';
	import { fly } from 'svelte/transition';
	import type { Placement } from '@floating-ui/dom';

	export let x = 0;
	export let y = 0;

	export let dx = 0;
	export let dy = 0;

	export let placements: Placement[] = [];

	let hover = false;
	let element: SVGGElement;

	$: domRect = element?.getBoundingClientRect();

	function resizer(node: SVGGElement) {
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

<g
	transform="translate({x}, {y})"
	fill-opacity=".6"
	font-size="20pt"
	font-weight="700"
	text-anchor="middle"
	cursor="pointer"
	bind:this={element}
	use:resizer
	on:pointerenter={onPointerEnterHandler}
	on:pointerleave={onPointerLeaveHandler}
>
	<slot {hover} />
</g>

<Popover reference={element} open={hover} {placements}>
	<div class="tooltip" transition:fly={{ duration: 100, x: dx, y: dy }}>
		<slot name="tooltip" />
	</div>
</Popover>

<style lang="postcss">
	.tooltip {
		padding: 12px 16px;
		background-color: white;
		border-radius: 4px;
		pointer-events: none;
		max-width: 36vw;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 4px 1px rgba(0 0 0 / 0.1);
	}
</style>
