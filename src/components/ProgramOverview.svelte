<script lang="ts">
	import type { IProgram } from "../types/Program";

  export let program: Partial<IProgram>;
</script>

<section class={!program ? "loading" : ""}>
  <div>
    <h1>{program?.name || "Program title"}</h1>
    <p class="points">{program?.points} högskolepoäng</p>
    <p class="languages">{program?.languages?.join(" | ")}</p>
    <ul class="details">
      <li>{program?.teacher}</li>
      <li>{program?.city?.includes("Distans") ? "Distans" : program?.city}</li>
      <li>{program?.location}</li>
      <li>{program?.speed}%</li>
    </ul>
  </div>
</section>

<style lang="scss">
  section {
    width: 100vw;
    display: flex;
    justify-content: center;

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
      
      p.languages {
        color: var(--muted);
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      ul.details {
        margin-top: 1rem;
        padding-right: 1rem;
        display: flex;
        list-style: none;
        align-items: center;
        width: 100%;
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        padding-bottom: 1rem;
        & > li {
          background-color: var(--bottom);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: var(--weak);
          white-space: nowrap;
          scroll-snap-align: start;

          &:not(:last-of-type){
            margin-right: 1rem;
          }
        }
      }

      &.loading {
        h1, p, li, ul.details > li {
          color: var(--bottom);
          background-color: var(--bottom);
          width: fit-content;
          border-radius: 99rem;
          animation: pulse 2s infinite ease-in-out;
        }
      }
    }
  }
</style>