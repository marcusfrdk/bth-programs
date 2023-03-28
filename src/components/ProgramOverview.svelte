<script lang="ts">
	import { encodeName } from '$utils/format';
	import type { IProgram } from '../types/Program';
	export let program: Partial<IProgram>;
</script>

<section class={!program ? 'loading' : ''}>
	<div>
		<h1 id="overview-title">{program?.name || 'Program title'}</h1>
		<p class="points">{program?.points} hp</p>
		<ul class="details">
			{#if !program}
				{#each Array(5) as _}
					<li>Loading...</li>
				{/each}
			{:else}
				{#if program.teacher}
					<li>
						<a 
							href={`https://www.bth.se/?searchtype=employee&s=${encodeName(program.teacher)}`} aria-label="Find teacher"
							rel="noreferrer"
							target="_blank"
						>
							{program.teacher || ''}
						</a>
					</li>
				{/if}
				{#each [program?.city?.includes('Distans') ? 'Distans' : program?.city || '', program?.location, program?.speed ? program.speed + '%' : '', ...(program?.languages || [])].filter((f) => f) as text}
					<li>{text}</li>
				{/each}
			{/if}
		</ul>
	</div>
</section>

<style lang="scss">
	section {
		width: 100vw;
		display: flex;
		justify-content: center;
		padding-top: 1rem;

		& > div {
			width: 64rem;
			max-width: calc(100vw - 2rem);

			& > * {
				padding-right: 1rem;
			}

			h1 {
				font-size: 1.75rem;
				word-wrap: break-word;
				-webkit-hyphens: auto;
				-moz-hyphens: auto;
				-ms-hyphens: auto;
				hyphens: auto;
				width: 100%;
			}

			p.points {
				color: var(--weak);
				font-size: 1.125rem;
				margin-top: 0.5rem;
			}

			ul.details {
				margin-top: 1rem;
				padding-right: 1rem;
				display: flex;
				list-style: none;
				align-items: center;
				width: 100%;
				overflow-x: auto;
				scroll-snap-type: x mandatory;
				padding-bottom: 1rem;
				& > li {
					background-color: var(--bottom);
					border-radius: 2rem;
					color: var(--weak);
					white-space: nowrap;
					scroll-snap-align: start;
					padding: 0.5rem 1rem;

					&:not(:last-of-type) {
						margin-right: 1rem;
					}

					& > a {
						color: var(--weak);
					}
				}
			}
		}
		&.loading {
			h1,
			p,
			li,
			ul.details > li {
				color: var(--bottom) !important;
				background-color: var(--bottom);
				width: fit-content;
				border-radius: 99rem;
				animation: pulse 2s infinite ease-in-out;
			}
		}
	}
</style>
