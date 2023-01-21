<script lang="ts">
	import type { IProgram } from "../types/Program";

  export let program: IProgram;
</script>

<footer>
  <div>
    <p>Skapad av <a href="https://marcusfredriksson.com">marcusfrdk</a></p>
    <p>{program?.generated ? `Datan genererades ${new Date(program?.generated)}` : "Laddar data..."}</p>
  </div>
</footer>

<style lang="scss">
  footer {
    margin-top: 2rem;
    padding-bottom: 4rem;
    display: flex;
    justify-content: center;
    & > div {
      width: 64rem;
      max-width: calc(100vw - 2rem);
      & > p:first-of-type {
        & > a {
          text-decoration: underline;
        }
      }
      & > p:last-of-type {
        font-size: 0.875rem;
        color: var(--weak);
        margin-top: 0.25rem;
      }
    }
  }
</style>