<script lang="ts">
	import { csv, type DSVRowArray } from 'd3';
	import LineChart from '$lib/LineChart.svelte';
	import { onMount } from 'svelte';

	let data = [];

	const groupByAccessor = (d) => d['desc'];
	const xAccessor = (d) => d['week'];
	const yAccessor = (d) => d['hazard_ratio'];
	const lclAccessor = (d) => d['lower_confidence_level'];
	const uclAccessor = (d) => d['upper_confidence_level'];

	const dataParser = (raw: DSVRowArray<string>) => {
		return raw.map((d) => ({
			desc: d[raw.columns[0]],
			week: +d['Week'],
			hazard_ratio: +d['Hazard Ratio'],
			lower_confidence_level: +d['Lower Confidence Level'],
			upper_confidence_level: +d['Upper Confidence Level']
		}));
	};

	onMount(() => {
		csv('/data/data.csv').then((d) => {
			data = dataParser(d);
		});
	});
</script>

<div class="h-[100svh] w-[100svw]">
	<LineChart {data} {groupByAccessor} {xAccessor} {yAccessor} {lclAccessor} {uclAccessor} />
</div>
