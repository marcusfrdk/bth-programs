<script lang="ts">
	import ProgramSelector from "./ProgramSelector.svelte";

  export let program: string;
  export let programs: string[];
  export let onSelect: (code: string) => void;
  
</script>

<header>
  <a href="/">
    <img
      src="bth-logo-40.png"
      alt="Blekinge Institute of Technology Logo"
      height="40"
      width="40"
    />
    <p>BTH Programs</p>
  </a>
  <ProgramSelector {program} {programs} {onSelect} />
</header>
<div style="height: var(--header-height);" />

<style lang="scss">
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    height: var(--header-height);
    width: 100vw;
    background-color: var(--background);
    position: fixed;
    top: 0;
    left: 0;

    & > a {
      color: var(--weak);
      display: flex;
      align-items: center;

      & > p {
        font-size: 1.125rem;
        font-weight: 600;
        margin-left: 1rem;
      }
    }
  }
</style>