<script>
	export let x = 0;
	export let y = 0;
	export let y1 = 0;
	export let y2 = 0;

	let r = 4;
	let strokeOpacity = 0;
	let hover = false;

	function onPointerEnterHandler() {
		strokeOpacity = 1;
		hover = true;
	}
	function onPointerLeaveHandler() {
		strokeOpacity = 0;
		hover = false;
	}
</script>

<g
	class="path-point"
	cursor="pointer"
	transform="translate({x}, {y})"
	on:pointerenter={onPointerEnterHandler}
	on:pointerleave={onPointerLeaveHandler}
	on:click
>
	<circle
		cx="0"
		cy="0"
		r={r * 3}
		fill="currentColor"
		fill-opacity="0"
		stroke="currentColor"
		stroke-opacity={strokeOpacity}
	/>

	<circle cx="0" cy="0" {r} fill="currentColor" />

	<line
		{y1}
		{y2}
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		transform="translate(0, {-Math.abs(y1 + y2) / 2})"
	/>

	<slot {hover} />
</g>
