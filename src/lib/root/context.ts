import { getContext, setContext } from 'svelte';

const CHART_CONTEXT_KEY = 'chart_context_key';

export type RootContext = {
	root_element: HTMLDivElement;
	layer_element: HTMLDivElement;
};

export function getRootContext() {
	return getContext(CHART_CONTEXT_KEY) as RootContext;
}
export function setRootContext() {
	return setContext(CHART_CONTEXT_KEY, {
		root_element: undefined,
		layer_element: undefined
	}) as Partial<RootContext>;
}
