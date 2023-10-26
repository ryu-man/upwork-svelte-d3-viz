<script lang="ts">
	import { scaleBand } from 'd3';

	type LegendItem = {
		label: String;
		color: string;
	};

	export let x = 0;
	export let y = 0;
	export let padding = 0;
	export let data: LegendItem[] = [];

	let contentBoxSize: DOMRectReadOnly;

	const itemHeight = 28;

	$: domain = data.map((d) => d.label);
	$: range = [0, itemHeight * data.length];

	$: itemsScale = scaleBand(domain, range).paddingInner(0.2).paddingOuter(.3);

	// function resizeObserve(node: SVGGElement) {
	// 	const observer = new ResizeObserver(() => {
	// 		clientWidth = node.clientWidth;
	// 		clientHeight = node.clientHeight;

	//         console.log(node)
	// 	});

	// 	observer.observe(node);

	// 	return {
	// 		destroy() {
	// 			observer.disconnect();
	// 		}
	// 	};
	// }
</script>

<g class="legend" transform="translate({x}, {y})">
	{#if contentBoxSize}
		<rect
			x={0 - padding}
			y={0 - padding}
			width={contentBoxSize.width + padding * 2}
			height={contentBoxSize.height + padding * 2}
			fill="white"
		/>
	{/if}

	<g class="content" bind:contentRect={contentBoxSize}>
		{#each data as item}
			<g class="legend-item" transform="translate(0, {itemsScale(item.label)})">
				<line x1="0" x2="48" stroke={item.color} stroke-width="1" />
				<text x={72} fill={item.color}>{item.label}</text>
			</g>
		{/each}
	</g>
</g>

<style>
	.legend {
	}
</style>
