<script lang="ts">
  export let selected: string;
  export let years: string[] = [];
  export let onSelect: (year: string) => void;
</script>

<ul>
  {#each years as year}
    <li
      class={selected === year ? "selected" : ""}
      on:click={() => onSelect(year)} 
      on:keydown={() => onSelect(year)}
    >{year}</li>
  {/each}
</ul>

<style lang="scss">
  ul {
    display: flex;
    list-style: none;
    align-items: center;
    width: 100%;
    padding: 1rem;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
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

    &.selected {
      background-color: var(--primary);
      color: var(--primary-text);
    }

    &:not(:last-of-type){
      margin-right: 1rem;
    }
  }
</style>