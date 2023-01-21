<script lang="ts">
  export let program: string;
  export let programs: string[];
  export let onSelect: (code: string) => void;

  function handleChange(e: Event){
    const value = (e.target as HTMLSelectElement).value;
    onSelect(value);
  }
</script>

<select on:change={handleChange} bind:value={program}>
  {#each programs as program}
    <option value={program}>{program}</option>
  {/each}
</select>

<style lang="scss">
  select {
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    background-color: var(--bottom);
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
  }
</style>