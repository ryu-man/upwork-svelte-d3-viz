<script lang="ts">
	import {
		autoPlacement,
		autoUpdate,
		computePosition,
		offset,
		type Placement
	} from '@floating-ui/dom';
	import { portal } from './actions';
	import { getChartContext } from './context';
	import { tick } from 'svelte';

	const context = getChartContext();

	export let reference: Element;
	export let placements: Placement[] = [];
	export let open = false;

	let mounted = false;

	let dx = 0;
	let dy = 0;

	$: if (!open) {
		mounted = false;
	}

	type InitParamas = { reference: Element; placements: Placement[] | undefined };

	function init(node: HTMLElement, { placements, reference }: InitParamas) {
		node.hidden = true;

		let cleanup: (() => void) | undefined = undefined;

		portal(node, context.layerElement);
		attach(node, { reference, placements }).then(() => {
			cleanup = autoUpdate(reference, node, async () => {
				node.hidden = true;
				portal(node, context.layerElement);
				await tick();
				attach(node, { reference, placements });
			});
		});

		return {
			update({ reference }: InitParamas) {
				if (!reference) return;
				portal(node, context.layerElement);
			},
			destroy() {
				cleanup?.();
			}
		};

		function attach(node: HTMLElement, { placements, reference }: InitParamas) {
			return computePosition(reference, node, {
				middleware: [
					offset(16),
					autoPlacement({
						allowedPlacements: placements
					})
				]
			}).then(async ({ x, y, placement }) => {
				dy = placement.startsWith('top') ? 1 : placement.startsWith('bottom') ? -1 : 0;

				dx = placement.startsWith('left') ? 1 : placement.startsWith('right') ? -1 : 0;

				node.style.transform = `translate(${x}px, ${y}px)`;

				await tick();

				mounted = true;
			});
		}
	}
</script>

{#if open}
	<div class="popover" use:init={{ placements, reference }}>
		<div class="popover-inner">
			{#if mounted}
				<slot {dx} {dy} />
			{/if}
		</div>
	</div>
{/if}

<style lang="postcss">
	.popover {
		@apply absolute top-0 left-0;
	}
</style>
