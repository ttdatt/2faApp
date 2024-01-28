<script lang="ts">
  import { onMount } from 'svelte';
  import { decrypt } from '../utils/crypto';
  import { ciphertext, needPassword, originalData } from '../store';

  let password = '';
  let inputRef: HTMLInputElement;

  onMount(() => {
    inputRef.focus();
  });

  async function handleSubmitPassword(e: SubmitEvent) {
    try {
      const data = JSON.parse(await decrypt($ciphertext, password));
      originalData.set(data);
      needPassword.set(false);
    } catch {}
  }
</script>

<div class="flex flex-1 h-vh justify-center items-center">
  <form on:submit|preventDefault={handleSubmitPassword}>
    <input
      bind:this={inputRef}
      bind:value={password}
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      type="password"
      id="password"
      class="w-full p-2 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="Enter password"
    />
  </form>
</div>
