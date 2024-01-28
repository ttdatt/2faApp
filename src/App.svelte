<script lang="ts">
  import {
    initializeStores,
    Modal,
    Toast,
    type ModalComponent,
  } from '@skeletonlabs/skeleton';
  import SetPasswordModal from './lib/SetPasswordModal.svelte';
  import TokenScreen from './screens/TokenScreen.svelte';

  const modalRegistry: Record<string, ModalComponent> = {
    SetPasswordModal: { ref: SetPasswordModal },
  };
  initializeStores();
</script>

<Toast max={1} />
<Modal components={modalRegistry} />
<main class="px-4 pt-4 h-vh flex flex-col min-h-dvh">
  <TokenScreen />
</main>
