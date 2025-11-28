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
	import * as Collapsible from '$lib/components/ui/collapsible';

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

	$: filtered_data = raw_data.filter((d) => {
		return (
			selected_cohorts.some((dd) => dd === d['cohort']) &&
			selected_outcomes.get(d['outcome'])?.has(d['analysis'])
		);
	});

	$: if (!selected_outcomes.size) {
		const first_outcome = outcomes.at(0);
		if (first_outcome) {
			selected_outcomes.set(first_outcome[0], new Set(['Main']));
			selected_outcomes = selected_outcomes;
		}
	}

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
			'https://docs.google.com/spreadsheets/d/e/2PACX-1vQABTCPnKqIW_95711GgxYMUI53uhhJRY0n9xzq0w1SWxCqRovvOKubi1eB3D4crmiBlO095hsHw3TD/pub?output=csv'
		)
			.then((d) => d.text())
			.then((d) => csvParse(d))
			.then((d) => {
				const raw = d
					.map((d) => {
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
					})
					.filter((d) => Math.abs(d.term_end - d.term_start) > 1); // filter out 1 day terms

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

<div class="h-[100svh] w-[100svw] max-w-[100svw] relative flex flex-col px-8 py-6">
	<Root>
		<div class="flex flex-col gap-4 mb-6">
			<h1 class="text-3xl font-bold">Investigating health outcomes following COVID-19</h1>

			<p class="text-base leading-relaxed text-gray-700">
				This interactive visualisation tool displays data from the Convalescence Long Covid research
				project. You can select what health outcome you would like to display - e.g., acute
				myocardial infarction, depression or type 2 diabetes by clicking on the drop-down menus.
				Hover over labels (or single click if you are on your phone) for more information.
			</p>
		</div>

		<div class="flex gap-4 mb-6">
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

		<div class="flex-1 pr-12 pl-24 py-16 min-h-[64svh]">
			<Chart>
				<LineChart
					{yScale}
					data={filtered_data}
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

		<div class="flex justify-between items-center pt-8 pb-6">
			<div class="flex gap-6">
				<label class="flex items-center gap-2 cursor-pointer">
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
					<span class="text-sm font-medium">Linear</span>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
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
					<span class="text-sm font-medium">Logarithmic</span>
				</label>
			</div>

			<div class="flex gap-6">
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={showLegend}
						on:change={(ev) => {
							showLegend = ev.currentTarget.checked;
						}}
					/>
					<div class="text-sm font-medium">Show legend</div>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={showConnectingLines}
						on:change={(ev) => {
							showConnectingLines = ev.currentTarget.checked;
						}}
					/>
					<div class="text-sm font-medium">Show connecting lines</div>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={showHorizontalLines}
						on:change={(ev) => {
							showHorizontalLines = ev.currentTarget.checked;
						}}
					/>
					<div class="text-sm font-medium">Show horizontal lines</div>
				</label>
			</div>
		</div>

		<div class="pt-8 pb-6 border-t border-gray-200">
			<p class="text-sm text-gray-600 leading-relaxed">
				Caution is needed when viewing this graph as incorrect interpretations could lead to
				misinformation ___ Additional Cautionary notes__ ___ Close to 1, or CL overlapping__
			</p>
		</div>

		<div class="py-6">
			<div class="flex flex-col">
				<div class="text-xl font-semibold mb-4">Attributions</div>
				<ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
					<li>
						Click here for associated research papers - link <a
							class="text-blue-600 underline"
							href="https://www.bristol.ac.uk/population-health-sciences/centres/ehr/research/-convalescence-long-covid-study"
							>https://www.bristol.ac.uk/population-health-sciences/centres/ehr/research/-convalescence-long-covid-study</a
						>
					</li>
					<li>
						This work was supported by the COVID-19 Longitudinal Health and Wellbeing National Core
						Study, which is funded by the Medical Research Council (MRC) and National Institute for
						Health and Care Research (NIHR). Data was accessed through OpenSAFELY-TPP, which
						provides secure, privacy-protecting access to linked data from 24 million people
						registered with general practices (GPs) in England using TPP SystmOne software. Note:
						the sample size in each analysis differs according to the subgroup selected.
					</li>
				</ul>
			</div>

			<div class="flex flex-col pt-8 mt-6 border-t border-gray-200">
				<div class="text-xl font-semibold mb-5">FAQs</div>
				<div class="space-y-3">
					<Collapsible.Root>
						<Collapsible.Trigger
							class="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<span class="font-medium text-sm">What does "history of COVID-19" mean?</span>
							<svg
								class="w-5 h-5 transition-transform"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</Collapsible.Trigger>
						<Collapsible.Content class="px-4 py-3 text-sm text-gray-700 space-y-3">
							<p>
								When we talk about <em>history of COVID-19</em>, we simply mean whether the people
								in the analysis had COVID-19 before our study period began.
							</p>
							<p>
								For the vaccinated and unvaccinated cohorts, our study starts on 18 June 2021, the
								date when all adults became eligible for vaccination. Some people had already had
								COVID-19 before this date. We looked at this subgroup separately to see if having
								COVID-19 before affected the association between COVID-19 and the health outcomes we
								measured.
							</p>
							<p>
								For the pre-vaccination cohort, the study begins on 1 January 2020, at the very
								start of the pandemic. As COVID-19 didn't exist before then, no one could have had a
								prior history of COVID-19 in this cohort.
							</p>
						</Collapsible.Content>
					</Collapsible.Root>

					<Collapsible.Root>
						<Collapsible.Trigger
							class="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<span class="font-medium text-sm"
								>What is the difference between the pre-vaccination and unvaccinated cohorts?</span
							>
							<svg
								class="w-5 h-5 transition-transform"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</Collapsible.Trigger>
						<Collapsible.Content class="px-4 py-3 text-sm text-gray-700 space-y-3">
							<p>
								In both groups, people had not received any COVID-19 vaccines at the time they were
								diagnosed with COVID-19. The key difference is when they were diagnosed and,
								therefore, which variant they were most likely exposed to.
							</p>
							<p>
								In the pre-vaccination cohort, people were diagnosed with COVID-19 between 1 January
								2020 and the date they became eligible for vaccination (or the date they were
								vaccinated, if that happened earlier). During this period, the main variants
								circulating were the original (wild-type) virus and the Alpha variant.
							</p>
							<p>
								In the unvaccinated cohort, people were diagnosed with COVID-19 between 18 June 2021
								and 14 December 2021 (the date that Omicron became dominant in the UK). At this
								time, the main variant circulating was the Delta variant.
							</p>
						</Collapsible.Content>
					</Collapsible.Root>

					<Collapsible.Root>
						<Collapsible.Trigger
							class="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<span class="font-medium text-sm">What is the coverage of the analysis?</span>
							<svg
								class="w-5 h-5 transition-transform"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</Collapsible.Trigger>
						<Collapsible.Content class="px-4 py-3 text-sm text-gray-700 space-y-3">
							<p>
								Our <em>main</em> analysis includes all adults aged 18 to 110 who were registered
								with a GP practice in England that uses TPP SystmOne software at the start of the
								study. To be included, people also needed to have been registered for at least six
								months beforehand and have basic information recorded, such as age and sex. TPP
								SystmOne is used by about 40% of GP practices in England, and the data is broadly
								representative of the English population (see
								<a
									href="https://doi.org/10.12688/wellcomeopenres.18010.1"
									class="text-blue-600 underline">doi:10.12688/wellcomeopenres.18010.1</a
								>).
							</p>
							<p>
								The subgroup analyses (for example, <strong>Ethnicity: Black</strong> or
								<strong>Sex: Female</strong>) are drawn from this same population. Because each
								subgroup includes only the people who fit that specific characteristic, their sample
								sizes are smaller than in the main analysis. For instance, the <em>Sex: Female</em> group
								includes roughly half of the main population, while subgroups defined by ethnicity or
								other factors may be much smaller.
							</p>
						</Collapsible.Content>
					</Collapsible.Root>

					<Collapsible.Root>
						<Collapsible.Trigger
							class="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<span class="font-medium text-sm"
								>Why is there sometimes an uptick in hazard ratio at the end of the plot?</span
							>
							<svg
								class="w-5 h-5 transition-transform"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</Collapsible.Trigger>
						<Collapsible.Content class="px-4 py-3 text-sm text-gray-700 space-y-3">
							<p>
								A rise in the hazard ratio near the end of the plot should be interpreted with
								caution. This can happen because fewer events are recorded in that final time
								period. As time goes on, the number of people included in the analysis naturally
								becomes smaller — for example, some may have already experienced the outcome, died,
								or left their GP practice. With fewer people and fewer events, the estimates become
								less stable, which can make the hazard ratio appear to rise even if there's no real
								change in risk.
							</p>
						</Collapsible.Content>
					</Collapsible.Root>
				</div>
			</div>
		</div>
	</Root>
</div>
