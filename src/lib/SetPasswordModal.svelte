<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  const modalStore = getModalStore();

  // Form Data
  const formData = {
    password: '',
    confirmPassword: '',
  };

  // We've created a custom submit function to pass the response and close the modal.
  function onFormSubmit(): void {
    if ($modalStore[0].response) $modalStore[0].response(formData);
    modalStore.close();
  }

  function onClose(): void {
    modalStore.close();
  }

  // Base Classes
  const cBase = 'card p-4 w-modal shadow-xl space-y-4';
  const cHeader = 'text-2xl font-bold';
  const cForm =
    'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
  <div class="modal-example-form {cBase}">
    <header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
    {#if $modalStore[0].body}
      <article>{$modalStore[0].body}</article>
    {/if}
    <!-- Enable for debugging: -->
    <form class="modal-form {cForm}">
      <label class="label">
        <input
          class="w-full p-2 pl-2 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="password"
          bind:value={formData.password}
          placeholder="Enter password"
        />
      </label>
      <label class="label">
        <input
          class="w-full p-2 pl-2 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="password"
          bind:value={formData.confirmPassword}
          placeholder="Confirm password"
        />
      </label>
      {#if formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
        <p class=" text-sm font-semibold text-red-500">
          confirm password doesn't match
        </p>
      {/if}
    </form>
    <footer class="modal-footer {parent.regionFooter}">
      <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
        >{parent.buttonTextCancel}</button
      >
      <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}
        >OK</button
      >
    </footer>
  </div>
{/if}
