<script lang="ts">
  export let semester: string;
  export let index: number;
  
  let src = "";
  let main = "";
  let mainWeek = "";
  let firstTest = "";
  let firstTestWeek = "";
  let secondTest = "";
  let secondTestWeek = "";

  switch(semester){
    case "Läsperiod 1":
      src = "/summer.webp";
      main = "Sommarlov";
      mainWeek = "Vecka 24 - 33";
      firstTest = "Tentor";
      firstTestWeek = "Vecka 23";
      secondTest = "Omtentor";
      secondTestWeek = "Vecka 34"
      break;
    case "Läsperiod 2":
      firstTest = "Tentor";
      firstTestWeek = "Vecka 44";
      break;
    case "Läsperiod 3":
      src = "/winter.webp";
      main = "Vinterlov";
      mainWeek = "Vecka 51 - 1";
      secondTest = "Tentor";
      secondTestWeek = "Vecka 2";
      break;
    case "Läsperiod 4":
      secondTest = "Tentor";
      secondTestWeek = "Vecka 12"
      break;
    default:
      break;
  }
</script>

{#if index !== 0}
  {#if firstTest}
    <li>
      <div>
        <p class="title">{firstTest}</p>
        <p class="time">{firstTestWeek}</p>
      </div>
      <img src="/tests.webp" alt="Tests" />
    </li>
  {/if}
  {#if main && src}
    <li>
      <div>
        <p class="title">{main}</p>
        <p class="time">{mainWeek}</p>
      </div>
      <img src={src} alt={main} />
    </li>
  {/if}
  {#if secondTest}
    <li>
      <div>
        <p class="title">{secondTest}</p>
        <p class="time">{secondTestWeek}</p>
      </div>
      <img src="/tests.webp" alt="Tests" />
    </li>
  {/if}
{/if}

<style lang="scss">
  li {
    width: 100%;
    height: 5rem;
    position: relative;
    margin: 1rem 0 0.5rem 0;

    & > div {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
      background-color: #00000075;
      z-index: 1;
      padding: 0 1rem;
      display: flex;
      justify-content: center;
      flex-direction: column;

      & > p.title {
        font-size: 1.25rem;
        font-weight: var(--font-medium);
      }

      & > p.time {
        font-size: 0.875rem;
      }
    }

    & > img {
      z-index: 0;
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: var(--bottom);
      margin-bottom: 0.25rem;
      border-radius: 0.5rem;
      object-fit: cover;
      top: 0;
      left: 0;
    }
  }
</style>