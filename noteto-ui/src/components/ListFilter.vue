<template>
	<v-container class="pa-0">
		<v-container
			v-for="(pair, idx) in pairs"
			:key="`pair-${idx}`"
			class="d-flex justify-space-between"
			style="gap: 5px">
			<v-autocomplete
				rounded
				dense
				outlined
				:items="fields"
				label="Field"
				:item-text="getFieldText"
				hide-details
				v-model="pair.field"></v-autocomplete>
			<v-autocomplete
				rounded
				dense
				outlined
				:items="getChoicesByField(pair.field)"
				label="Value"
				item-text="displayName"
				hide-details
				v-model="pair.value"></v-autocomplete>
		</v-container>
		<v-container class="d-flex justify-center">
			<v-btn rounded depressed color="primary" @click="addPair">
				<i class="fas fa-plus"></i>
			</v-btn>
		</v-container>
	</v-container>
</template>
<script>
export default {
	name: "ListFilter",
	computed: {
		currentDatabase() {
			return this.$store.getters["currentDatabase"];
		},
		choices() {
			return this.$store.getters["databaseToChoices"][
				this.currentDatabase.value
			];
		},
		fields() {
			return this.$store.getters["databaseToFields"][
				this.currentDatabase.value
			].filter(
				(e) =>
					e.type == "singleSelect" ||
					e.type == "multipleSelect" ||
					e.type == "date"
			);
		},
		filter() {
			let filter = {};
			let pairs = this.pairs;
			for (let i = 0; i < pairs.length; i++) {
				let newKey = `${pairs[i].field}.value`;
				filter[newKey] = pairs.value;
			}
			return filter;
		},
	},
	data() {
		return {
			pairs: [],
		};
	},
	methods: {
		addPair() {
			this.pairs.push({});
		},
		getChoicesByField(field) {
			return this.choices.filter((e) => e.field == field);
		},
		getFieldText(field) {
			return `${field.displayName} - ${field.type}`;
		},
	},
};
</script>
