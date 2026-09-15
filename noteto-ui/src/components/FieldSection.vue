<template>
	<v-container fluid class="field-section-panel pa-0">
		<v-card class="rounded-lg" elevation="0" outlined>
			<v-card-text>
				<v-form ref="fieldForm" lazy-validation>
					<h2 class="mb-1">Field</h2>
					<v-autocomplete
						outlined
						dense
						label="Field Type"
						:items="fieldTypes"
						v-model="fieldType"
						item-value="value"
						item-text="displayName"
						:disabled="isUpdating"></v-autocomplete>
					<v-text-field
						outlined
						dense
						label="Display Name"
						v-model="displayName"
						@input="syncFieldValue"
						:rules="fieldDisplayNameRules"></v-text-field>
					<v-text-field
						outlined
						dense
						label="Field Name"
						v-model="fieldValue"
						@input="syncFieldValueManualState"
						:disabled="isUpdating"
						:rules="fieldValueRules"></v-text-field>

					<div>
						<div
							v-if="
								fieldType == 'singleSelect' ||
								fieldType == 'multipleSelect'
							">
							<h3>Choices</h3>
							<div
								class="choice-row"
								v-for="(choice, idx) in choices"
								:key="idx">
								<div>
									<v-text-field
										outlined
										dense
										:hide-details="false"
										label="Display Name"
										v-model="choice.displayName"
										:rules="choiceDisplayNameRules(choice)"
										@focus="
											rememberChoiceDisplayName(choice)
										"
										@input="
											syncChoiceValue(choice)
										"></v-text-field>
								</div>
								<div>
									<v-text-field
										outlined
										dense
										:hide-details="false"
										label="Name"
										v-model="choice.value"
										:rules="
											choiceValueRules(choice)
										"></v-text-field>
								</div>
								<div>
									<v-menu offset-y>
										<template v-slot:activator="{ on, attrs }">
											<v-btn
												block
												outlined
												depressed
												v-bind="attrs"
												v-on="on">
												<span
													class="choice-color-swatch"
													:style="{
														backgroundColor:
															getChoiceColor(
																choice,
															),
													}"></span>
												Color
											</v-btn>
										</template>
										<div class="choice-color-menu">
											<button
												v-for="color in choiceColors"
												:key="color"
												type="button"
												class="choice-color-option"
												:class="{
													'choice-color-option-selected':
														getChoiceColor(choice) ==
														color,
												}"
												:style="{
													backgroundColor: color,
												}"
												:aria-label="`Set color ${color}`"
												@click="
													setChoiceColor(
														choice,
														color,
													)
												"></button>
										</div>
									</v-menu>
								</div>
								<div class="choice-actions">
									<v-btn
										color="red"
										icon
										depressed
										@click="removeChoice(idx)"
										v-if="choice.isActive == true">
										<v-icon>mdi-close</v-icon>
									</v-btn>
									<v-btn
										color="blue"
										icon
										depressed
										@click="activateChoice(idx)"
										v-else>
										<v-icon>mdi-plus</v-icon>
									</v-btn>
								</div>
							</div>
							<v-container class="d-flex justify-end mx-0 px-0">
								<v-btn
									class="primary ml-2 mt-1"
									depressed
									dark
									@click="addChoice">
									<v-icon left>mdi-plus</v-icon>
									Choice
								</v-btn>
							</v-container>
						</div>
						<div v-if="fieldType == 'list'">
							<h3>Within Fields</h3>
							<v-autocomplete
								v-model="listFields"
								:items="fields"
								return-object
								item-text="displayName"
								chips
								deletable-chips
								multiple
								outlined></v-autocomplete>
						</div>
					</div>
				</v-form>
				<div class="d-flex justify-space-between mt-2">
					<div>
						<v-btn
							class="blue-grey darken-3"
							@click="reset"
							depressed
							dark>
							<v-icon left>mdi-refresh</v-icon>
							Reset
						</v-btn>
						<v-btn
							v-show="isUpdating"
							class="ml-2"
							color="error"
							outlined
							depressed
							:disabled="isSystemField(selectedField)"
							@click="openDeleteDialog(selectedField)">
							<v-icon left>mdi-delete-alert</v-icon>
							Delete
						</v-btn>
					</div>
					<div>
						<v-btn
							v-show="!isUpdating"
							class="primary ml-2"
							@click="addField"
							depressed
							dark
							:loading="isLoading">
							<v-icon left>mdi-content-save</v-icon>
							Add
						</v-btn>
						<v-btn
							v-show="isUpdating"
							class="primary ml-2"
							@click="updateField"
							depressed
							dark
							:loading="isLoading">
							<v-icon left>mdi-content-save</v-icon>
							Update
						</v-btn>
					</div>
				</div>
			</v-card-text>
		</v-card>
		<v-card class="rounded-lg" outlined elevation="0">
			<v-card-text>
				<v-simple-table>
					<template v-slot:default>
						<thead>
							<tr>
								<th>Field</th>
								<th>Type</th>
								<th>Details</th>
								<th class="text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr
								class="text-left"
								v-for="field in fields"
								:key="field.value"
								@click="getFieldToUpdate(field)">
								<td>
									<div class="field-display-name">
										{{ field.displayName }}
									</div>
									<div class="field-value-name">
										{{ field.value }}
									</div>
								</td>
								<td>{{ getFieldTypeDisplayName(field.type) }}</td>
								<td>{{ getFieldDetails(field) }}</td>
								<td class="text-right">
									<v-btn
										icon
										color="error"
										:disabled="isSystemField(field)"
										@click.stop="openDeleteDialog(field)">
										<v-icon>mdi-delete-alert</v-icon>
									</v-btn>
								</td>
							</tr>
						</tbody>
					</template>
				</v-simple-table>
			</v-card-text>
		</v-card>
		<v-dialog v-model="deleteDialog" max-width="520">
			<v-card>
				<v-card-title>Delete field?</v-card-title>
				<v-card-text>
					<v-alert type="warning" outlined dense>
						This hides the field from future forms and settings.
						Existing record data is not removed.
					</v-alert>
					<p class="mb-3">
						Type
						<strong>{{ selectedFieldValue }}</strong>
						to confirm.
					</p>
					<v-text-field
						outlined
						dense
						label="Field name"
						v-model="deleteConfirmation"
						:disabled="isDeleteLoading"></v-text-field>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						text
						@click="closeDeleteDialog"
						:disabled="isDeleteLoading">
						Cancel
					</v-btn>
					<v-btn
						color="error"
						depressed
						@click="deleteField"
						:disabled="!canDeleteField"
						:loading="isDeleteLoading">
						<v-icon left>mdi-delete</v-icon>
						Delete Field
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import formMixin from "@/js/form-mixin";
import _ from "lodash";
export default {
	name: "FieldSection",
	data() {
		return {
			isUpdating: false,
			choices: [],
			types: [],
			headerSets: [],
			listFields: [],
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
			users: [],
			deleteDialog: false,
			deleteConfirmation: "",
			isDeleteLoading: false,
			selectedField: null,
			lastFieldDisplayName: "",
			choiceColors: [
				"#e0e0e0",
				"#90a4ae",
				"#42a5f5",
				"#26a69a",
				"#66bb6a",
				"#d4e157",
				"#ffca28",
				"#ffa726",
				"#ef5350",
				"#ec407a",
				"#ab47bc",
				"#7e57c2",
			],
		};
	},
	mixins: [formMixin],
	computed: {
		activeChoices() {
			return this.choices.filter((choice) => choice.isActive !== false);
		},
		currentDatabase() {
			return this.$store.getters["currentDatabase"] || {};
		},
		databaseToFields() {
			return this.$store.getters["databaseToFields"] || {};
		},
		databaseToChoices() {
			return this.$store.getters["databaseToChoices"] || {};
		},
		databaseValue() {
			return this.currentDatabase.value || null;
		},
		fields() {
			return this.databaseToFields[this.databaseValue] || [];
		},
		fieldToChoices() {
			let fieldToChoices = {};
			let choices = this.databaseToChoices[this.databaseValue];
			if (choices) {
				for (let i = 0; i < choices.length; i++) {
					if (!fieldToChoices[choices[i].field])
						fieldToChoices[choices[i].field] = [];
					fieldToChoices[choices[i].field].push(choices[i]);
				}
			}
			return fieldToChoices;
		},
		fieldTypes() {
			return this.$store.getters["dropdowns"]["fieldType"] || [];
		},
		fieldDisplayNameRules() {
			return [
				(value) => this.hasText(value) || "Required",
				(value) =>
					!this.isDuplicateFieldDisplayName(value) ||
					"A field with this display name already exists",
			];
		},
		fieldValueRules() {
			return [
				(value) => this.hasText(value) || "Required",
				(value) =>
					!this.isDuplicateFieldValue(value) ||
					"A field with this name already exists",
			];
		},
		selectedFieldValue() {
			if (this.selectedField && this.selectedField.value) {
				return this.selectedField.value;
			}
			return "";
		},
		canDeleteField() {
			return (
				this.selectedField &&
				!this.isSystemField(this.selectedField) &&
				this.deleteConfirmation.trim() == this.selectedField.value
			);
		},
	},
	methods: {
		addChoice() {
			this.choices.push({
				isActive: true,
				field: this.fieldValue,
				database: this.databaseValue,
				color: "#e0e0e0",
			});
		},
		activateChoice(idx) {
			this.choices[idx].isActive = true;
		},

		addField() {
			if (!this.validateFieldForm()) return;
			let field = {};
			field.displayName = this.displayName.trim();
			field.value = this.fieldValue.trim();
			field.type = this.fieldType;
			field.database = this.databaseValue;
			this.isLoading = true;
			if (this.fieldType == "list") {
				field.listFields = [];
				this.listFields.forEach((eField, idx) => {
					eField.order = idx + 1;
					field.listFields.push(eField);
				});
			}
			if (this.fieldType == "currencyInDollar") {
				field.options = this.dollarOptions;
			}
			if (this.fieldType == "weightInKg") {
				field.options = this.kgOptions;
			}
			if (this.fieldType == "weightInLb") {
				field.options = this.lbOptions;
			}
			backendService
				.addField(field)
				.then((response) => {
					field._id = response.data.insertedId;
					this.$store.commit("addNewField", field);
					if (
						this.fieldType == "singleSelect" ||
						this.fieldType == "multipleSelect"
					) {
						backendService
							.addChoices(this.choices)
							.then((response) => {
								this.$store.commit(
									"addNewChoices",
									response.data,
								);
							});
					}
					setTimeout(() => {
						this.reset();
						this.isLoading = false;
						eventBus.$emit(
							"setSnackbar",
							"Successfully created a new field",
							"success",
						);
					}, 1000);
				})
				.catch((err) => {
					console.log(err);
					setTimeout(() => {
						this.isLoading = false;
						eventBus.$emit(
							"setSnackbar",
							"Oops! something is not right!",
							"error",
						);
					}, 1000);
				});
		},
		getValueText(obj) {
			if (obj.username) {
				return `${obj.first} ${obj.last} - ${obj.username}`;
			} else {
				return obj.displayName;
			}
		},
		getChoiceColor(choice) {
			return this.normalizeChoiceColor(choice && choice.color);
		},
		setChoiceColor(choice, color) {
			this.$set(choice, "color", this.normalizeChoiceColor(color));
		},
		normalizeChoiceColor(color) {
			if (!color) return "#e0e0e0";
			if (typeof color == "string") {
				return color.trim() || "#e0e0e0";
			}
			if (typeof color == "object") {
				return (
					color.hexa ||
					color.hex ||
					color.value ||
					"#e0e0e0"
				);
			}
			return "#e0e0e0";
		},
		getFieldTypeDisplayName(fieldType) {
			const type = this.fieldTypes.find((item) => item.value == fieldType);
			return type ? type.displayName : fieldType;
		},
		getFieldDetails(field) {
			if (!field) return "";
			if (field.type == "singleSelect" || field.type == "multipleSelect") {
				const choices = this.fieldToChoices[field.value] || [];
				return `${choices.length} choices`;
			}
			if (field.type == "list") {
				const listFields = field.listFields || [];
				return `${listFields.length} within fields`;
			}
			if (field.options && field.options.precision !== undefined) {
				return `Precision ${field.options.precision}`;
			}
			return "";
		},
		getFieldToUpdate(field) {
			this.selectedField = field;
			this.lastFieldDisplayName = field.displayName;
			this.displayName = field.displayName;
			this.fieldValue = field.value;
			this.fieldType = field.type;
			this.listFields = field.listFields || [];
			this.isUpdating = true;
			if (
				field.type == "singleSelect" ||
				field.type == "multipleSelect"
			) {
				this.choices = this.fieldToChoices[field.value];
				if (!this.choices) {
					this.choices = [];
				}
				this.choices.forEach((choice) => {
					this.setLastChoiceDisplayName(
						choice,
						choice.displayName || "",
					);
				});
			}
		},

		removeChoice(idx) {
			if (this.isUpdating) this.choices[idx].isActive = false;
			else this.choices.splice(idx, 1);
		},
		reset() {
			this.displayName = "";
			this.fieldValue = "";
			this.fieldType = "";
			this.isUpdating = false;
			this.choices = [];
			this.listFields = [];
			this.selectedField = null;
			this.lastFieldDisplayName = "";
			this.closeDeleteDialog();
			this.resetFieldValidation();
		},
		resetFieldValidation() {
			this.$nextTick(() => {
				if (this.$refs.fieldForm) {
					this.$refs.fieldForm.resetValidation();
				}
			});
		},
		openDeleteDialog(field) {
			if (!field || this.isSystemField(field)) {
				eventBus.$emit(
					"setSnackbar",
					"This system field cannot be deleted",
					"error",
				);
				return;
			}
			this.selectedField = field;
			this.deleteConfirmation = "";
			this.deleteDialog = true;
		},
		closeDeleteDialog() {
			this.deleteDialog = false;
			this.deleteConfirmation = "";
			this.isDeleteLoading = false;
		},
		deleteField() {
			if (!this.canDeleteField) return;
			const field = {
				database: this.selectedField.database || this.databaseValue,
				value: this.selectedField.value,
				deletedBy: this.$store.getters["currentUser"].username,
			};
			this.isDeleteLoading = true;
			backendService
				.deleteField(field)
				.then(() => {
					this.$store.commit("removeField", field);
					this.reset();
					eventBus.$emit("setSnackbar", "Field deleted", "success");
				})
				.catch((err) => {
					const message =
						err.response && err.response.data
							? err.response.data
							: "Could not delete field";
					eventBus.$emit("setSnackbar", message, "error");
					this.isDeleteLoading = false;
				});
		},
		updateField() {
			if (!this.validateFieldForm()) return;
			let field = {};
			field.database = this.databaseValue;
			field.value = this.fieldValue.trim();
			field.displayName = this.displayName.trim();
			this.isLoading = true;
			if (this.fieldType == "list") {
				field.listFields = [];
				this.listFields.forEach((eField, idx) => {
					eField.order = idx + 1;
					field.listFields.push(eField);
				});
			}
			backendService
				.updateField(field)
				.then(() => {
					if (
						this.fieldType == "singleSelect" ||
						this.fieldType == "multipleSelect"
					) {
						backendService
							.updateChoices(this.choices)
							.then((response) => {
								this.$store.commit(
									"replaceChoicesInDatabaseToChoices",
									response.data,
								);
							});
					}
					setTimeout(() => {
						this.isLoading = false;
						eventBus.$emit(
							"setSnackbar",
							"Successfully updated field",
							"success",
						);
					}, 1000);
				})
				.catch(() => {
					setTimeout(() => {
						this.isLoading = false;
						eventBus.$emit(
							"setSnackbar",
							"Oops! something is not right!",
							"error",
						);
					}, 1000);
				});
		},
		choiceDisplayNameRules(choice) {
			return [
				(value) => this.hasText(value) || "Required",
				(value) =>
					!this.isDuplicateChoiceDisplayName(choice, value) ||
					"Duplicate display name",
			];
		},
		choiceValueRules(choice) {
			return [
				(value) => this.hasText(value) || "Required",
				(value) =>
					!this.isDuplicateChoiceValue(choice, value) ||
					"Duplicate name",
			];
		},
		hasText(value) {
			return Boolean(value && String(value).trim());
		},
		isSystemField(field) {
			return field && ["assignedTo"].includes(field.value);
		},
		isDuplicateChoiceDisplayName(choice, value) {
			return this.hasDuplicateChoiceProperty(
				choice,
				value,
				"displayName",
			);
		},
		isDuplicateChoiceValue(choice, value) {
			return this.hasDuplicateChoiceProperty(choice, value, "value");
		},
		hasDuplicateChoiceProperty(choice, value, property) {
			if (!this.hasText(value)) return false;
			const normalizedValue = String(value).trim().toLowerCase();
			return (
				this.activeChoices.filter((item) => {
					return (
						item !== choice &&
						this.hasText(item[property]) &&
						String(item[property]).trim().toLowerCase() ==
							normalizedValue
					);
				}).length > 0
			);
		},
		isDuplicateFieldDisplayName(value) {
			return this.hasDuplicateFieldProperty(value, "displayName");
		},
		isDuplicateFieldValue(value) {
			return this.hasDuplicateFieldProperty(value, "value");
		},
		hasDuplicateFieldProperty(value, property) {
			if (!this.hasText(value) || this.isUpdating) return false;
			const normalizedValue = String(value).trim().toLowerCase();
			return this.fields.some((field) => {
				return (
					this.hasText(field[property]) &&
					String(field[property]).trim().toLowerCase() ==
						normalizedValue
				);
			});
		},
		normalizeChoices() {
			this.choices.forEach((choice) => {
				if (
					!this.hasText(choice.value) &&
					this.hasText(choice.displayName)
				) {
					choice.value = _.camelCase(choice.displayName);
				}
				if (this.hasText(choice.value))
					choice.value = choice.value.trim();
				if (this.hasText(choice.displayName)) {
					choice.displayName = choice.displayName.trim();
				}
				choice.color = this.normalizeChoiceColor(choice.color);
				choice.field = this.fieldValue;
				choice.database = this.databaseValue;
				if (choice.isActive === undefined) choice.isActive = true;
			});
		},
		rememberChoiceDisplayName(choice) {
			this.setLastChoiceDisplayName(choice, choice.displayName || "");
		},
		setLastChoiceDisplayName(choice, displayName) {
			Object.defineProperty(choice, "_lastDisplayName", {
				value: displayName,
				enumerable: false,
				configurable: true,
				writable: true,
			});
		},
		syncChoiceValue(choice) {
			if (this.isUpdating) {
				this.setLastChoiceDisplayName(choice, choice.displayName || "");
				return;
			}
			const previousValue = _.camelCase(choice._lastDisplayName || "");
			if (!this.hasText(choice.value) || choice.value == previousValue) {
				choice.value = _.camelCase(choice.displayName);
			}
			this.setLastChoiceDisplayName(choice, choice.displayName || "");
		},
		syncFieldValue(value) {
			if (this.isUpdating) return;
			const previousValue = _.camelCase(this.lastFieldDisplayName || "");
			if (
				!this.hasText(this.fieldValue) ||
				this.fieldValue == previousValue
			) {
				this.fieldValue = _.camelCase(value);
			}
			this.lastFieldDisplayName = value || "";
		},
		syncFieldValueManualState(value) {
			if (!this.hasText(value)) {
				this.lastFieldDisplayName = "";
				return;
			}
			if (value == _.camelCase(this.displayName || "")) {
				this.lastFieldDisplayName = this.displayName || "";
			}
		},
		validateChoices() {
			if (
				this.fieldType != "singleSelect" &&
				this.fieldType != "multipleSelect"
			) {
				return true;
			}
			this.normalizeChoices();
			if (this.activeChoices.length == 0) {
				eventBus.$emit(
					"setSnackbar",
					"Add at least one choice",
					"error",
				);
				return false;
			}
			const invalidChoice = this.activeChoices.find((choice) => {
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
				this.hasDuplicateValues(this.activeChoices, "displayName") ||
				this.hasDuplicateValues(this.activeChoices, "value")
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
		validateFieldForm() {
			if (
				!this.hasText(this.displayName) ||
				!this.hasText(this.fieldValue)
			) {
				eventBus.$emit(
					"setSnackbar",
					"Field names cannot be empty",
					"error",
				);
				return false;
			}
			if (!this.hasText(this.fieldType)) {
				eventBus.$emit(
					"setSnackbar",
					"Field type is required",
					"error",
				);
				return false;
			}
			this.displayName = this.displayName.trim();
			this.fieldValue = this.fieldValue.trim();
			if (
				!this.isUpdating &&
				this.isDuplicateFieldDisplayName(this.displayName)
			) {
				eventBus.$emit(
					"setSnackbar",
					"A field with this display name already exists",
					"error",
				);
				return false;
			}
			if (
				!this.isUpdating &&
				this.isDuplicateFieldValue(this.fieldValue)
			) {
				eventBus.$emit(
					"setSnackbar",
					"A field with this name already exists",
					"error",
				);
				return false;
			}
			return this.validateChoices();
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
	},
	watch: {
		displayName: function (newValue, oldValue) {
			if (this.isUpdating) return;
			const previousValue = _.camelCase(oldValue || "");
			if (
				!this.hasText(this.fieldValue) ||
				this.fieldValue == previousValue
			) {
				this.fieldValue = _.camelCase(newValue);
			}
			this.lastFieldDisplayName = newValue || "";
		},
	},
};
</script>
<style scoped>
.field-section-panel {
	display: grid;
	grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
	gap: 12px;
}

.choice-row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 120px max-content;
	gap: 12px;
	align-items: start;
	margin-bottom: 10px;
}

.choice-actions {
	display: flex;
	justify-content: center;
	padding-top: 2px;
}

.choice-color-swatch {
	display: inline-block;
	width: 14px;
	height: 14px;
	margin-right: 8px;
	border: 1px solid rgba(0, 0, 0, 0.18);
	border-radius: 50%;
}

.choice-color-menu {
	display: grid;
	grid-template-columns: repeat(4, 28px);
	gap: 8px;
	padding: 10px;
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 6px;
	box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
}

.choice-color-option {
	width: 28px;
	height: 28px;
	padding: 0;
	cursor: pointer;
	border: 2px solid rgba(0, 0, 0, 0.16);
	border-radius: 50%;
	outline: none;
}

.choice-color-option:hover,
.choice-color-option-selected {
	border-color: #102a43;
	box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.18);
}

.field-display-name {
	color: #1f2933;
	font-weight: 700;
}

.field-value-name {
	color: rgba(0, 0, 0, 0.52);
	font-size: 0.78rem;
}

@media only screen and (max-width: 960px) {
	.field-section-panel {
		grid-template-columns: 1fr;
	}

	.choice-row {
		grid-template-columns: 1fr;
	}

	.choice-actions {
		justify-content: flex-start;
	}
}
</style>
