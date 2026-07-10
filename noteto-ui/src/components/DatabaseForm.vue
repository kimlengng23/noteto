<template>
	<v-container fluid class="database-form-panel pa-0">
		<v-card class="rounded-lg" outlined elevation="0">
			<v-card-title class="d-flex justify-space-between">
				<div>Create Database</div>
				<v-btn
					color="primary ml-2"
					depressed
					@click="addDatabase"
					:disabled="!isFormValid"
					:loading="isLoading">
					<v-icon left>mdi-content-save</v-icon>
					Save
				</v-btn>
			</v-card-title>
			<v-form ref="form" v-model="isFormValid" lazy-validation>
				<v-card-text>
					<v-text-field
						outlined
						dense
						label="Display Name"
						v-model="displayName"
						:rules="strRules"
						required></v-text-field>
					<v-text-field
						outlined
						dense
						label="Value"
						v-model="value"
						:rules="strRules"
						required></v-text-field>
					<v-textarea
						outlined
						dense
						label="Description"
						v-model="description"></v-textarea>
				</v-card-text>
				<v-card-text>
					<div
						v-for="(field, idxI) in fields"
						:key="`field-${idxI}`"
						class="database-field-row">
						<div class="database-field-remove">
							<v-btn
								color="error"
								icon
								@click="fields.splice(idxI, 1)">
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</div>
						<field-form v-model="fields[idxI]"></field-form>
					</div>
					<v-container class="d-flex justify-end">
						<v-btn
							color="primary"
							depressed
							@click="fields.push({})">
							<v-icon left>mdi-plus</v-icon>
							Field
						</v-btn>
					</v-container>
				</v-card-text>
			</v-form>
		</v-card>
		<v-card outlined elevation="0">
			<v-card-title>Requests</v-card-title>
			<v-card-text>
				<v-list>
					<v-list-item-group v-model="selectedRequestIdx">
						<template v-for="(request, idx) in requests">
							<v-list-item :key="`request-${idx}`">
								<v-list-item-content>
									<v-list-item-title>
										{{ request.displayName }}
									</v-list-item-title>
								</v-list-item-content>
							</v-list-item>

							<v-divider
								v-if="idx < requests.length - 1"
								:key="idx"></v-divider>
						</template>
					</v-list-item-group>
				</v-list>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service";
import formMixin from "@/js/form-mixin";
import FieldForm from "@/components/FieldForm.vue";
import _ from "lodash";
export default {
	name: "NewDatabase",
	components: {
		"field-form": FieldForm,
	},
	mixins: [formMixin],
	mounted() {
		this.getDatabaseRequests();
	},
	data() {
		return {
			requests: [],
			selectedRequestIdx: -1,
			fields: [],
			dollarOptions: {
				locale: "en-US",
				prefix: "$",
				suffix: "",
				length: 7,
				precision: 2,
			},
			kgOptions: {
				locale: "en-US",
				prefix: "",
				suffix: "Kg",
				length: 7,
				precision: 2,
			},
			lbOptions: {
				locale: "en-US",
				prefix: "",
				suffix: "Lbs",
				length: 7,
				precision: 2,
			},
		};
	},
	computed: {
		isEmpty() {
			return (
				this.displayName.length == 0 ||
				this.value.length == 0 ||
				this.description.length == 0
			);
		},
		isLoggedIn() {
			return this.$store.getters["isLoggedIn"];
		},
	},
	methods: {
		addDatabase() {
			if (!this.validate()) {
				return;
			}
			if (!this.validateFields()) {
				return;
			}
			let database = {};
			database.displayName = this.displayName;
			database.value = this.value;
			database.description = this.description;
			this.isLoading = true;
			backendService.addDatabase(database).then((response) => {
				database._id = response.data.insertedId;
				for (let i = 0; i < this.fields.length; i++) {
					this.prepareField(this.fields[i], false);
				}
				backendService.addFields(this.fields).then(() => {
					this.$store.commit("addNewDatabaseToList", database);
					this.$store.dispatch("getDatabaseToFields");
					this.$store.dispatch("getDatabaseToHeaderSets");
					this.$store.dispatch("getDatabaseToChoices");
					setTimeout(() => {
						this.displayName = "";
						this.value = "";
						this.description = "";
						this.fields = [];
						this.resetValidation();
						eventBus.$emit(
							"setSnackbar",
							"Successfully added a new database",
							"success",
						);
						this.isLoading = false;
					}, 1000);
				});
			});
		},
		getDatabaseRequests() {
			backendService.getDatabaseRequests().then((response) => {
				this.requests = response.data;
			});
		},
		prepareField(field, first = true) {
			field.database = this.value;
			if (first) field.value = _.camelCase(field.displayName);
			if (
				field.type == "singleSelect" ||
				field.type == "multipleSelect"
			) {
				for (let i = 0; i < field.choices.length; i++) {
					let choice = field.choices[i];
					if (first) choice.value = _.camelCase(choice.displayName);
					choice.field = field.value;
					choice.database = this.value;
					choice.isActive = true;
				}
			}
			if (field.type == "list") {
				for (let i = 0; i < field.listFields.length; i++) {
					this.prepareField(field.listFields[i]);
				}
			}
		},
		hasDuplicateValues(items, property) {
			const seen = new Set();
			for (let i = 0; i < items.length; i++) {
				const value = items[i][property];
				if (!this.hasText(value)) continue;
				const normalizedValue = String(value).trim().toLowerCase();
				if (seen.has(normalizedValue)) return true;
				seen.add(normalizedValue);
			}
			return false;
		},
		hasText(value) {
			return Boolean(value && String(value).trim());
		},
		normalizeField(field) {
			if (this.hasText(field.displayName) && !this.hasText(field.value)) {
				field.value = _.camelCase(field.displayName);
			}
			if (this.hasText(field.displayName)) {
				field.displayName = field.displayName.trim();
			}
			if (this.hasText(field.value)) field.value = field.value.trim();
			if (
				field.type == "singleSelect" ||
				field.type == "multipleSelect"
			) {
				if (!field.choices) field.choices = [];
				field.choices.forEach((choice) => {
					if (
						this.hasText(choice.displayName) &&
						!this.hasText(choice.value)
					) {
						choice.value = _.camelCase(choice.displayName);
					}
					if (this.hasText(choice.displayName)) {
						choice.displayName = choice.displayName.trim();
					}
					if (this.hasText(choice.value))
						choice.value = choice.value.trim();
				});
			}
			if (field.type == "list") {
				if (!field.listFields) field.listFields = [];
				field.listFields.forEach((listField) =>
					this.normalizeField(listField),
				);
			}
		},
		validateFieldList(fields, label = "Fields") {
			fields.forEach((field) => this.normalizeField(field));
			const invalidField = fields.find((field) => {
				return (
					!this.hasText(field.displayName) ||
					!this.hasText(field.value) ||
					!this.hasText(field.type)
				);
			});
			if (invalidField) {
				eventBus.$emit(
					"setSnackbar",
					`${label} cannot be empty`,
					"error",
				);
				return false;
			}
			if (
				this.hasDuplicateValues(fields, "displayName") ||
				this.hasDuplicateValues(fields, "value")
			) {
				eventBus.$emit(
					"setSnackbar",
					`${label} must be unique`,
					"error",
				);
				return false;
			}
			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				if (
					(field.type == "singleSelect" ||
						field.type == "multipleSelect") &&
					!this.validateChoices(field)
				) {
					return false;
				}
				if (
					field.type == "list" &&
					!this.validateFieldList(
						field.listFields || [],
						"Sub fields",
					)
				) {
					return false;
				}
			}
			return true;
		},
		validateChoices(field) {
			if (!field.choices || field.choices.length == 0) {
				eventBus.$emit(
					"setSnackbar",
					`${field.displayName} needs at least one choice`,
					"error",
				);
				return false;
			}
			const invalidChoice = field.choices.find((choice) => {
				return (
					!this.hasText(choice.displayName) ||
					!this.hasText(choice.value)
				);
			});
			if (invalidChoice) {
				eventBus.$emit(
					"setSnackbar",
					"Choice names cannot be empty",
					"error",
				);
				return false;
			}
			if (
				this.hasDuplicateValues(field.choices, "displayName") ||
				this.hasDuplicateValues(field.choices, "value")
			) {
				eventBus.$emit(
					"setSnackbar",
					"Choice names must be unique",
					"error",
				);
				return false;
			}
			return true;
		},
		validateFields() {
			return this.validateFieldList(this.fields);
		},
	},
	watch: {
		displayName: function (newValue, oldValue) {
			const previousValue = _.camelCase(oldValue || "");
			if (!this.value || this.value == previousValue) {
				this.value = _.camelCase(newValue);
			}
		},
		selectedRequestIdx: function () {
			if (
				this.selectedRequestIdx == null ||
				this.selectedRequestIdx < 0
			) {
				return;
			}
			let selectedRequest = this.requests[this.selectedRequestIdx];
			this.displayName = selectedRequest.displayName;
			this.value = _.camelCase(selectedRequest.displayName);
			this.description = selectedRequest.description;
			this.fields = selectedRequest.fields;
			this.fields.forEach((e) => {
				this.prepareField(e);
			});
		},
	},
};
</script>
<style scoped>
.database-form-panel {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
	gap: 12px;
}

.database-field-row {
	display: grid;
	grid-template-columns: max-content minmax(0, 1fr);
	gap: 10px;
	align-items: start;
	margin-bottom: 12px;
}

.database-field-remove {
	padding-top: 12px;
}

@media only screen and (max-width: 960px) {
	.database-form-panel {
		grid-template-columns: 1fr;
	}

	.database-field-row {
		grid-template-columns: 1fr;
	}

	.database-field-remove {
		padding-top: 0;
	}
}
</style>
