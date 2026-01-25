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
	import { sortBy, uniqBy } from 'lodash-es';

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
	export let groupByAccessor: ((d) => unknown) | undefined = (d) =>
		`${d['outcome']} | ${d['analysis']} | ${d['cohort']}`;
	export let xAccessor = (d) => d['Week'];
	export let yAccessor = (d) => d['Hazard Ratio'];
	export let lclAccessor = (d) => d['Lower Confidence Level'];
	export let uclAccessor = (d) => d['Upper Confidence Level'];
	export let termStartAccessor = (d) => d['term_start'];
	export let termEndAccessor = (d) => d['term_end'];
	export let outcomesOrder: Map<string, Date> = new Map();
	export let showHorizontalLines = false;
	export let showLegend = false;
	export let showConnectingLines = true;

	export let padding = {
		top: 196,
		right: 24,
		bottom: 128,
		left: 128
	};

	const context = setChartContext();

	let active_series: string[] = [];
	let in_hover_serie: string | undefined;
	let hover_timeout = () => {};
	let xTicks: number[] = [];

	$: series_label_data = uniqBy(
		data.map((d) => ({
			id: groupByAccessor(d),
			outcome: d['outcome'],
			analysis: d['analysis'],
			cohort: d['cohort'],
			createAt: outcomesOrder.get(d['outcome'])
		})),
		(d) => d.id
	);

	$: data_series = group(data, groupByAccessor);

	$: series = Array.from(data_series.keys());

	$: x_scale = scaleLinear(
		[min(data, termStartAccessor), max(data, termEndAccessor)],
		[0, $client_width]
	);
	$: y_domain =
		yScale === scaleLinear
			? [min(data, lclAccessor), max(data, uclAccessor)]
			: [min(data, lclAccessor) || 1, max(data, uclAccessor)];

	$: y_scale = yScale(y_domain, [$client_height, 0]);
	$: cl_scale = scaleLinear([max(data, uclAccessor), min(data, lclAccessor)], [0, 400]);

	$: colors = series.length > 1 ? schemeCategory10 : ['black'];
	$: colorScale = scaleOrdinal(series, colors);

	$: path = line()
		.x((d) => x_scale(xAccessor(d)))
		.y((d) => y_scale(yAccessor(d)));

	$: data_entries = Array.from(data_series).map((item) => [item[0], item[1]]);

	$: {
		const [start, end] = x_scale.domain();
		const tickValues = [];
		for (let i = Math.ceil(start / 7) * 7; i <= end; i += 7) {
			tickValues.push(i);
		}
		xTicks = tickValues;
	}

	// Calculate number of ticks based on client width
	// Aim for roughly one tick every 60-80 pixels for good readability
	$: numTicks = Math.max(5, Math.floor($client_width / 30));
</script>

<g class="axis" font-size="10pt" font-weight="600" fill-opacity=".6">
	<XAxis
		scale={x_scale}
		y={$client_height}
		width={$client_width}
		ticks={x_scale.ticks(numTicks)}
		tickFormat={(d) => `${Math.floor(d / 7)}`}
	/>

	<YAxis scale={y_scale} width={$client_width} height={$client_height} />
</g>

<g class="data">
	{#each data_entries as [key, value]}
		{@const color = colorScale(key)}
		{@const is_active = active_series.includes(key) || in_hover_serie === key}
		{@const opacity = active_series.length || in_hover_serie ? (is_active ? 1 : 0.3) : 1}
		{@const filter = `grayscale(${
			active_series.length || in_hover_serie ? (is_active ? 0 : 1) : 0
		})`}

		<g
			class="serie {key}"
			style:color
			{opacity}
			{filter}
			cursor="pointer"
			role="button"
			aria-label="{key}: Click to {is_active ? 'deselect' : 'select'} this series"
			aria-pressed={is_active}
			tabindex="0"
			on:pointerenter={() => {
				clearTimeout(hover_timeout);
				in_hover_serie = key;
			}}
			on:pointerleave={() => {
				hover_timeout = setTimeout(() => {
					in_hover_serie = undefined;
				}, 200);
			}}
			on:click={() => {
				const elem = active_series.find((d) => d === key);
				if (elem) {
					active_series = active_series.filter((d) => d !== key);
				} else {
					active_series = [...active_series, key];
				}
				console.log(active_series);
			}}
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					const elem = active_series.find((d) => d === key);
					if (elem) {
						active_series = active_series.filter((d) => d !== key);
					} else {
						active_series = [...active_series, key];
					}
				}
			}}
			on:focus={() => {
				clearTimeout(hover_timeout);
				in_hover_serie = key;
			}}
			on:blur={() => {
				hover_timeout = setTimeout(() => {
					in_hover_serie = undefined;
				}, 200);
			}}
		>
			{#if showConnectingLines}
				<path d={path(value)} fill="none" stroke={color} stroke-width="2" stroke-opacity=".7" />
			{/if}

			{#each value as item}
				{#if showHorizontalLines}
					{@const t0 = x_scale(termStartAccessor(item))}
					{@const t1 = x_scale(termEndAccessor(item))}
					<line
						x1={t0}
						x2={t1}
						y1={y}
						y2={y}
						stroke={color}
						stroke-width="2"
						stroke-opacity={in_hover_serie === key ? '0.4' : '0'}
					/>
				{/if}

				{@const y1 = cl_scale(uclAccessor(item))}
				{@const y2 = cl_scale(lclAccessor(item))}
				{@const y = y_scale(yAccessor(item))}

				<PathPoint x={x_scale(xAccessor(item))} {y} {y1} {y2} let:hover>
					{#if hover}
						<Tooltip value={yAccessor(item)} />
					{/if}
				</PathPoint>
			{/each}
		</g>
	{/each}
</g>

{#if showLegend && series.length > 1}
	{@const legend_items = series.map((d) => ({
		label: d,
		color: colorScale(d)
	}))}

	<div class="absolute right-0 top-0" use:portal={chart_context.root_element}>
		<Legend x={innerWidth - 270} y={44} padding={20}>
			{#each sortBy(series_label_data, (d) => [d.createAt, d.outcome]) as item}
				{@const is_active = active_series.includes(item.id) || in_hover_serie === item.id}
				{@const opacity = active_series.length || in_hover_serie ? (is_active ? 1 : 0.2) : 1}
				{@const filter = `grayscale(${
					active_series.length || in_hover_serie ? (is_active ? 0 : 1) : 0
				})`}
				{@const color = colorScale(item.id)}
				{@const cohort_parts = item['cohort'].split(/\s(?=\()/)}
				{@const hide_analysis = series_label_data.every((d) => d.analysis.toLowerCase() === 'main')}

				<div
					class="legend-item flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
					style:color
					style:opacity
					style:filter
					role="button"
					aria-label="{[
						item['outcome'],
						hide_analysis ? undefined : item['analysis'],
						cohort_parts[0]
					]
						.filter(Boolean)
						.join(' | ')}: Click to {is_active ? 'deselect' : 'select'}"
					aria-pressed={is_active}
					tabindex="0"
					on:pointerenter={() => {
						clearTimeout(hover_timeout);
						in_hover_serie = item.id;
					}}
					on:pointerleave={() => {
						hover_timeout = setTimeout(() => {
							in_hover_serie = undefined;
						}, 200);
					}}
					on:click={() => {
						const elem = active_series.find((d) => d === item.id);
						if (elem) {
							active_series = active_series.filter((d) => d !== item.id);
						} else {
							active_series = [...active_series, item.id];
						}
						console.log(active_series);
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							const elem = active_series.find((d) => d === item.id);
							if (elem) {
								active_series = active_series.filter((d) => d !== item.id);
							} else {
								active_series = [...active_series, item.id];
							}
						}
					}}
					on:focus={() => {
						clearTimeout(hover_timeout);
						in_hover_serie = item.id;
					}}
					on:blur={() => {
						hover_timeout = setTimeout(() => {
							in_hover_serie = undefined;
						}, 200);
					}}
				>
					<div class="w-12 min-h-[1px] bg-current" />

					<div title={cohort_parts[1].replace('(', '').replace(')', '')}>
						{[item['outcome'], hide_analysis ? undefined : item['analysis'], cohort_parts[0]]
							.filter(Boolean)
							.join(' | ')}
					</div>
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

		overflow: visible;
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
