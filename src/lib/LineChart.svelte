<script lang="ts">
	import { extent, max, min, scaleLinear, line, scaleOrdinal } from 'd3';
	import XAxis from './XAxis.svelte';
	import YAxis from './YAxis.svelte';
	import Legend from './Legend.svelte';
	import PathPoint from './PathPoint.svelte';
	import Tooltip from './Tooltip.svelte';

	let clientWidth = 0;
	let clientHeight = 0;

	export let data = [];
	export let groupByAccessor: ((d) => unknown) | undefined = undefined;
	export let xAccessor = (d) => d['Week'];
	export let yAccessor = (d) => d['Hazard Ratio'];
	export let lclAccessor = (d) => d['Lower Confidence Level'];
	export let uclAccessor = (d) => d['Upper Confidence Level'];

	export let padding = {
		top: 128,
		right: 24,
		bottom: 128,
		left: 128
	};

	$: series = getSeries(data, groupByAccessor);
	$: console.log(data, series);
	$: seriesNames = Object.keys(series);
	$: innerWidth = clientWidth - padding.left - padding.right;
	$: innerHeight = clientHeight - padding.top - padding.bottom;

	$: xScale = scaleLinear([0, max(data, xAccessor)], [0, innerWidth]);
	$: yScale = scaleLinear([0, max(data, yAccessor)], [innerHeight, 0]);
	$: clScale = scaleLinear([max(data, uclAccessor), min(data, lclAccessor)], [0, 400]);

	$: colors = seriesNames.length > 1 ? ['green', 'blue', 'red'] : ['black'];
	$: colorScale = scaleOrdinal(seriesNames, colors);

	$: path = line()
		.x((d) => xScale(xAccessor(d)))
		.y((d) => yScale(yAccessor(d)));

	function getSeries(all: any[], groupByAccessor): Record<string, any[]> {
		if (!groupByAccessor)
			return {
				'': all
			};

		const acc = {};
		for (let i = 0; i < all.length; i++) {
			const item = all[i];
			const data = acc[groupByAccessor(item)] || [];

			acc[groupByAccessor(item)] = [...data, item];
		}

		return acc;
	}
</script>

<div class="line-chart-container" bind:clientHeight bind:clientWidth>
	<svg viewBox="0 0 {clientWidth} {clientHeight}">
		<g transform="translate({padding.left}, {padding.top})">
			<text
				x={innerWidth / 2}
				y={0}
				dy={-32}
				text-anchor="middle"
				font-size="32pt"
				font-weight="800">Example dataviz</text
			>

			<g class="axis" font-size="10pt" font-weight="600" fill-opacity=".6">
				<XAxis scale={xScale} y={innerHeight} width={innerWidth}>
					<g slot="label" let:showTooltip transform="translate({innerWidth / 2}, 72)">
						<text text-anchor="middle" fill-opacity=".6" font-size="20pt" font-weight="900"
							>Week</text
						>

						{#if showTooltip}
							<text font-size="10pt" text-anchor="end" transform="translate(0, -36)">
								<tspan>Lorem ipsum dolor sit amet, consectetur adipiscing elit</tspan>
							</text>
						{/if}
					</g>
				</XAxis>

				<YAxis scale={yScale} width={innerWidth} height={innerHeight}>
					<g slot="label" let:showTooltip transform="translate(-72, {innerHeight / 2})">
						<text
							fill-opacity=".6"
							font-size="20pt"
							font-weight="900"
							text-anchor="middle"
							writing-mode="vertical-lr"
							dominant-baseline="middle"
							style:transform="rotate(180deg)">Increased likelihood</text
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

			{#if seriesNames.length > 1}
				<Legend
					x={innerWidth - 270}
					y={44}
					padding={20}
					data={seriesNames.map((d) => ({
						label: d,
						color: colorScale(d)
					}))}
				/>
			{/if}

			<g class="data">
				{#each Object.entries(series) as [key, value]}
					{@const color = colorScale(key)}

					<g class="serie {key}" style:color>
						<path d={path(value)} fill="none" stroke={color} stroke-width="2" stroke-opacity=".7" />

						{#each value as item}
							{@const y1 = clScale(uclAccessor(item))}
							{@const y2 = clScale(lclAccessor(item))}

							<PathPoint
								x={xScale(xAccessor(item))}
								y={yScale(yAccessor(item))}
								{y1}
								{y2}
								let:hover
							>
								{#if hover}
									<Tooltip value={yAccessor(item)} />
								{/if}
							</PathPoint>
						{/each}
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
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
