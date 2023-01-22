<script lang="ts">
	import { generateColor } from "$utils/colors";
	import { getSemester } from "$utils/format";
	import { groupSemesters } from "$utils/object";
	import type { ICourse, IProgram } from "../types/Program";
	import Course from "./Course.svelte";
	import SpecialPeriods from "./SpecialPeriods.svelte";

  export let program: IProgram;
  let courses: Record<string, ICourse[]> = {};
  let optional: string[] = [];
  let collapsed: boolean = true;

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
        <h2 class="semester">{semester[0].split(" ")[0]}<small>{getSemester(semester[0])}</small></h2>
        {#each semester[1] as course}
          <Course isOptional={optional.includes(course?.code || "")} {course} />
        {/each}
      {/each}  
    {:else}
      {#each Array(9) as _}
        <li class="loading pulse" />
      {/each}
    {/if}
  </ul>
</div>

<style lang="scss">
  div.container {
    display: flex;
    width: 100vw;
    justify-content: center;

    h2 {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
      
      & > small {
        margin-left: 0.5rem;
        color: var(--weak);
      }
      
      &:not(:first-of-type){
        margin-top: 2rem;
      }
    }

    & > ul {
      list-style: none;
      width: 64rem;
      max-width: calc(100vw - 2rem);

      & > li.loading {
        height: 10rem;
        width: 100%;
        background-color: var(--bottom);
        border-radius: 0.5rem;
        &:not(:last-of-type) {
          margin-bottom: 1rem;
        }
      }
    }
  }
</style>