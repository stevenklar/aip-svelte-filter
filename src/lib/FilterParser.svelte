<script lang="ts">
	import { parse, prettyPrintAst, summarizeGrammar } from './parser';
	import { derived, writable } from 'svelte/store';
	import { onDestroy } from 'svelte';

	export let filter: string = '';
	const filterStore = writable(filter);

	// Keep filterStore in sync with prop
	$: filterStore.set(filter);

	// Derived store for parse result
	const parseResult = derived(filterStore, ($filter) => parse($filter));
	let ast: any, isValid: boolean, error: string, prettyAst: string, summary: string;

	// Subscribe to stores and update values
	const unsub = [
		parseResult.subscribe(($result) => {
			ast = $result.ast;
			isValid = $result.isSuccess;
			error = $result.errors?.[0] ?? '';
			prettyAst = ast ? prettyPrintAst(ast) : '';
			summary = ast ? summarizeGrammar(ast) : '';
		})
	];

	// Expose a setter for advanced use
	export function setFilter(newFilter: string) {
		filterStore.set(newFilter);
	}

	// Clean up
	onDestroy(() => {
		unsub.forEach((fn) => fn());
		filterStore.set('');
	});
</script>

<!-- Headless: exposes slot props only -->
<slot {filter} {ast} {isValid} {error} {prettyAst} {summary} />
