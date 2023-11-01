import { getContext, setContext } from 'svelte';

const CHART_CONTEXT_KEY = 'chart_context_key';

export type ChartContext = {
	rootElement: HTMLDivElement;
	svgElement: SVGElement;
	layerElement: HTMLDivElement;
};

export function getChartContext() {
	return getContext(CHART_CONTEXT_KEY) as ChartContext;
}
export function setChartContext() {
	return setContext(CHART_CONTEXT_KEY, {
		rootElement: undefined,
		svgElement: undefined,
		layerElement: undefined
	}) as Partial<ChartContext>;
}
