<script lang="ts">
	import { generateColor } from "$utils/colors";
	import { getSemester } from "$utils/format";
	import { groupSemesters } from "$utils/object";
	import type { ICourse, IProgram } from "../types/Program";

  export let program: IProgram;
  let courses: Record<string, ICourse[]> = {};
  let optional: string[] = [];

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
      {#each Object.entries(courses) as semester}
        <h2 class="semester">{semester[0].split(" ")[0]}<small>{getSemester(semester[0])}</small></h2>
        {#each semester[1] as course}
          <li>
            <div class="header">
              <div>
                <div style={`background-color: ${generateColor(course.code?.slice(0, 2) || "")};`} />
                <p>{course.name}</p>
                {#if optional.includes(course?.code || "")}
                  <p class="optional">Valfri</p>
                {/if}
              </div>
              {#if course.study_plan}
                <a href={course.study_plan} rel="noreferrer" target="_blank">Studieplan</a>
              {/if}
            </div>
            <p class="details">{[
              course.code, 
              course.points ? `${course.points} högskolepoäng` : undefined,
              course.requirements?.includes("avklar") ? "Kräver avklarade kurser" : undefined
            ].filter(f => f).join(" | ")}</p>
            <p class="requirements">{course?.requirements || "Inga inträdeskrav"}</p>
            <ul class="other">
              {#each [
                ...(course?.teachers || []),
                course.city,
                course.location,
                course.speed ? `${course.speed}%` : undefined,
                ...(course?.languages || []),
              ].filter(f => f) as other}
                <li>{other}</li>
              {/each}
            </ul>
          </li>
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
      
      & > small {
        margin-left: 0.5rem;
        color: var(--weak);
      }
    }

    & > ul {
      list-style: none;
      width: 64rem;
      max-width: calc(100vw - 2rem);

      & > li {
        background-color: var(--bottom);
        padding: 1rem;
        padding-bottom: 0.5rem;
        border-radius: 0.5rem;

        & > div.header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          & > div {
            display: flex;
            align-items: center;
            & > div {
              min-height: 1rem;
              min-width: 1rem;
              background-color: var(--middle);
              border-radius: 50%;
              margin-right: 0.5rem;
            }
            & > p.optional {
              background-color: var(--middle);
              margin: 0 0.5rem;
              font-size: 0.875rem;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              color: var(--weak);
            }
          }
          & > a {
            font-size: 0.875rem;
            color: var(--muted);
          }
        }

        & > p.details {
          margin-top: 0.5rem;
          color: var(--weak);
        }

        & > p.requirements {
          margin-top: 0.5rem;
        }

        & > ul.other {
          list-style: none;
          margin-top: 1rem;
          padding-right: 1rem;
          display: flex;
          list-style: none;
          align-items: center;
          width: 100%;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 0.5rem;

          & > li {
            background-color: var(--middle);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            color: var(--weak);
            white-space: nowrap;
            scroll-snap-align: start;
            font-size: 0.875rem;

            &:not(:last-of-type){
              margin-right: 1rem;
            }
          }
        }

        &.loading {
          height: 10rem;
          width: 100%;
          background-color: var(--bottom);
          border-radius: 0.5rem;
          &:not(:last-of-type) {
            margin-bottom: 1rem;
          }
        }

        &:not(:last-of-type){
          margin-bottom: 1rem;
        }
      }
    }
  }
</style>