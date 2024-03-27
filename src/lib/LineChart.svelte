<script lang="ts">
	import { max, min, scaleLinear, line, scaleOrdinal, scaleLog, group, schemeCategory10 } from 'd3';
	import XAxis from './XAxis.svelte';
	import YAxis from './YAxis.svelte';
	import Legend from './Legend.svelte';
	import PathPoint from './PathPoint.svelte';
	import Tooltip from './Tooltip.svelte';
	import AxisLabel from './AxisLabel.svelte';
	import { setChartContext } from './context';
	import XAxisTooltip from './XAxisTooltip.svelte';
	import YAxisTooltip from './YAxisTooltip.svelte';
	import { getRootContext } from './root/context';
	import { getChartContext } from './chart/context';
	import { portal } from './actions';

	const root_context = getRootContext();

	const chart_context = getChartContext();
	const client_width = chart_context.client_width;
	const client_height = chart_context.client_height;

	scaleLog([], []);

	export let yScale;
	export let data = [];
	export let series: string[] = [];
	export let dataset: string;
	export let datasets: string[] = [];
	export let groupByAccessor: ((d) => unknown) | undefined = undefined;
	export let xAccessor = (d) => d['Week'];
	export let yAccessor = (d) => d['Hazard Ratio'];
	export let lclAccessor = (d) => d['Lower Confidence Level'];
	export let uclAccessor = (d) => d['Upper Confidence Level'];

	export let padding = {
		top: 196,
		right: 24,
		bottom: 128,
		left: 128
	};

	const context = setChartContext();

	let active_serie: string | undefined = undefined;
	let hover_timeout = () => {};

	$: data_series = group(data, groupByAccessor);
	$: console.log(data_series);

	$: series = Array.from(data_series.keys());

	$: x_scale = scaleLinear([0, max(data, xAccessor)], [0, $client_width]);
	$: y_domain =
		yScale === scaleLinear
			? [min(data, yAccessor), max(data, yAccessor)]
			: [min(data, yAccessor) || 1, max(data, yAccessor)];

	$: y_scale = yScale(y_domain, [$client_height, 0]);
	$: cl_scale = scaleLinear([max(data, uclAccessor), min(data, lclAccessor)], [0, 400]);

	$: colors = series.length > 1 ? schemeCategory10 : ['black'];
	$: colorScale = scaleOrdinal(series, colors);

	$: path = line()
		.x((d) => x_scale(xAccessor(d)))
		.y((d) => y_scale(yAccessor(d)));
</script>

<g class="axis" font-size="10pt" font-weight="600" fill-opacity=".6">
	<XAxis scale={x_scale} y={$client_height} width={$client_width}>
		<AxisLabel slot="label" x={$client_width / 2} y={72} placements={['top-start']}>
			<text>Week</text>

			<XAxisTooltip slot="tooltip" />
		</AxisLabel>
	</XAxis>

	<YAxis scale={y_scale} width={$client_width} height={$client_height}>
		<AxisLabel slot="label" x={-72} y={$client_height / 2} placements={['right-start']}>
			<text
				text-anchor="middle"
				writing-mode="vertical-lr"
				dominant-baseline="middle"
				style:transform="rotate(180deg)">Increased likelihood</text
			>

			<YAxisTooltip slot="tooltip" />
		</AxisLabel>
	</YAxis>
</g>

<g class="data">
	{#each Array.from(data_series) as [key, value]}
		{@const color = colorScale(key)}
		{@const is_active = active_serie === key}
		{@const opacity = active_serie ? (is_active ? 1 : 0.3) : 1}
		{@const filter = `grayscale(${active_serie ? (is_active ? 0 : 1) : 0})`}

		<g
			class="serie {key}"
			style:color
			{opacity}
			{filter}
			on:pointerenter={() => {
				clearTimeout(hover_timeout);
				active_serie = key;
			}}
			on:pointerleave={() => {
				hover_timeout = setTimeout(() => {
					active_serie = undefined;
				}, 600);
			}}
		>
			<path d={path(value)} fill="none" stroke={color} stroke-width="2" stroke-opacity=".7" />

			{#each value as item}
				{@const y1 = cl_scale(uclAccessor(item))}
				{@const y2 = cl_scale(lclAccessor(item))}

				<PathPoint x={x_scale(xAccessor(item))} y={y_scale(yAccessor(item))} {y1} {y2} let:hover>
					{#if hover}
						<Tooltip value={yAccessor(item)} />
					{/if}
				</PathPoint>
			{/each}
		</g>
	{/each}
</g>

{#if series.length > 1}
	{@const legend_items = series.map((d) => ({
		label: d,
		color: colorScale(d)
	}))}

	<div class="absolute right-0 top-0" use:portal={chart_context.root_element}>
		<Legend x={innerWidth - 270} y={44} padding={20}>
			{#each legend_items as item}
				{@const is_active = active_serie === item.label}
				{@const opacity = active_serie ? (is_active ? 1 : 0.3) : 1}
				{@const filter = `grayscale(${active_serie ? (is_active ? 0 : 1) : 0})`}

				<div
					class="legend-item flex items-center gap-2 cursor-pointer"
					style:color={item.color}
					style:opacity
					style:filter
					on:pointerenter={() => {
						clearTimeout(hover_timeout);
						active_serie = item.label;
					}}
					on:pointerleave={() => {
						hover_timeout = setTimeout(() => {
							active_serie = undefined;
						}, 600);
					}}
				>
					<div class="w-12 min-h-[1px] bg-current" />
					<div>{item.label}</div>
				</div>
			{/each}
		</Legend>
	</div>
{/if}

<!-- <Dropdown bind:value={dataset} x={innerWidth / 2} y={48} /> -->

<style>
	.line-chart-container {
		width: 100%;
		height: 100%;
		min-height: 100%;
		max-height: 100%;
		min-width: 100%;
		max-width: 100%;

		overflow: hidden;
	}

	svg {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.html-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 2;
	}

	.html-layer-inner {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.scale-type {
		position: absolute;
		bottom: 0;
		left: 0;
		padding: 4px;
		z-index: 2;
	}
</style>
