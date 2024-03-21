<script>
	import { tick } from 'svelte';
	import { setChartContext } from './context';

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
	>
		<g transform="translate({0}, {0})">
			{#await tick() then _}
				<slot />
			{/await}
		</g>
	</svg>
</div>
