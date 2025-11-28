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
	const itemHeight = 28;
</script>

<div class="legend bg-white shadow-sm p-4 rounded-lg border border-neutral-200">
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.legend {
	}
</style>
