<script lang="ts">
	import { csvParse, type DSVRowArray, sort, ascending, groups, scaleLinear, scaleLog } from 'd3';
	import LineChart from '$lib/LineChart.svelte';
	import { onMount, tick } from 'svelte';
	import TitleTooltip from '$lib/TitleTooltip.svelte';
	import Title from '$lib/Title.svelte';
	import Root from '$lib/root/Root.svelte';
	import Chart from '$lib/chart/Chart.svelte';
	import CohortDropdown from './CohortDropdown.svelte';
	import OutcomeDropdown from './OutcomeDropdown.svelte';
	import { uniq, uniqBy } from 'lodash-es';
	import AnalysesDropdown from './AnalysesDropdown.svelte';

	let datasets = {};
	let selected_dataset = 'condition_1';

	const group_by_accessor = (d) => `${d['outcome']} | ${d['analysis']} | ${d['cohort']}`;
	const x_accessor = (d) => d['outcome_time_median'];
	const term_start_accessor = (d) => d['term_start'];
	const term_end_accessor = (d) => d['term_end'];
	const y_accessor = (d) => d['hr'];
	const conf_low_accessor = (d) => d['conf_low'];
	const conf_high_accessor = (d) => d['conf_high'];

	let selected_cohorts: string[] = [];
	let selected_outcomes: Map<string, Set<string>> = new Map();
	let selected_analyses = new Set<string>();
	let outcomes_order: Map<string, Date> = new Map();

	let showHorizontalLines = false;
	let showLegend = true;
	let showConnectingLines = true;

	let disable_analyses_dropdown = false;

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

	$: analyses = uniq(raw_data.map((d) => d['analysis']));

	$: filted_data = raw_data.filter((d) => {
		return (
			selected_cohorts.some((dd) => dd === d['cohort']) &&
			selected_outcomes.get(d['outcome'])?.has(d['analysis'])
		);
	});

	onMount(() => {
		reader = new FileReader();

		const onload = (ev: ProgressEvent<FileReader>) => {
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
				const raw = d.map((d) => {
					const [r0, r1] = d['term'].replace('days', '').split('_');

					return {
						cohort: d['cohort'],
						outcome: d['outcome'],
						analysis: d['analysis'],
						term: d['term'],
						term_start: +r0,
						term_end: +r1,
						hr: +d['hr'],
						conf_low: +d['conf_low'],
						conf_high: +d['conf_high'],
						outcome_time_median: +d['outcome_time_median']
					};
				});

				datasets['condition_1'] = sort(raw, (a, b) => ascending(x_accessor(a), x_accessor(b)));

				setTimeout(() => {
					selected_cohorts = [...cohorts].filter((d) => d.value).map((d) => d.value);
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
	}
</script>

<div class="h-[100svh] w-[100svw] max-w-[100svw] relative flex flex-col p-5">
	<Root>
		<Title>
			<div class="text-3xl font-black">
				Post-covid health outcomes analysis tool - Draft version - not for release
			</div>

			<TitleTooltip slot="tooltip" />
		</Title>

		<div class="mb-4">
			<p>
				This interactive visualistion tool displays data from the CONVALESCE long Covid research
				project. You can select what health outcomes data you would like to display - eg.
				cardiovascular, mental health and / or diabetes by clicking on the drop down menus. Hover
				over labels (or single click if you are on your phone) for more infomration.
			</p>
		</div>

		<div class="flex gap-4">
			<OutcomeDropdown
				data={outcomes}
				selectedAnalyses={selected_analyses}
				length={series.length}
				bind:selected={selected_outcomes}
				bind:order={outcomes_order}
				on:select-outcome={async () => {
					await tick();

					if (selected_analyses.size === 0) {
						disable_analyses_dropdown = true;
						return;
					}
				}}
				on:select-analysis={async () => {
					await tick();

					if (selected_analyses.size === 0) {
						disable_analyses_dropdown = true;
						return;
					}
				}}
				on:unselect-analysis={async () => {
					await tick();

					if (selected_outcomes.size === 0) {
						disable_analyses_dropdown = false;
					}
				}}
				on:unselect-outcome={async (ev) => {
					await tick();

					if (selected_outcomes.size === 0) {
						disable_analyses_dropdown = false;
					}
				}}
				on:clear={() => {
					disable_analyses_dropdown = false;
				}}
			/>

			<CohortDropdown data={cohorts} bind:selected={selected_cohorts} />

			<AnalysesDropdown
				data={analyses}
				disabled={disable_analyses_dropdown}
				on:change={(ev) => {
					selected_analyses = ev.detail;
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
					termStartAccessor={term_start_accessor}
					termEndAccessor={term_end_accessor}
					outcomesOrder={outcomes_order}
					{showHorizontalLines}
					{showLegend}
					{showConnectingLines}
					bind:series
					bind:dataset={selected_dataset}
				/>
			</Chart>
		</div>

		<div class="flex justify-between pt-10">
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

			<div class="flex gap-4">
				<label class="flex gap-2">
					<input
						type="checkbox"
						checked={showLegend}
						on:change={(ev) => {
							showLegend = ev.currentTarget.checked;
						}}
					/>
					<div>show legend</div>
				</label>

				<label class="flex gap-2">
					<input
						type="checkbox"
						checked={showConnectingLines}
						on:change={(ev) => {
							showConnectingLines = ev.currentTarget.checked;
						}}
					/>
					<div>show connecting lines</div>
				</label>

				<label class="flex gap-2">
					<input
						type="checkbox"
						checked={showHorizontalLines}
						on:change={(ev) => {
							showHorizontalLines = ev.currentTarget.checked;
						}}
					/>
					<div>show horizontal lines</div>
				</label>
			</div>
		</div>

		<div class="pt-10">
			<p>
				Caution is needed when viewing this graph as incorrect interpretations could lead to
				misinformation
			</p>
			<p class="text-xs">
				Click here for associated research papers - link (~hyperlink to ) This work was supported by
				the COVID-19 Longitudinal Health and Wellbeing National Core Study, which is funded by the
				Medical Research Council (MRC) and National Institute for Health and Care Research (NIHR).
				Data from up to 18,648,606 adults aged between 18 and 110 years and registered with a GP in
				England. - note - the size of sample populations for different analysis varies
				significantly.
			</p>
		</div>
	</Root>
</div>
