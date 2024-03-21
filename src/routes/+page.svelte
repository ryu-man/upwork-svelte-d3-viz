<script lang="ts">
	import { csvParse, type DSVRowArray, sort, ascending, groups, scaleLinear, scaleLog } from 'd3';
	import LineChart from '$lib/LineChart.svelte';
	import { onMount } from 'svelte';
	import TitleTooltip from '$lib/TitleTooltip.svelte';
	import Title from '$lib/Title.svelte';
	import Root from '$lib/root/Root.svelte';
	import Chart from '$lib/chart/Chart.svelte';
	import CohortDropdown from './CohortDropdown.svelte';
	import OutcomeDropdown from './OutcomeDropdown.svelte';
	import { uniqBy } from 'lodash-es';

	let datasets = {};
	let selected_dataset = 'condition_1';

	const group_by_accessor = (d) => `${d['cohort']} | ${d['outcome']} | ${d['analysis']}`;
	const x_accessor = (d) => d['term'];
	const y_accessor = (d) => d['hr'];
	const conf_low_accessor = (d) => d['conf_low'];
	const conf_high_accessor = (d) => d['conf_high'];

	let selected_cohorts: string[] = [];
	let selected_outcomes: [string, Set<string>][] = [];

	let series: string[] = [];

	let yScale = scaleLinear;

	const data_parser = (raw: DSVRowArray<string>) => {
		return raw.map((d) => ({
			desc: d[raw.columns[0]],
			week: +d['Week'],
			hazard_ratio: +d['Hazard Ratio'],
			lower_confidence_level: +d['Lower Confidence Level'],
			upper_confidence_level: +d['Upper Confidence Level']
		}));
	};

	let reader: FileReader;

	$: raw_data = datasets[selected_dataset] ?? [];
	$: cohorts = uniqBy(raw_data, (d) => d['cohort']).map((d) => ({
		value: d['cohort'],
		selected: true
	}));
	$: outcomes = groups(
		raw_data,
		(d) => d['outcome'],
		(d) => d['analysis']
	).map(([key, value]) => [key, value.map((d) => d[0])]);
	// $: analyses = uniqBy(raw_data, (d) => d['analysis']).map((d) => d['analysis']);

	$: filted_data = raw_data.filter((d) => {
		return (
			selected_cohorts.some((dd) => dd.value === d['cohort']) &&
			selected_outcomes.some((dd) => {
				const is_outcome_selected = dd[0] === d['outcome'];

				return is_outcome_selected && dd[1].has(d['analysis']);
			})
		);
	});

	$: console.log(outcomes);

	onMount(() => {
		reader = new FileReader();

		const onload = (ev: ProgressEvent<FileReader>) => {
			console.log(ev.target?.result);
			const raw = ev.target?.result;

			const d = csvParse(raw);
			raw_data = data_parser(d);
		};

		reader.addEventListener('load', onload);

		return () => {
			reader.removeEventListener('load', onload);
		};
	});

	onMount(() => {
		// csv('/data/events_1.csv').then((d) => {
		// 	datasets['condition_1'] = dataParser(d);
		// });
		// csv('/data/events_2.csv').then((d) => {
		// 	datasets['condition_2'] = dataParser(d);
		// });
		// csv('/data/events_3.csv').then((d) => {
		// 	datasets['condition_3'] = dataParser(d);
		// });
		// csv('/data/events_1.csv').then((d) => {
		// 	datasets['condition_4'] = dataParser(d);
		// });
		// csv('/data/events_2.csv').then((d) => {
		// 	datasets['condition_5'] = dataParser(d);
		// });
	});

	onMount(() => {
		fetch(
			'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhh7lL2mS7hc0L33NP83Ytadymj8K498730NUjuATR-UsGBTetjFL8Rs4ZQZ5bxjnnHZzEfkViTUHm/pub?output=csv'
		)
			.then((d) => d.text())
			.then((d) => csvParse(d))
			.then((d) => {
				const raw = d.map((d) => ({
					cohort: d['cohort'],
					outcome: d['outcome'],
					analysis: d['analysis'],
					term: +d['term'].split('_')[0].replace('days', ''),
					hr: +d['hr'],
					conf_low: +d['conf_low'],
					conf_high: +d['conf_high'],
					outcome_time_median: +d['outcome_time_median']
				}));

				datasets['condition_1'] = sort(raw, (a, b) => ascending(x_accessor(a), x_accessor(b)));

				setTimeout(() => {
					selected_cohorts = [...cohorts];
				}, 300);
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

<div class="h-[100svh] w-[100svw] max-w-[100svw] relative flex flex-col p-5">
	<Root>
		<Title>
			<div class="text-3xl font-black">Post COVID events</div>

			<TitleTooltip slot="tooltip" />
		</Title>

		<div class="flex gap-4">
			<CohortDropdown
				data={cohorts}
				on:change={(ev) => {
					selected_cohorts = ev.detail;
				}}
			/>
			<OutcomeDropdown
				data={outcomes}
				disabled={series.length >= 7}
				on:change={(ev) => {
					selected_outcomes = ev.detail;
					console.log(selected_outcomes);
				}}
			/>
		</div>

		<div class="bg-red-500 w-full" />

		<div class="flex-1 pr-8 py-12 pl-28 pb-20 pt-20">
			<Chart>
				<LineChart
					{yScale}
					data={filted_data}
					datasets={Object.keys(datasets)}
					groupByAccessor={group_by_accessor}
					xAccessor={x_accessor}
					yAccessor={y_accessor}
					lclAccessor={conf_low_accessor}
					uclAccessor={conf_high_accessor}
					bind:series
					bind:dataset={selected_dataset}
				/>
			</Chart>
		</div>

		<div class="flex justify-between">
			<div class="flex gap-4">
				<label>
					<input
						type="radio"
						value="linear"
						name="scale-type"
						checked={yScale === scaleLinear}
						on:change={(ev) => {
							const currentTarget = ev.currentTarget;
							if (currentTarget.checked) {
								yScale = scaleLinear;
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
						checked={yScale === scaleLog}
						on:change={(ev) => {
							const currentTarget = ev.currentTarget;
							if (currentTarget.checked) {
								yScale = scaleLog;
							}
						}}
					/>
					<span>Logarithmic</span>
				</label>
			</div>

			<div class="bottom-0 right-0 p-2 z-[3]">
				<input type="file" on:change={onchange} />
			</div>
		</div>
	</Root>
</div>
