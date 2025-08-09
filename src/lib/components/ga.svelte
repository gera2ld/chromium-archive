<script lang="ts">
	import { browser } from '$app/environment';
	let { id }: { id: string } = $props();

	if (browser) {
		/* eslint-disable */
		(window as any).dataLayer = (window as any).dataLayer || [];
		function gtag(..._args: any[]) {
			// It seems that `...args` does not work.
			(window as any).dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', id);
	}
</script>

<svelte:head>
	<script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`}></script>
</svelte:head>
