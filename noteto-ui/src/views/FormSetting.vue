<template>
	<div>
		<v-tabs v-model="tab">
			<v-tab>General</v-tab>
			<v-tab>Automation</v-tab>
			<v-tabs-items v-model="tab">
				<v-tab-item><field-section></field-section></v-tab-item>
				<v-tab-item>
					<automation-section></automation-section>
				</v-tab-item>
			</v-tabs-items>
		</v-tabs>
	</div>
</template>
<script>
import AutomationSection from "../components/AutomationSection.vue";
import FieldSection from "../components/FieldSection.vue";

export default {
	name: "FormSetting",

	data() {
		return {
			tab: null,
			ready: false,
		};
	},
	mixins: [],

	mounted: function () {
		//this.getAllFields();
		//this.getFieldTypes();
		//this.getAllHeaders();
	},
	computed: {
		databases() {
			return this.$store.getters["allDatabases"];
		},
		databaseToFields() {
			return this.$store.getters["databaseToFields"];
		},
		databaseToChoices() {
			return this.$store.getters["databaseToChoices"];
		},
		databaseToHeaders() {
			return this.$store.getters["databaseToHeaders"];
		},
		fieldTypes() {
			return this.$store.getters["dropdowns"]["fieldType"];
		},
	},
	methods: {},
	components: {
		"automation-section": AutomationSection,
		"field-section": FieldSection,
	},
};
</script>
<style scoped></style>
