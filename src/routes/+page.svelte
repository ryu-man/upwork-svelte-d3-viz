<script lang="ts">
	import { csv, csvParse, type DSVRowArray } from 'd3';
	import LineChart from '$lib/LineChart.svelte';
	import { onMount } from 'svelte';

	let datasets = {};
	let selected_dataset = 'condition_1';

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

	$: data = datasets[selected_dataset] ?? [];
	$: console.log(data);

	onMount(() => {
		reader = new FileReader();

		const onload = (ev: ProgressEvent<FileReader>) => {
			console.log(ev.target?.result);
			const raw = ev.target?.result;

			const d = csvParse(raw);
			data = dataParser(d);
		};

		reader.addEventListener('load', onload);

		return () => {
			reader.removeEventListener('load', onload);
		};
	});

	onMount(() => {
		csv('/data/events_1.csv').then((d) => {
			datasets['condition_1'] = dataParser(d);
		});

		csv('/data/events_2.csv').then((d) => {
			datasets['condition_2'] = dataParser(d);
		});

		csv('/data/events_3.csv').then((d) => {
			datasets['condition_3'] = dataParser(d);
		});

		csv('/data/events_1.csv').then((d) => {
			datasets['condition_4'] = dataParser(d);
		});

		csv('/data/events_2.csv').then((d) => {
			datasets['condition_5'] = dataParser(d);
		});
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
	<LineChart
		{data}
		bind:dataset={selected_dataset}
		datasets={Object.keys(datasets)}
		{groupByAccessor}
		{xAccessor}
		{yAccessor}
		{lclAccessor}
		{uclAccessor}
	/>

	<div class="absolute bottom-0 right-0 p-2 z-[3]">
		<input type="file" on:change={onchange} />
	</div>
</div>
