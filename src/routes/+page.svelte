<script lang="ts">
	import type { IProgram } from "../types/Program";
	import { browser } from "$app/environment";
	import Header from "$components/Header.svelte";
	import YearSelector from "$components/YearSelector.svelte";
  import { onMount } from "svelte";
	import ProgramOverview from "$components/ProgramOverview.svelte";
	import Courses from "$components/Courses.svelte";
	import Footer from "$components/Footer.svelte";
  
  export let data: {programs: Record<string, string[]>};

  let program: IProgram;
  let years: string[] = [];
  let selectedCode: string;
  let selectedYear: string;

  async function getProgram(code: string, year: string): Promise<void> { 
    const url = `/data/${code}${year}.json`;
    const res = await fetch(url);
    program = await res.json(); 
    years = data.programs[code]
  }

  async function updateProgram(code: string): Promise<void> {
    selectedCode = code;
    selectedYear = data.programs[code][0];
    localStorage.setItem("code", code);
    localStorage.removeItem("year");
    await getProgram(code, selectedYear);
  }
  
  async function updateYear(year: string): Promise<void> {
    selectedYear = year;
    localStorage.setItem("year", selectedYear);
    await getProgram(selectedCode, year);
  }

  onMount(async () => {
    if(browser){
      const key = localStorage.getItem("code") || Object.keys(data.programs)[0];
      const value = localStorage.getItem("year") || data.programs[key][0];
      getProgram(key, value);
      selectedCode = key;
      selectedYear = value;
    }
  });
</script>

<main>
  <Header program={selectedCode} programs={Object.keys(data.programs)} onSelect={updateProgram} />
  <YearSelector selected={selectedYear} years={years} onSelect={updateYear} />
  <ProgramOverview {program} />
  <Courses {program} />
  <Footer {program} />
</main>

<style lang="scss">
  main {
    min-height: var(--viewport-height);
  }
</style>
