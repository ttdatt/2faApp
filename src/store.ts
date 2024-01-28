import { writable } from 'svelte/store';
import type { DataInterface } from './types/TokenTypes';

export const originalData = writable<DataInterface>();
export const needPassword = writable<boolean>(false);
export const ciphertext = writable<string>('');
export const isLoading = writable<boolean>(false);
