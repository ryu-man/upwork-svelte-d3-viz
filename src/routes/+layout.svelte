<script>
	import '../app.pcss';

	let showMobileWarning = true;
</script>

<!-- Mobile Warning Overlay -->
{#if showMobileWarning}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 md:hidden"
	>
		<div class="size-full flex flex-col items-center justify-center relative">
			<button
			class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
			on:click={() => (showMobileWarning = false)}
			aria-label="Close warning"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="w-5 h-5"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
		<div class="max-w-md text-center text-white relative">
			<h2 class="mb-4 text-2xl font-bold">Not Optimized for Mobile</h2>
			<p class="text-lg leading-relaxed">
				This visualization is not built for mobile phones. You can use your phone in horizontal mode
				if you want, but the graph is likely to be too small to read. For the best experience and to
				accurately read the data, please open the visualization on a desktop or laptop.
			</p>
		</div>
		</div>
	</div>
{/if}

<div class="size-full min-w-svw min-h-svh flex flex-col">
	<slot />
</div>
