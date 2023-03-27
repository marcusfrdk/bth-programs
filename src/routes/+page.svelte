<script lang="ts">
	import type { IProgram } from '../types/Program';
	import { browser } from '$app/environment';
	import Header from '$components/Header.svelte';
	import YearSelector from '$components/YearSelector.svelte';
	import { onMount } from 'svelte';
	import ProgramOverview from '$components/ProgramOverview.svelte';
	import Courses from '$components/Courses.svelte';
	import Footer from '$components/Footer.svelte';

	export let data: { programs: Record<string, string[]> };

	let program: IProgram;
	let years: string[] = [];
	let selectedCode: string;
	let selectedYear: string;

	async function getProgramUntilSuccess() {
		// Function to auto-load another program if the attempted program does not exist.
		const list: [string, string][] = [];
		Object.entries(data.programs).forEach(([m, values]) => {
			values.forEach((n) => {
				list.push([m, n]);
			});
		});

		let success = false;
		let i = 0;
		while (!success) {
			const url = `/data/${list[i][0]}${list[i][1]}.json`;
			const res = await fetch(url);
			if (res.status === 200) {
				program = await res.json();
				years = data.programs[list[i][0]];
				success = true;
			} else {
				i++;
			}
		}
	}

	async function getProgram(code: string, year: string): Promise<void> {
		const url = `/data/${code}${year}.json`;
		const res = await fetch(url);
		if (res.status === 200) {
			program = await res.json();
			years = data.programs[code];
		} else {
			getProgramUntilSuccess();
		}
	}

	async function updateProgram(code: string): Promise<void> {
		selectedCode = code;
		selectedYear = data.programs[code][0];
		localStorage.setItem('code', code);
		localStorage.removeItem('year');
		await getProgram(code, selectedYear);
	}

	async function updateYear(year: string): Promise<void> {
		selectedYear = year;
		localStorage.setItem('year', selectedYear);
		await getProgram(selectedCode, year);
	}

	onMount(async () => {
		if (browser) {
			const key = localStorage.getItem('code') || Object.keys(data.programs)[0];
			const value = localStorage.getItem('year') || data.programs[key][0];
			getProgram(key, value);
			selectedCode = key;
			selectedYear = value;
		}
	});
</script>

<svelte:head>
	<title>BTH Program och Kurser</title>
	<meta
		name="description"
		content="En webbapplikation för att få en överblick över alla utbildningar på Blekinge Tekniska Högskola. Appen låter en användare se mer detaljerad och snabbare vy än den officiella källan."
	/>
	<meta name="canonical" content="https://bth.marcusfredriksson.com" />
</svelte:head>

<main>
	<Header
		programName={program?.name}
		program={selectedCode}
		programs={Object.keys(data.programs)}
		onSelectProgram={updateProgram}
		onSelectYear={updateYear}
		{years}
		{selectedYear}
	/>
	<ProgramOverview {program} />
	<Courses {program} />
	<Footer {program} />
</main>

<style lang="scss">
	main {
		min-height: var(--viewport-height);
		overflow-x: hidden;
	}
</style>
