<script lang="ts">
	import { browser } from "$app/environment";
	import Header from "$components/Header.svelte";
	import YearSelector from "$components/YearSelector.svelte";
  import { onMount } from "svelte";
  
  export let data: {programs: Record<string, string[]>};

  let loading = true;
  let program: Record<string, any> = {};
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
      const storedCode = localStorage.getItem("code");
      const storedYear = localStorage.getItem("year");

      console.log(storedCode, storedYear);

      const key = storedCode || Object.keys(data.programs)[0];
      const value = storedYear || data.programs[key][0];
      getProgram(key, value);
      selectedCode = key;
      selectedYear = value;
      loading = false;
    }
  });
</script>

<main>
  <Header program={selectedCode} programs={Object.keys(data.programs)} onSelect={updateProgram} />
  <YearSelector selected={selectedYear} years={years} onSelect={updateYear} />
</main>

<style lang="scss">
  main {
    min-height: var(--viewport-height);
    background-color: red;
  }
</style>
