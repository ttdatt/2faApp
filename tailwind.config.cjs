import { join } from 'path';
import { skeleton } from '@skeletonlabs/tw-plugin';

/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],

  theme: {
    extend: {},
  },

  plugins: [
    skeleton({
      themes: { preset: [ "skeleton" ] }
    })
  ]
} ;

module.exports = config;
