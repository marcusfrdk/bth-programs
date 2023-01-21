<script lang="ts">
  export let selected: string;
  export let years: string[];
  export let onSelect: (year: string) => void;
</script>

<section>
  <ul>
    {#if years.length > 0}
      {#each years as year}
        <li
          class={selected === year ? "selected" : ""}
          on:click={() => onSelect(year)} 
          on:keydown={() => onSelect(year)}
        >{year}</li>
      {/each}
    {:else}
      {#each Array(3) as _}
        <li class="loading pulse">21h</li>
      {/each}
    {/if}
  </ul>
</section>

<style lang="scss">
  section {
    width: 100vw;
    display: flex;
    justify-content: center;

    & > ul {
      
      display: flex;
      list-style: none;
      align-items: center;
      width: 64rem;
      max-width: calc(100vw - 2rem);
      padding: 1rem;
      padding-left: 0;
      overflow-x: scroll;
      scroll-snap-type: x mandatory;
    }
  }
  

  li {
    background-color: var(--bottom);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    color: var(--weak);
    white-space: nowrap;
    scroll-snap-align: start;
    user-select: none;
    cursor: pointer;

    &.loading {
      color: var(--bottom);
    }

    &.selected {
      background-color: var(--primary);
      color: var(--primary-text);
    }

    &:not(:last-of-type){
      margin-right: 1rem;
    }
  }
</style>