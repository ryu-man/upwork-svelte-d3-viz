<script lang="ts">
	import { csv, csvParse, type DSVRowArray } from 'd3';
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

	let reader: FileReader;

	onMount(() => {
		reader = new FileReader();

		const onload = (ev: ProgressEvent<FileReader>) => {
			console.log(ev.target?.result);
			const raw = ev.target?.result;

			const d = csvParse(raw);
			data = dataParser(d);
		};

		reader.addEventListener('load', onload);

		csv('/data/data.csv').then((d) => {
			data = dataParser(d);
		});

		return () => {
			reader.removeEventListener('load', onload);
		};
	});

	function onchange(ev: Event) {
		const currentTarget = ev.currentTarget as HTMLInputElement;

		const files = currentTarget.files;
		const first_line = files?.item(0);

		if (first_line) {
			reader.readAsText(first_line);
		}

		console.log(files);
	}
</script>

<div class="h-[100svh] w-[100svw] relative">
	<LineChart {data} {groupByAccessor} {xAccessor} {yAccessor} {lclAccessor} {uclAccessor} />

	<div class="absolute bottom-0 right-0 p-2 z-[3]">
		<input type="file" on:change={onchange} />
	</div>
</div>
