<script lang="ts">
	export let selectedYear: string;
	export let years: string[];
	export let onSelectYear: (year: string) => void;
</script>

<ul>
	{#if years.length > 0}
		{#each years as year}
			<li
				class={selectedYear === year ? 'selectedYear' : ''}
				on:click={() => onSelectYear(year)}
				on:keydown={() => onSelectYear(year)}
			>
				{year}
			</li>
		{/each}
	{:else}
		{#each Array(3) as _}
			<li class="loading pulse">21h</li>
		{/each}
	{/if}
</ul>

<style lang="scss">
	ul {
		display: flex;
		list-style: none;
		align-items: center;
		width: 100%;
		max-width: calc(100vw - 2rem);
		/* margin-top: 0.5rem;
		margin-bottom: 1rem; */
		padding-left: 0;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
	}

	li {
		background-color: var(--bottom);
		padding: 0 1rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		border-radius: 2rem;
		color: var(--weak);
		white-space: nowrap;
		scroll-snap-align: start;
		user-select: none;
		cursor: pointer;

		&.loading {
			color: var(--bottom);
		}

		&.selectedYear {
			background-color: var(--primary);
			color: var(--primary-text);
		}

		&:not(:last-of-type) {
			margin-right: 1rem;
		}
	}
</style>
