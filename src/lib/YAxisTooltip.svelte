<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
</script>

<Tooltip.Root openDelay={0}>
	<Tooltip.Trigger class="" asChild let:builder>
		<button
			use:builder.action
			{...builder}
			class="cursor-help flex items-center justify-center text-center font-bold text-xl opacity-60 absolute left-0 top-1/2 h-fit"
			style="writing-mode: vertical-lr; transform: rotate(180deg) translateY(50%);"
		>
			Hazard Ratio
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content class="max-w-md">
		<p class="text-sm">
			A hazard ratio is a way of comparing how quickly something happens in one group (here, people
			who were diagnosed with COVID-19) compared with another group (people who were not diagnosed
			with COVID-19) over time. A hazard ratio of 1 means there is no difference between the groups.
			A hazard ratio greater than 1 means the outcome is more common in people who were diagnosed
			with COVID-19. A hazard ratio less than 1 means the outcome is less common in people who were
			diagnosed with COVID-19. Each hazard ratio is accompanied by a confidence interval. Confidence
			intervals show the range of values that the true hazard ratio is likely to fall within.
		</p>
	</Tooltip.Content>
</Tooltip.Root>
