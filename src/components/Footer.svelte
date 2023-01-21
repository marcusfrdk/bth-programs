<script lang="ts">
	import type { IProgram } from "../types/Program";

  export let program: IProgram;
</script>

<footer>
  <div>
    <p class="created-by">Skapad av <a href="https://marcusfredriksson.com">marcusfrdk</a></p>
    <p class="generated-at">{program?.generated ? `Datan genererades ${new Date(program?.generated)}` : "Laddar data..."}</p>
    <p class="note">Denna sidan är inte en officiell del av <a href="https://www.bth.se">BTH</a> och är endast ett hobbyprojekt för att lösa ett problem.</p>
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
      & > p.created-by {
        & > a {
          text-decoration: underline;
        }
      }
      & > p.generated-at {
        font-size: 0.875rem;
        color: var(--weak);
        margin-top: 0.25rem;
      }
      & > p.note {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: var(--bottom);
        width: fit-content;
        border-radius: 0.5rem;
        color: var(--muted);
        & > a {
          color: var(--muted);
          text-decoration: underline;
        }
      }
    }
  }
</style>