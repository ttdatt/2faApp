<script lang="ts">
  import {
    type ModalSettings,
    getModalStore,
    ProgressRadial,
  } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { resourceDir } from '@tauri-apps/api/path';
  import { exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
  import { invoke } from '@tauri-apps/api';
  import { ciphertext, isLoading, needPassword, originalData } from '../store';
  import { decrypt, encrypt } from '../utils/crypto';
  import type { ConfirmModalProps } from '../types/form';
  import { listen } from '@tauri-apps/api/event';
  import { open } from '@tauri-apps/api/dialog';
  import List from '../lib/List.svelte';
  import Login from '../lib/Login.svelte';

  const modalStore = getModalStore();
  isLoading.set(true);

  onMount(() => {
    (async () => {
      await invoke('write_log', { message: 'load file' });
      const dir = await resourceDir();
      const fileExist = await exists(`${dir}output.bin`);
      if (!fileExist) {
        isLoading.set(false);
        return;
      }

      const text = await readTextFile(`${dir}output.bin`);
      ciphertext.set(text);
      const [hasPass] = text.split(';');
      console.log('hasPass', hasPass);

      if (hasPass === 'true') {
        needPassword.set(true);
        isLoading.set(false);
        return;
      } else needPassword.set(false);

      const data = JSON.parse(await decrypt(text));
      originalData.set(data);
      isLoading.set(false);
      await invoke('write_log', { message: 'load file end' });
    })();

    const unlisten = listen('open-dialog', async () => {
      const selected = await open();
      if (selected) {
        const modal: ModalSettings = {
          type: 'component',
          component: 'SetPasswordModal',
          buttonTextCancel: 'Skip',
          title: 'Set Password',
          response: async (r: ConfirmModalProps | boolean) => {
            console.log(r);

            let p = undefined;
            if (!(typeof r === 'boolean')) p = r.password;

            const content = await readTextFile(selected as string);
            const data = JSON.parse(content);
            originalData.set(data);

            const encryptedText = await encrypt(content, p);
            const dir = await resourceDir();
            await writeTextFile(`${dir}output.bin`, encryptedText);
            needPassword.set(false);
          },
        };
        modalStore.trigger(modal);
      }
    });
    return () => {
      unlisten?.then(f => f());
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
