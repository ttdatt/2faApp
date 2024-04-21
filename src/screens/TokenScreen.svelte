<script lang="ts">
  import {
    type ModalSettings,
    getModalStore,
    ProgressRadial,
  } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import {
    BaseDirectory,
    exists,
    readTextFile,
    writeTextFile,
  } from "@tauri-apps/plugin-fs";
  import { invoke } from "@tauri-apps/api/core";
  import { ciphertext, isLoading, needPassword, originalData } from "../store";
  import { decrypt, encrypt } from "../utils/crypto";
  import type { ConfirmModalProps } from "../types/form";
  import { listen } from "@tauri-apps/api/event";
  import { open } from "@tauri-apps/plugin-dialog";
  import List from "../lib/List.svelte";
  import Login from "../lib/Login.svelte";

  const modalStore = getModalStore();
  isLoading.set(true);

  onMount(() => {
    (async () => {
      await invoke("write_log", { message: "load file" });
      const fileExist = await exists(`output.bin`, {
        baseDir: BaseDirectory.Resource,
      });
      if (!fileExist) {
        isLoading.set(false);
        return;
      }

      const text = await readTextFile(`output.bin`, {
        baseDir: BaseDirectory.Resource,
      });
      ciphertext.set(text);
      const [hasPass] = text.split(";");

      if (hasPass === "true") {
        needPassword.set(true);
        isLoading.set(false);
        return;
      } else needPassword.set(false);

      const data = JSON.parse(await decrypt(text));
      originalData.set(data);
      isLoading.set(false);
      await invoke("write_log", { message: "load file end" });
    })();

    const unlisten = listen("open-dialog", async () => {
      console.log("open-dialog");

      const selected = await open();
      if (selected) {
        const modal: ModalSettings = {
          type: "component",
          component: "SetPasswordModal",
          buttonTextCancel: "Skip",
          title: "Set Password",
          response: async (r: ConfirmModalProps | boolean) => {
            let p = undefined;
            if (!(typeof r === "boolean")) p = r.password;

            const content = await readTextFile(selected.path);
            const data = JSON.parse(content);
            originalData.set(data);

            const encryptedText = await encrypt(content, p);
            await writeTextFile("output.bin", encryptedText, {
              baseDir: BaseDirectory.Resource,
            });
            needPassword.set(false);
          },
        };
        modalStore.trigger(modal);
      }
    });
    return () => {
      unlisten?.then((f) => f());
    };
  });
</script>

{#if $isLoading}
  <div class="flex flex-1 h-vh justify-center items-center">
    <ProgressRadial width="w-20" />
  </div>
{:else if $needPassword}
  <Login />
{:else if $originalData}
  <List />
{:else}
  <div class="flex flex-1 h-vh justify-center items-center">
    <p class="text-xl font-medium cursor-pointer">No item</p>
  </div>
{/if}
