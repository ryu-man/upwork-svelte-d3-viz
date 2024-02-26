<script lang="ts">
	import { max, min, scaleLinear, line, scaleOrdinal, scaleLog } from 'd3';
	import XAxis from './XAxis.svelte';
	import YAxis from './YAxis.svelte';
	import Legend from './Legend.svelte';
	import PathPoint from './PathPoint.svelte';
	import Tooltip from './Tooltip.svelte';
	import AxisLabel from './AxisLabel.svelte';
	import { setChartContext } from './context';
	import { tick } from 'svelte';
	import XAxisTooltip from './XAxisTooltip.svelte';
	import YAxisTooltip from './YAxisTooltip.svelte';
	import Title from './Title.svelte';
	import TitleTooltip from './TitleTooltip.svelte';
	import Dropdown from './Dropdown.svelte';

	let clientWidth = 0;
	let clientHeight = 0;
	let yScaleFunction = scaleLinear;

	scaleLog([], []);

	export let data = [];
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

	$: series = getSeries(data, groupByAccessor);
	$: seriesNames = Object.keys(series);
	$: innerWidth = clientWidth - padding.left - padding.right;
	$: innerHeight = clientHeight - padding.top - padding.bottom;

	$: xScale = scaleLinear([0, max(data, xAccessor)], [0, innerWidth]);
	$: yDomain =
		yScaleFunction === scaleLinear ? [0, max(data, yAccessor)] : [1, max(data, yAccessor)];
	$: yScale = yScaleFunction(yDomain, [innerHeight, 0]);
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

<div
	class="line-chart-container"
	bind:clientHeight
	bind:clientWidth
	bind:this={context.rootElement}
>
	<svg viewBox="0 0 {clientWidth} {clientHeight}" bind:this={context.svgElement}>
		{#await tick() then _}
			<g transform="translate({padding.left}, {padding.top})">
				<!--  -->

				<Title x={-72} y={-144}>
					<text text-anchor="start">Post COVID events</text>

					<TitleTooltip slot="tooltip" />
				</Title>

				<g class="axis" font-size="10pt" font-weight="600" fill-opacity=".6">
					<XAxis scale={xScale} y={innerHeight} width={innerWidth}>
						<AxisLabel slot="label" x={innerWidth / 2} y={72} placements={['top-start']}>
							<text>Week</text>

							<XAxisTooltip slot="tooltip" />
						</AxisLabel>
					</XAxis>

					<YAxis scale={yScale} width={innerWidth} height={innerHeight}>
						<AxisLabel slot="label" x={-72} y={innerHeight / 2} placements={['right-start']}>
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
							<path
								d={path(value)}
								fill="none"
								stroke={color}
								stroke-width="2"
								stroke-opacity=".7"
							/>

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

			<Dropdown x={(innerWidth * 3) / 4} y={48} />
		{/await}
	</svg>

	<div class="html-layer">
		<div class="html-layer-inner" bind:this={context.layerElement} />
	</div>

	<div class="scale-type" style="position:absolute; bottom:0; left:0; padding: 4px">
		<div class=" flex flex-col pl-4 pb-4">
			<label>
				<input
					type="radio"
					value="linear"
					name="scale-type"
					checked={yScaleFunction === scaleLinear}
					on:change={(ev) => {
						const currentTarget = ev.currentTarget;
						if (currentTarget.checked) {
							yScaleFunction = scaleLinear;
						}
					}}
				/>
				<span>Linear</span>
			</label>

			<label>
				<input
					type="radio"
					value="logarithmic"
					name="scale-type"
					checked={yScaleFunction === scaleLog}
					on:change={(ev) => {
						const currentTarget = ev.currentTarget;
						if (currentTarget.checked) {
							yScaleFunction = scaleLog;
						}
					}}
				/>
				<span>Logarithmic</span>
			</label>
		</div>
	</div>
</div>

<style>
	.line-chart-container {
		width: 100%;
		height: 100%;
		min-height: 100%;
		max-height: 100%;
		min-width: 100%;
		max-width: 100%;
		background-color: whitesmoke;
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
</style>
