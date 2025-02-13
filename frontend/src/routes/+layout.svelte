<script>
	import '../app.css';
	import Navigation from './components/Navigation.svelte';
</script>

<div class="layout">
	<Navigation></Navigation>
	<slot />
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh; /* Full viewport height */
	}

	main {
		flex: 1; /* Ensures main grows to fill available space */
	}
</style>
