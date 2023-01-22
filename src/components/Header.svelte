<script lang="ts">
	import ProgramSelector from "./ProgramSelector.svelte";

  export let program: string;
  export let programs: string[];
  export let onSelect: (code: string) => void;
</script>

<header>
  <div>
    <a href="/">
      <img
        src="bth-logo-40.png"
        alt="Blekinge Institute of Technology Logo"
        height="40"
        width="40"
      />
      <p>BTH Program och Kurser</p>
    </a>
    <ProgramSelector {program} {programs} {onSelect} />
  </div>
</header>
<div style="height: var(--header-height);" />

<style lang="scss">
  header {
    width: 100vw;
    background-color: var(--background);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    z-index: 100;
    
    & > div {
      width: 64rem;
      max-width: calc(100vw - 2rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      & > a {
        width: fit-content;
        color: var(--weak);
        display: flex;
        align-items: center;
        margin-right: 1rem;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        & > p {
          font-size: 1.125rem;
          font-weight: 600;
          margin-left: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
      }
    }
  }
</style>