<script lang="ts">
	export let value = 0;

	let contentRect: DOMRectReadOnly;
	let padding = 16;
</script>

<g
	class="tooltip"
	transform="translate(-{(contentRect?.width || 0) / 2}, -{contentRect?.height ||
		0}) translate(0, -36)"
>
	{#if contentRect}
		<rect
			x={-padding}
			y={-padding}
			width={(contentRect?.width || 0) + padding * 2}
			height={(contentRect?.height || 0) + padding * 2}
			fill="white"
		/>
	{/if}

	<g class="tooltip-content" dominant-baseline="hanging" bind:contentRect>
		<text y={0}>{value.toFixed(1)} x</text>
		<text y="20">Increased likelihood</text>
	</g>
</g>
