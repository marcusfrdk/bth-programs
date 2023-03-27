<script lang="ts">
	import ProgramSelector from './ProgramSelector.svelte';
	import YearSelector from './YearSelector.svelte';

	export let programName: string | undefined;
	export let program: string;
	export let programs: string[];
	export let onSelectProgram: (code: string) => void;
	export let onSelectYear: (year: string) => void;
	export let years: string[];
	export let selectedYear: string;
</script>

<header id="header">
	<div>
		<div>
			<a href="/">
				<img
					src="bth-logo-40.png"
					alt="Blekinge Institute of Technology Logo"
					height="40"
					width="40"
				/>
				<p class:loading={!programName}>{programName}</p>
			</a>
			<ProgramSelector {program} {programs} {onSelectProgram} />
		</div>
		<div>
			<YearSelector {years} {selectedYear} {onSelectYear} />
		</div>
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
			height: var(--header-height);

			& > div:last-of-type {
				width: 100%;
			}

			& > div:first-of-type {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 4rem;
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
						&.loading {
							background-color: var(--bottom);
							color: var(--bottom);
							border-radius: 1rem;
							max-width: 24rem;
						}
					}
				}
			}
		}
	}
</style>
