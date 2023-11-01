<script lang="ts">
	import Portal from 'svelte-portal';
	import { getChartContext } from './context';

	const context = getChartContext();

	export let x = 0;
	export let y = 0;

	let hover = false;
	let element: SVGGElement;

	$: domRect = element?.getBoundingClientRect();

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
	font-weight="900"
	text-anchor="middle"
	cursor="pointer"
	bind:this={element}
	on:pointerenter={onPointerEnterHandler}
	on:pointerleave={onPointerLeaveHandler}
>
	<slot {hover} />
</g>

{#if hover}
	<Portal target={context.layerElement}>
		<slot name="tooltip" y={domRect?.y ?? 0} x={domRect?.x ?? 0} />
	</Portal>
{/if}
