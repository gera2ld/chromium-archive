<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import Ga from '$lib/components/ga.svelte';
	import { CANONICAL_URL } from '$lib/constants';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Chromium Archive - Download Old & Specific Versions</title>
	<meta
		name="description"
		content="Easily find and download any historical version of Chromium for Mac, Windows, and Linux. Access a full archive of official and secure Chromium builds."
	/>
	<meta
		name="keywords"
		content="Chromium, download Chromium, Chromium archive, old Chromium versions, Chromium builds, specific Chromium version, download old chromium, chromium browser download"
	/>
	<link rel="canonical" href={CANONICAL_URL} />
	<meta property="og:title" content="Chromium Archive - Download Old & Specific Versions" />
	<meta
		property="og:description"
		content="Easily find and download any historical version of Chromium for Mac, Windows, and Linux. Access a full archive of official and secure Chromium builds."
	/>
	<meta property="og:url" content={CANONICAL_URL} />
	<meta property="og:type" content="website" />
	<link rel="icon" href={favicon} />
</svelte:head>

<Ga id="G-K3SVNH15H9" />

{@render children?.()}
