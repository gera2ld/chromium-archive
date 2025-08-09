

<script lang="ts">
	import { platforms } from '$lib/constants';
	import type { IPlatform } from '$lib/types';
	import { onMount } from 'svelte';

	interface IMilestoneRecord {
		milestone: number;
		prefix: IPlatform;
		revision: number;
	}

	interface IUpdateLog {
		prefix: string;
		updatedAt: string;
	}

	let platform = $state<IPlatform>('Mac');
	let milestone = $state('');
	let fullData = $state<{
		records: IMilestoneRecord[];
		updatedAt: IUpdateLog[];
	}>();

	const time = $derived(fullData?.updatedAt.find((item) => item.prefix === platform)?.updatedAt);
	const rowsByPlatform = $derived(
		(fullData?.records || [])
			.filter((record) => record.prefix === platform)
			.sort((a, b) => b.milestone - a.milestone),
	);
	const rows = $derived(
		milestone ? rowsByPlatform.filter((row) => row.milestone === +milestone) : rowsByPlatform,
	);

	function guessPlatform() {
		let os = (navigator.userAgent.match(/(win|linux|mac)/i)?.[1] || 'linux').toLowerCase();
		const platform = platforms.find((p) => p.toLowerCase().includes(os)) || platforms[0];
		return platform;
	}

	function getSnapshotUrl(platform: string, revision: number) {
		return `https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${platform}/${revision}/`;
	}

	onMount(async () => {
		const { default: data } = (await import('../data/chromium-data.json')) as {
			default: typeof fullData;
		};
		fullData = data;
		platform = guessPlatform();
	});
</script>

<div class="bg-gray-50/50 text-gray-800">
	<div class="container mx-auto flex min-h-screen flex-col p-4 sm:p-6 lg:p-8">
		<header class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Chromium Archive</h1>
			<p class="mt-3 text-lg text-gray-600">
				Easily find and download any historical version of Chromium.
			</p>
		</header>

		<section id="features" class="my-10">
			<div class="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
				<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-xl font-semibold text-gray-900">Comprehensive History</h3>
					<p class="mt-2 text-gray-600">
						Access a full archive of Chromium builds, from the latest milestone back to the earliest
						available versions.
					</p>
				</div>

				<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-xl font-semibold text-gray-900">Official & Secure</h3>
					<p class="mt-2 text-gray-600">
						All downloads link directly to the official, secure Google Storage APIs for Chromium.
					</p>
				</div>

				<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.871A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-xl font-semibold text-gray-900">Multiple Platforms</h3>
					<p class="mt-2 text-gray-600">Find builds for Mac, Windows, and Linux.</p>
				</div>
			</div>
		</section>

		<main class="flex flex-col">
			<div
				class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
			>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<div>
						<label for="platform-select" class="mr-2 font-medium text-gray-700">Platform:</label>
						<select
							id="platform-select"
							class="focus:ring-opacity-50 rounded-md border-gray-300 px-2 py-1.5 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
							bind:value={platform}
						>
							{#each platforms as item (item)}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="milestone-input" class="mr-2 font-medium text-gray-700">Milestone:</label>
						<input
							id="milestone-input"
							type="number"
							placeholder="e.g. 126"
							class="focus:ring-opacity-50 w-32 rounded-md border-gray-300 px-2 py-1.5 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
							bind:value={milestone}
						/>
					</div>
				</div>
				{#if time}
					<div class="text-sm text-gray-500">
						Last updated:
						<span class="font-medium text-green-700">{new Date(time).toLocaleString()}</span>
					</div>
				{/if}
			</div>

			<div
				class="relative h-[60vh] max-h-[700px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm"
			>
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="sticky top-0 bg-gray-100">
						<tr>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Milestone
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Revision
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Download
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#if !rows.length}
							<tr>
								<td colspan="3" class="py-12 text-center text-gray-500">
									<p>No records found for the selected criteria.</p>
								</td>
							</tr>
						{/if}
						{#each rows as row (row.revision)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
									{row.milestone}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{row.revision}</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap">
									<a
										class="font-medium text-blue-600 hover:text-blue-800 hover:underline"
										href={getSnapshotUrl(platform, row.revision)}
										target="_blank"
										rel="noopener noreferrer"
									>
										Go to downloads
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</main>

		<section id="about" class="my-10">
			<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<h2 class="text-2xl font-bold text-gray-900">About Chromium</h2>
				<p class="mt-4 text-gray-600">
					Chromium is the open-source web browser project from which Google Chrome draws its source
					code. It is designed to be a safer, faster, and more stable way for all Internet users
					to experience the web.
				</p>
				<p class="mt-4 text-gray-600">
					This archive provides access to historical builds of Chromium. This can be useful for
					developers and testers who need to test their websites or applications on older versions
					of the browser.
				</p>
			</div>
		</section>
	</div>
</div>
