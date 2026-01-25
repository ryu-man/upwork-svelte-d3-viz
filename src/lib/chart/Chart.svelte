<script>
	import { tick } from 'svelte';
	import { setChartContext } from './context';
	import XAxisTooltip from '$lib/XAxisTooltip.svelte';
	import YAxisTooltip from '$lib/YAxisTooltip.svelte';

	const context = setChartContext();
	const client_width = context.client_width;
	const client_height = context.client_height;
</script>

<div
	class="chart-container w-full h-full relative overflow-visible"
	bind:clientHeight={$client_height}
	bind:clientWidth={$client_width}
	bind:this={context.root_element}
>
	<svg
		class="w-full h-full overflow-visible"
		viewBox="0 0 {$client_width} {$client_height}"
		bind:this={context.svg_element}
		role="img"
		aria-label="Interactive line chart showing health outcomes following COVID-19"
	>
		<title>Health Outcomes Following COVID-19</title>
		<desc
			>Line chart displaying hazard ratios over time for various health outcomes, cohorts, and
			analyses related to COVID-19</desc
		>
		<g transform="translate({0}, {0})">
			{#await tick() then _}
				<slot />
			{/await}
		</g>
	</svg>
</div>

<XAxisTooltip />

<YAxisTooltip />
