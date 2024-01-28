<script lang="ts">
  import { getToastStore } from '@skeletonlabs/skeleton';
  const toastStore = getToastStore();

  import { writeText } from '@tauri-apps/api/clipboard';
  import type { OtpItemInterface } from '../types/TokenTypes';
  import { getToken } from '../utils/token';
  import { TIME_FRAME } from '../utils/token';

  export let trigger: number = 0;
  export let timeLeft: number = 0;
  export let item: OtpItemInterface | null = null;

  let otp = !!item ? getToken(item.secret) : '';

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  let strokeDashoffset = 0;

  $: otp = !!item && trigger >= 0 ? getToken(item.secret) : '';
  $: strokeDashoffset = circumference * (1 - timeLeft / TIME_FRAME);
</script>

<div
  class="flex items-center justify-between py-1 cursor-pointer pb-2"
  on:click={async () => {
    await writeText(otp);
    toastStore.clear();
    toastStore.trigger({ message: otp, timeout: 1500 });
  }}
  role="button"
  tabindex="0"
  on:keydown={undefined}
>
  <div class="flex flex-col cursor-pointer items-start">
    {#if item}
      <p class="text-xl font-medium cursor-pointer">{item.name}</p>
      <p class="text-3xl font-medium cursor-pointer">
        {otp}
      </p>
      <p class="text-xl font-medium h-7 cursor-pointer">
        {item.otp.account ?? ''}
      </p>
    {:else}
      <p class="text-xl font-medium cursor-pointer">No item</p>
    {/if}
  </div>
  <div>
    <svg width="80" height="80">
      <title>progress</title>
      <circle
        stroke="#00b300"
        stroke-width="3"
        fill="none"
        r={radius}
        cx="80"
        cy="40"
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        transform="rotate(-90 60 60)"
      />
      <text x="50%" y="50%" text-anchor="middle" dy=".3em">
        {Math.ceil(timeLeft)}
      </text>
    </svg>
  </div>
</div>
