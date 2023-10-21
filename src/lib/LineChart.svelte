<script lang="ts">
	import { extent, max, min, scaleLinear, line } from 'd3';
	import XAxis from './XAxis.svelte';
	import YAxis from './YAxis.svelte';

	let clientWidth = 0;
	let clientHeight = 0;

	export let data = [];
	export let xAccessor = (d) => d['Week'];
	export let yAccessor = (d) => d['Hazard Ratio'];
	export let lclAccessor = (d) => d['Lower Confidence Level'];
	export let uclAccessor = (d) => d['Upper Confidence Level'];

	export let padding = {
		top: 48,
		right: 54,
		bottom: 48,
		left: 54
	};

	$: innerWidth = clientWidth - padding.left - padding.right;
	$: innerHeight = clientHeight - padding.top - padding.bottom;

	$: xScale = scaleLinear([0, max(data, xAccessor)], [0, innerWidth]);
	$: yScale = scaleLinear([0, max(data, yAccessor)], [innerHeight, 0]);
	$: clScale = scaleLinear([max(data, uclAccessor), min(data, lclAccessor)], [0, 400]);

	$: path = line()
		.x((d) => xScale(xAccessor(d)))
		.y((d) => yScale(yAccessor(d)));
</script>

<div class="line-chart-container" bind:clientHeight bind:clientWidth>
	<svg viewBox="0 0 {clientWidth} {clientHeight}">
		<g transform="translate({padding.left}, {padding.top})">
			<g class="axis" font-size="10pt" font-weight="600" fill-opacity=".6">
				<XAxis scale={xScale} y={innerHeight} width={innerWidth}>
					<g slot="label" let:showTooltip transform="translate({innerWidth}, -24)">
						<text text-anchor="end" fill-opacity=".2" font-size="20pt" font-weight="900">Week</text>

						{#if showTooltip}
							<text font-size="10pt" text-anchor="end" transform="translate(0, -36)">
								<tspan>Lorem ipsum dolor sit amet, consectetur adipiscing elit</tspan>
							</text>
						{/if}
					</g>
				</XAxis>

				<YAxis scale={yScale} width={innerWidth} height={innerHeight}>
					<g slot="label" let:showTooltip transform="translate(24, 0)">
						<text
							fill-opacity=".2"
							font-size="20pt"
							font-weight="900"
							writing-mode="vertical-lr"
							dominant-baseline="ideographic">Increased likelihood</text
						>

						{#if showTooltip}
							<text
								font-size="10pt"
								text-anchor="start"
								transform="translate(36, 0)"
								dominant-baseline="hanging"
							>
								urna arcu dignissim felis, sit amet gravida purus libero eu lorem
							</text>
						{/if}
					</g>
				</YAxis>
			</g>

			<g class="data">
				<path d={path(data)} fill="none" stroke="rgb(0 0 0)" stroke-width="2" stroke-opacity=".7" />
				{#each data as item}
					{@const y1 = clScale(uclAccessor(item))}
					{@const y2 = clScale(lclAccessor(item))}

					<g transform="translate({xScale(xAccessor(item))}, {yScale(yAccessor(item))})">
						<circle cx="0" cy="0" r="4" />
						<line
							{y1}
							{y2}
							stroke="rgb(0 0 0 / .6)"
							stroke-width="3"
							stroke-linecap="round"
							transform="translate(0, {-Math.abs(y1 + y2) / 2})"
						/>
					</g>
				{/each}
			</g>
		</g>
	</svg>
</div>

<style>
	.line-chart-container {
		width: 100%;
		height: 100%;

		background-color: whitesmoke;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
