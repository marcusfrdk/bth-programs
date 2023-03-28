<script lang="ts">
	import { generateColor } from '$utils/colors';
	import { encodeName } from '$utils/format';
	import { getNumberOfWeeks } from '$utils/time';
	import { onMount } from 'svelte';
	import type { ICourse } from '../types/Program';

	export let course: ICourse;
	export let isOptional: boolean;

	let isDoubleCourse = false;
	let collapsed = true;

	function collapse() {
		collapsed = !collapsed;
	}

	$: {
		const numberOfWeeks = getNumberOfWeeks(course.start, course.end);
		isDoubleCourse = numberOfWeeks > 10;
	}
</script>

<li class:collapsed class="container">
	<div class="header" on:click={collapse} on:keydown={collapse}>
		<div
			class="icon"
			style={`background-color: ${generateColor(course.code?.slice(0, 2) || '')};`}
		/>
		<div class="content">
			<div class="left">
				<div class="title">
					<p class="title">{course.name}</p>
					{#if isOptional}
						<p class="chip">Valfri</p>
					{/if}
					{#if isDoubleCourse}
						<p class="chip">Dubbel</p>
					{/if}
				</div>
				{#if collapsed}
					<p class="details">
						{course.code} | {course.points} hp{course.requirements?.includes('avklar')
							? ' | Har krav'
							: ''}
					</p>
				{/if}
			</div>
			<p class="toggle">
				{collapsed ? 'Visa mer' : 'Dölj detaljer'}
			</p>
		</div>
	</div>

	<p class="details">
		{[
			course.code,
			course.points ? `${course.points} hp` : undefined,
			course.requirements?.includes('avklar') ? 'Kräver avklarade kurser' : undefined
		]
			.filter((f) => f)
			.join(' | ')}
	</p>

	{#if course?.requirements}
		<p class="requirements">{course?.requirements || 'Inga inträdeskrav'}</p>
	{/if}

	{#if course?.description}
		<p class="description">{course?.description}</p>
	{/if}

	<ul class="links">
		{#if course.url}
			<li>
				<a
					class="read-more"
					href={course.url}
					rel="noreferrer"
					target="_blank"
					aria-label="Gå till kurssidan"
				>
					Gå till kurssidan
				</a>
			</li>
			<li>
				{#if course.study_plan}
					<a class="study-plan" href={course.study_plan} rel="noreferrer" target="_blank">
						Studieplan
					</a>
				{/if}
			</li>
		{/if}
	</ul>

	<ul class="other">
		{#if course?.teachers}
			{#each course.teachers as teacher}
				<li>
					<a 
						href={`https://www.bth.se/?s=mas&searchtype=employee&employee-filter=&s=${encodeName(teacher)}`} aria-label="Find teacher"
						rel="noreferrer"
						target="_blank"
					>
						{teacher}
					</a>
				</li>
			{/each}
		{/if}
		{#each [course.city, course.location, course.speed ? `${course.speed}%` : undefined, ...(course?.languages || [])].filter((f) => f) as other}
			<li>{other}</li>
		{/each}
	</ul>
</li>

<style lang="scss">
	li.container {
		background-color: var(--bottom);
		/* padding: 1rem; */
		/* padding-bottom: 0.5rem; */
		border-radius: 0.5rem;
		overflow: hidden;

		&.collapsed {
			padding: 0;
			& > *:not(div.header) {
				display: none;
			}
		}

		&:not(.collapsed) {
			padding-bottom: 1rem;
			& > p.requirements,
			& > p.details {
				padding-left: 1rem;
			}

			& > div.header {
				padding-bottom: 0;
			}
		}

		& > div.header {
			display: flex;
			align-items: center;
			padding: 1rem;
			cursor: pointer;

			& > div.icon {
				height: 1rem;
				width: 1rem;
				min-height: 1rem;
				min-width: 1rem;
				background-color: var(--middle);
				border-radius: 50%;
				margin-right: 0.5rem;
			}

			& > div.content {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;

				& > div.left {
					& > div.title {
						display: flex;
						align-items: center;
						width: 100%;
						flex-wrap: wrap;

						& > * {
							margin-bottom: 0.25rem;
						}

						& > p.title {
							font-weight: var(--font-medium);
							font-size: var(--font-m);
							line-height: var(--font-m);
							max-height: calc(var(--font-m) * 2);
							margin-right: 0.5rem;
							overflow: hidden;
							word-wrap: break-word;
							hyphens: auto;
							-moz-hyphens: auto;
							-webkit-hyphens: auto;
						}
						& > p.chip {
							background-color: var(--middle);
							font-size: 0.875rem;
							padding: 0.125rem 0.25rem;
							border-radius: 0.25rem;
							color: var(--weak);

							&:not(:last-of-type) {
								margin-right: 0.5rem;
							}
						}
					}
					& > p.details {
						color: var(--weak);
						font-size: 0.875rem;
						/* margin-top: 0.125rem; */
					}
				}

				& > p.toggle {
					cursor: pointer;
					height: fit-content;
					font-size: 0.875rem;
					border-radius: 0.25rem;
					color: var(--muted);
					user-select: none;
					white-space: nowrap;
					margin-left: 1rem;
				}
			}
		}

		& > p.details {
			margin-top: 0.5rem;
			color: var(--weak);
		}

		& > p.requirements {
			margin: 0.5rem 0 0 0;
			&::before {
				content: 'Krav';
				display: block;
				margin-bottom: 0.5rem;
				font-size: 0.875rem;
				color: var(--muted);
			}
		}

		& > p.description {
			padding: 0.5rem 0 0.5rem 1rem;
			&::before {
				content: 'Beskrivning';
				display: block;
				margin-bottom: 0.5rem;
				font-size: 0.875rem;
				color: var(--muted);
			}
		}

		& > ul.links {
			display: flex;
			flex-direction: column;
			padding: 0.5rem 1rem 0 1rem;
			list-style: none;
			& > li {
				&:not(:last-of-type) {
					margin-bottom: 1rem;
				}
				& > a.read-more,
				a.study-plan {
					text-decoration: underline;
					color: var(--muted);
				}
			}
		}

		& > ul.other {
			list-style: none;
			margin-top: 1rem;
			padding-right: 1rem;
			display: flex;
			list-style: none;
			align-items: flex-start;
			width: calc(100% - 1rem);
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			padding-bottom: 0.5rem;
			padding-left: 0 !important;
			padding-right: 1rem;
			margin-left: 1rem;

			& > li {
				background-color: var(--middle);
				padding: 0.5rem 1rem;
				border-radius: 2rem;
				color: var(--weak);
				white-space: nowrap;
				scroll-snap-align: start;
				font-size: 0.875rem;

				&:not(:last-of-type) {
					margin-right: 1rem;
				}

				& > a {
					color: var(--weak);
				}
			}
		}

		&:not(:last-of-type) {
			margin-bottom: 1rem;
		}
	}
</style>
