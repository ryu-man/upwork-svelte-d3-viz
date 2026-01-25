<script lang="ts">
	export let scale;
	export let x = 0;
	export let y = 0;
	export let offset = -24;
	export let width = 0;
	export let height = 0;

	let element: SVGGElement;
	let showTooltip = false;

	function onPointerEnterHandler() {
		showTooltip = true;
	}
	function onPointerLeaveHandler() {
		showTooltip = false;
	}
</script>

<g class="y-axis" transform="translate({x}, {y})" bind:this={element} role="graphics-document" aria-label="Y-axis showing hazard ratio">
	<path class="domain" fill="none" stroke="rgba(0 0 0/ .6)" d="M{-6},0H0V{height}H{-6}" />

	<g class="ticks" aria-label="Y-axis tick marks">
		{#each scale.ticks() as tick}
			{@const y = scale(tick)}
			<g class="tick" transform="translate(0, {y})" aria-label="Hazard ratio {tick.toFixed(1)}">
				<text dx={offset} text-anchor="end" dominant-baseline="middle">{tick.toFixed(1)}</text>
				<line x1="0" x2={width} {y} stroke="rgb(0 0 0)" stroke-opacity=".1" />
			</g>
		{/each}
	</g>

	<g class="label" 
		on:pointerenter={onPointerEnterHandler} 
		on:pointerleave={onPointerLeaveHandler}
		role="button"
		tabindex="0"
		aria-label="Y-axis label: Click for more information"
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				showTooltip = !showTooltip;
			}
		}}
	>
		<slot name="label" {showTooltip} />
	</g>
</g>

