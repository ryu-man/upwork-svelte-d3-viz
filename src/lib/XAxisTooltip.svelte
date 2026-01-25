<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
</script>

<Tooltip.Root openDelay={0}>
	<Tooltip.Trigger class="absolute bottom-0" asChild let:builder>
		<button
			use:builder.action
			{...builder}
			class="cursor-help flex items-center justify-center text-center font-bold text-xl opacity-60 absolute bottom-0 left-1/2 -translate-x-1/2"
		>
			Week
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content class="max-w-md">
		<p class="text-sm">
			This axis shows the number of weeks since diagnosis of COVID-19 (either GP diagnosis, hospital
			admission, or at-home test kit). The points show the median time to the outcome in the time
			interval studied.
		</p>
	</Tooltip.Content>
</Tooltip.Root>
