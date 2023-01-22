<script lang="ts">
	import { generateColor } from "$utils/colors";
	import type { ICourse } from "../types/Program";


  export let course: ICourse;
  export let isOptional: boolean;
  let collapsed: boolean = true;

  function collapse(){
    collapsed = !collapsed;
  }

</script>

<li class={`container ${collapsed ? "collapsed" : ""}`}>
  <div class="header" on:click={collapse} on:keydown={collapse}>
    <div class="icon" style={`background-color: ${generateColor(course.code?.slice(0, 2) || "")};`} />
    <div class="content">
      <div class="left">
        <div class="title">
          <p class="title">{course.name}</p>
          {#if isOptional}
            <p class="optional">Valfri</p>
          {/if}
        </div>
        {#if collapsed}
          <p class="details">{course.code} | {course.points} hp</p>
        {/if}
      </div>
      <p class="toggle">
        {collapsed ? "Visa mer" : "Dölj detaljer"}
      </p>
    </div>
  </div>

  <p class="details">{[
    course.code, 
    course.points ? `${course.points} hp` : undefined,
    course.requirements?.includes("avklar") ? "Kräver avklarade kurser" : undefined
  ].filter(f => f).join(" | ")}</p>
  <p class="requirements">{course?.requirements || "Inga inträdeskrav"}</p>

  {#if course.url}
    <a class="read-more" href={course.url} rel="noreferrer" target="_blank" aria-label="Gå till kurssidan">Gå till kurssidan</a>
  {/if}

  {#if course.study_plan}
    <a class="study-plan" href={course.study_plan} rel="noreferrer" target="_blank">Studieplan</a>
  {/if}

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

<style lang="scss">
  li.container {
    background-color: var(--bottom);
    /* padding: 1rem; */
    /* padding-bottom: 0.5rem; */
    border-radius: 0.5rem;
    overflow: hidden;

    &.collapsed {
      padding: 0;
      & > *:not(div.header){
        display: none;
      }
    }
    
    &:not(.collapsed) {
      padding-bottom: 1rem;
      /* & > *:not(div.header){
        padding: 0 1rem;
      } */

      & > p.requirements, & > p.details, & > a.read-more {
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

            & > p.title {
              font-weight: var(--font-medium);
              font-size: var(--font-m);
              line-height: var(--font-m);
              max-height: calc(var(--font-m) * 2);
              overflow: hidden;
              word-wrap: break-word;
              hyphens: auto;
              -moz-hyphens: auto;
              -webkit-hyphens: auto;
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
          & > p.details {
            color: var(--weak);
            font-size: 0.875rem;
            margin-top: 0.125rem;
          }
        }

        & > p.toggle {
          background-color: var(--middle);
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          height: fit-content;
          font-size: 0.875rem;
          border-radius: 0.25rem;
          color: var(--weak);
          user-select: none;
          white-space: nowrap;
        }
      }
    }

    & > p.details {
      margin-top: 0.5rem;
      color: var(--weak);
    }

    & > p.requirements {
      margin: 0.5rem 0;
    }
    
    & > a.read-more, a.study-plan {
      text-decoration: underline;
      color: var(--muted);
    }

    & > a.study-plan {
      &::before {
        content: "| ";
        margin: 0 0.25rem;
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

        &:not(:last-of-type){
          margin-right: 1rem;
        }
      }
    }

    &:not(:last-of-type){
      margin-bottom: 1rem;
    }
  }
</style>