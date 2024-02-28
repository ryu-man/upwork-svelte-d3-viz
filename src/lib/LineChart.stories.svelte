<script context="module">
	import LineChart from './LineChart.svelte';

	export const meta = {
		title: 'Charts/Line',
		component: LineChart
	};
</script>

<script lang="ts">
	import { Story } from '@storybook/addon-svelte-csf';
	import { csv } from 'd3';

	let data = [];

	const groupByAccessor = (d) => d['desc'];
	const xAccessor = (d) => d['week'];
	const yAccessor = (d) => d['hazard_ratio'];
	const lclAccessor = (d) => d['lower_confidence_level'];
	const uclAccessor = (d) => d['upper_confidence_level'];

	const dataParser = (raw) => {
		return raw.map((d) => ({
			desc: d['DESC'],
			week: +d['Week'],
			hazard_ratio: +d['Hazard Ratio'],
			lower_confidence_level: +d['Lower Confidence Level'],
			upper_confidence_level: +d['Upper Confidence Level']
		}));
	};

	csv('./data/data.csv').then((d) => {
		data = dataParser(d);
	});
</script>

<Story name="Line">
	<LineChart {data} {groupByAccessor} {xAccessor} {yAccessor} {lclAccessor} {uclAccessor} />
</Story>
