<script lang="ts">
	import { fly, slide } from 'svelte/transition';

	export let x = 0;
	export let y = 0;
	export let transform = '';
</script>

<div
	class="tooltip"
	style:transform="translate({x}px, {y}px) {transform}"
	transition:fly={{ duration: 100, x: -16 }}
>
	<h1>Increased likelihood</h1>
	<p>
		Neque sollicitudin amet pretium mi ac nisi faucibus ut phasellus nam fames gravida dis dapibus
		arcu inceptos consectetuer libero imperdiet vel aenean dignissim fusce
	</p>
</div>

<style lang="postcss">
	.tooltip {
		position: absolute;
		top: 0;
		left: 0;
		padding: 12px 16px;
		background-color: white;
		border-radius: 4px;
		pointer-events: none;
		max-width: 36vw;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 4px 1px rgba(0 0 0 / 0.1);
	}

	h1 {
		margin: 4px 0;
		font-size: 20pt;
	}
	p {
		padding: 0;
		margin: 0;
	}
</style>
