<script lang="ts">
	export let scale;
	export let x = 0;
	export let y = 0;
	export let offset = 24;
	export let width = 0;
	export let height = 0;
	export let ticks: number[] | undefined = undefined;
	export let tickFormat: ((d: number) => string) | undefined = undefined;

	let element: SVGGElement;
	let showTooltip = false;

	function onPointerEnterHandler() {
		showTooltip = true;
	}
	function onPointerLeaveHandler() {
		showTooltip = false;
	}
</script>

<g class="x-axis" transform="translate({x}, {y})" bind:this={element}>
	<path class="domain" fill="none" stroke="rgba(0 0 0/ .6)" d="M0,{6}V0H{width}V{6}" />

	<g class="ticks">
		{#each ticks ?? scale.ticks() as tick}
			<g class="tick" transform="translate({scale(tick)}, 0)">
				<text dy={offset}>{tickFormat ? tickFormat(tick) : tick}</text>
			</g>
		{/each}
	</g>

	<g class="label" on:pointerenter={onPointerEnterHandler} on:pointerleave={onPointerLeaveHandler}>
		<slot name="label" {showTooltip} />
	</g>
</g>

<style>
	.tick {
		cursor: pointer;
	}
</style>
