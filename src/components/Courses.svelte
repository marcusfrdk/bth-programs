<script lang="ts">
	import { getSemester } from "$utils/format";
	import { groupSemesters } from "$utils/object";
	import type { ICourse, IProgram } from "../types/Program";
	import Course from "./Course.svelte";
	import SpecialPeriods from "./SpecialPeriods.svelte";

  export let program: IProgram;
  let courses: Record<string, ICourse[]> = {};
  let optional: string[] = [];
  let currentYear = new Date().getFullYear();
  let currentSemester = [
    currentYear,
    getSemester(currentYear)
  ];

  $: if(program) {
    courses = groupSemesters([...program.required_courses, ...program.optional_courses]
    .filter(f => f?.start)
    .sort((a, b) => a.name && b.name && a.name > b.name ? -1 : 1)
    .sort((a, b) => a.start && b.start && a.start > b.start ? 1 : -1));

    optional = program.optional_courses.filter(f => f).map(course => course.code as string);
  }
</script>

<div class="container">
  <ul>
    {#if Object.keys(courses).length > 0}
      {#each Object.entries(courses) as semester, i}
        <SpecialPeriods semester={getSemester(semester[0])} index={i} />
        <li class={`semester ${Number(semester[0].split(" ")[0]) === currentSemester[0] && getSemester(semester[0]) === currentSemester[1] ? "current" : ""}`}>{semester[0].split(" ")[0]}<small>{getSemester(semester[0])}</small></li>
        {#each semester[1] as course}
          <Course isOptional={optional.includes(course?.code || "")} {course} />
        {/each}
      {/each}  
    {:else}
      {#each Array(12) as _, i}
        <li class={`loading pulse ${i % 4 === 0 ? "title" : ""}`} />
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss">
  div.container {
    display: flex;
    width: 100vw;
    justify-content: center;
    
    & > ul {
      list-style: none;
      width: 64rem;
      max-width: calc(100vw - 2rem);
      
      & > li.semester {
        font-weight: var(--font-medium);
        font-size: var(--font-l);
        margin-bottom: 0.5rem;

        &.current {
          background-color: var(--primary);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          * {
            color: var(--primary-text);
          }
        }
        
        & > small {
          margin-left: 0.5rem;
          color: var(--weak);
          font-size: 0.75em;
        }
        
        &:not(:first-of-type){
          margin-top: 2rem;
        }
      }

      & > li.loading {
        height: 4rem;
        width: 100%;
        background-color: var(--bottom);
        border-radius: 0.5rem;

        &.title {
          height: 1.25rem;
          margin-bottom: 0.5rem !important;
          width: clamp(4rem, 9rem, 90vw);
        }

        &:not(:last-of-type) {
          margin-bottom: 1rem;
        }
      }
    }
  }
</style>