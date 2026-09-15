<template>
	<v-container>
		<v-card
			class="mb-2"
			v-for="view in views"
			:key="view.value"
			elevation="0"
			outlined>
			<v-card-text>
				<a @click="$router.push({ name: view.name })">
					{{ view.displayName }}
				</a>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
export default {
	name: "CustomViewList",
	data() {
		return {
			views: [
			],
		};
	},
};
</script>
<style></style>
