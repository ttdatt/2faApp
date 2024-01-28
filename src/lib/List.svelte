<script lang="ts">
  import OtpItem from './OtpItem.svelte';
  import { getRemainingSeconds } from '../utils/token';
  import type { OtpItemInterface } from '../types/TokenTypes';
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api';
  import debounce from 'lodash/debounce';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { originalData } from '../store';

  const modalStore = getModalStore();

  invoke('write_log', { message: 'render' });

  let items: OtpItemInterface[] = [];

  const INTERVAL = 0.04;
  let timeLeft: number = getRemainingSeconds();
  let trigger: number = 0;
  let flag = false;
  let inputRef: HTMLInputElement;

  originalData.subscribe(d => {
    if (!d) return;
    items = d.services;
  });

  const debounceFilter = debounce(e => {
    const text = e.target.value;

    if (!$originalData) return;

    if (text?.length > 0) {
      items = $originalData?.services?.filter(
        y =>
          y.name.toLowerCase().includes(text.toLowerCase()) ||
          y.otp.account?.toLowerCase().includes(text.toLowerCase())
      );
    } else items = $originalData.services;
  }, 300);

  onMount(() => {
    inputRef.focus();
  });

  setInterval(() => {
    const t = getRemainingSeconds();

    if (t >= 29 && !flag) {
      flag = true;
      trigger++;
    }
    if (t < 2) {
      flag = false;
    }
    timeLeft = t;
  }, INTERVAL * 1000);
</script>

<div class="relative">
  <div
    class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
  >
    <svg
      class="w-4 h-4 text-gray-500 dark:text-gray-400"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
      />
    </svg>
  </div>
  <input
    bind:this={inputRef}
    on:input={debounceFilter}
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    type="search"
    id="default-search"
    class="w-full p-2 pl-9 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder="Service name or account"
  />
</div>

<ul class="mt-4">
  {#each items as item}
    <OtpItem {item} {timeLeft} {trigger} />
  {/each}
</ul>
