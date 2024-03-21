<script lang="ts">
	import { getRootContext } from './root/context';
	import { portal } from './actions';

	const root_context = getRootContext();

	type LegendItem = {
		label: String;
		color: string;
	};

	export let x = 0;
	export let y = 0;
	export let padding = 0;
	export let data: LegendItem[] = [];

	const itemHeight = 28;

</script>

<div class="legend bg-white shadow-sm p-4 rounded-lg border border-neutral-200">
	<div class="content">
		{#each data as item}
			<div class="legend-item flex items-center gap-2" style:color={item.color}>
				<div class="w-12 min-h-[1px] bg-current" />
				<div>{item.label}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.legend {
	}
</style>
