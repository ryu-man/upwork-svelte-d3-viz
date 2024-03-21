import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

const CHART_CONTEXT_KEY = 'chart_context_key';

export type ChartContext = {
	root_element: HTMLElement;
	svg_element: SVGElement;
	client_width: Writable<number>;
	client_height: Writable<number>;
};

export function getChartContext() {
	return getContext(CHART_CONTEXT_KEY) as ChartContext;
}
export function setChartContext() {
	return setContext(CHART_CONTEXT_KEY, {
		root_element: undefined,
		svg_element: undefined,
		client_width: writable(0),
		client_height: writable(0)
	}) as Partial<ChartContext>;
}
