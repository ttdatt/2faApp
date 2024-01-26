<script lang="ts">
  import { initializeStores, Toast } from '@skeletonlabs/skeleton';

  import List from './lib/List.svelte';

  initializeStores();
</script>

<Toast max={1} />
<main class="px-4 pt-4 flex-grow">
  <List />
</main>
