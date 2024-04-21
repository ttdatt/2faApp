<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  invoke("write_log", { message: "web app start" });

  import {
    initializeStores,
    Modal,
    Toast,
    type ModalComponent,
  } from "@skeletonlabs/skeleton";
  import SetPasswordModal from "./lib/SetPasswordModal.svelte";
  import TokenScreen from "./screens/TokenScreen.svelte";

  const modalRegistry: Record<string, ModalComponent> = {
    SetPasswordModal: { ref: SetPasswordModal },
  };
  initializeStores();
</script>

<Toast max={1} />
<Modal components={modalRegistry} />
<main class="px-4 pt-4 w-full h-vh flex flex-col min-h-dvh">
  <TokenScreen />
</main>
