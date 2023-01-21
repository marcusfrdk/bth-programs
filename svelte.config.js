import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: vercel({
			edge: true,
			external: [],
			split: false
		}),
		alias: {
			'$utils/*': 'src/utils/*',
			'$components/*': 'src/components/*',
			'$sections/*': 'src/sections/*',
			'$data/*': 'static/data/*'
		},
		csrf: {
			checkOrigin: !process.env.NODE_ENV === 'development'
		}
	}
};

export default config;
