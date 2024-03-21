<script>
	import { tick } from 'svelte';
	import { setRootContext } from './context';

	let clientWidth = 0;
	let clientHeight = 0;

	const context = setRootContext();
</script>

<div class="chart-root h-full w-full flex flex-col" bind:this={context.root_element}>
	<slot />

	<div class="html-layer">
		<div class="html-layer-inner" bind:this={context.layer_element} />
	</div>
</div>
