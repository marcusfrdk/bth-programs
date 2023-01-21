<script>
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import '../app.scss';
	import '../typography.scss';

	function handleChin() {
		document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
	}

	onMount(() => {
		if (browser) window.addEventListener('resize', handleChin);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('resize', handleChin);
	});
</script>

<slot />
