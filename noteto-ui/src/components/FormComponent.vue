<template>
	<v-container fluid class="pa-0">
		<v-form v-model="formValid[formValue]" :ref="`form-${formValue}`">
			<v-container fluid
				class="d-flex pa-0 flex-wrap flex-lg-nowrap"
				v-for="(row, idxI) in pRows"
				:key="`row-${idxI}`">
				<v-container fluid
					v-for="(col, idxJ) in row.cols"
					:key="`col-${idxJ}`"
					class="form-field-cell">
					<v-text-field
						v-if="fieldToField[col.field]?.type === 'singleLine'"
						outlined
						dense
						:rules="getRules(col.field)"
						:label="fieldToField[col.field]?.displayName"
						v-model="entry[col.field]"
						:readonly="readonly"
						hide-details></v-text-field>
					<v-textarea
						v-else-if="
							fieldToField[col.field]?.type === 'multipleLines'
						"
						outlined
						dense
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						v-model="entry[col.field]"
						:readonly="readonly"
						hide-details></v-textarea>
					<decimal-field
						v-else-if="
							fieldToField[col.field]?.type === 'currencyInDollar'
						"
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						prefix="$"
						v-model="entry[col.field]"
						:readonly="readonly"
						hide-details
						@change="changeEvent(col.field)"></decimal-field>
					<decimal-field
						v-else-if="
							fieldToField[col.field]?.type === 'weightInLb'
						"
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						suffix="Lbs"
						v-model="entry[col.field]"
						:readonly="readonly"
						hide-details></decimal-field>
					<decimal-field
						v-else-if="
							fieldToField[col.field]?.type === 'weightInKg'
						"
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						suffix="Kg"
						v-model="entry[col.field]"
						:readonly="readonly"
						hide-details></decimal-field>
					<v-text-field
						v-else-if="fieldToField[col.field]?.type === 'number'"
						outlined
						dense
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						v-model.number="entry[col.field]"
						:readonly="readonly"
						@change="changeEvent(col.field)"
						hide-details></v-text-field>

					<v-autocomplete
						v-else-if="
							fieldToField[col.field]?.type === 'singleSelect'
						"
						outlined
						dense
						:rules="getRules(col.field)"
						:label="fieldToField[col.field]?.displayName"
						:items="fieldToChoices[col.field]"
						item-text="displayName"
						return-object
						small-chips
						deletable-chips
						v-model="entry[col.field]"
						@change="automate(col.field)"
						:readonly="readonly"
						hide-details>
						<template v-slot:item="{ item }">
							<div class="choice-option">
								<span
									class="choice-dot"
									:style="{
										backgroundColor: getChoiceColor(item),
									}"></span>
								{{ item.displayName }}
							</div>
						</template>
						<template v-slot:selection="{ item }">
							<v-chip
								small
								:color="getChoiceColor(item)"
								:text-color="getChoiceTextColor(item)">
								{{ item.displayName }}
							</v-chip>
						</template>
					</v-autocomplete>
					<v-autocomplete
						v-else-if="
							fieldToField[col.field]?.type === 'multipleSelect'
						"
						outlined
						dense
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						:items="fieldToChoices[col.field]"
						item-text="displayName"
						return-object
						multiple
						small-chips
						deletable-chips
						:readonly="readonly"
						v-model="entry[col.field]"
						hide-details>
						<template v-slot:item="{ item }">
							<div class="choice-option">
								<span
									class="choice-dot"
									:style="{
										backgroundColor: getChoiceColor(item),
									}"></span>
								{{ item.displayName }}
							</div>
						</template>
						<template v-slot:selection="{ item }">
							<v-chip
								small
								:color="getChoiceColor(item)"
								:text-color="getChoiceTextColor(item)">
								{{ item.displayName }}
							</v-chip>
						</template>
					</v-autocomplete>
					<v-autocomplete
						v-else-if="
							fieldToField[col.field]?.type === 'singleUser'
						"
						outlined
						dense
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						:items="users"
						:item-text="getFullName"
						v-model="entry[col.field]"
						return-object
						@change="automate(col.field)"
						:readonly="readonly"
						hide-details></v-autocomplete>
					<v-autocomplete
						outlined
						dense
						v-else-if="
							fieldToField[col.field]?.type === 'multipleUsers'
						"
						:label="fieldToField[col.field]?.displayName"
						:rules="getRules(col.field)"
						:items="users"
						:item-text="getFullName"
						deletable-chipsoutlined
						multiple
						chips
						deletable-chips
						v-model="entry[col.field]"
						return-object
						:readonly="readonly"
						hide-details></v-autocomplete>
					<date-picker
						v-else-if="fieldToField[col.field]?.type === 'date'"
						:label="fieldToField[col.field]?.displayName"
						v-model="entry[col.field]"
						:readonly="readonly"></date-picker>
					<!-- <v-menu
						v-else-if="fieldToField[col.field]?.type === 'date'"
						v-model="datePicker[col.field]"
						:close-on-content-click="false"
						transition="scale-transition"
						offset-y
						max-width="290px"
						min-width="290px">
						<template v-slot:activator="{ on, attrs }">
							<v-text-field
								
								outlined
								dense
								:rules="getRules(col.field)"
								:value="formatDate(value[col.field])"
								:label="fieldToField[col.field]?.displayName"
								persistent-hint
								prepend-icon="mdi-calendar"
								v-bind="attrs"
								v-on="on"
								:readonly="readonly"
								hide-details></v-text-field>
						</template>
						<v-date-picker
							v-model="value[col.field]"
							no-title
							@input="
								datePicker[col.field] = false
							"></v-date-picker>
					</v-menu> -->
					<div v-else-if="fieldToField[col.field]?.type === 'list'">
						<v-container class="mx-3">
							<h2>{{ fieldToField[col.field]?.displayName }}</h2>
						</v-container>
						<div
							v-for="(lRow, lIdxI) in entry[col.field]"
							:key="`lRow-${lIdxI}`"
							class="d-flex align-center flex-wrap flex-lg-nowrap">
							<form-component
								v-model="entry[col.field][lIdxI]"
								:root="root"
								:p-rows="getRowsFromListField(entry, col.field)"
								:form-value="`${formValue}-${lIdxI}`"></form-component>
							<div class="d-flex justify-end">
								<v-btn
									color="error"
									depressed
									width="100%"
									@click="removeFromList(lIdxI, col.field)">
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</div>
						</div>
						<v-container>
							<v-row>
								<v-col>
									<v-btn
										color="primary ml-2"
										depressed
										@click="addRowIntoList(col.field)">
										<v-icon left>mdi-plus</v-icon>
										Add
									</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</div>
				</v-container>
			</v-container>
		</v-form>
	</v-container>
</template>
<script>
import DecimalField from "@/components/DecimalField.vue";
import DatePicker from "@/components/DatePicker.vue";
import mixin from "@/js/mixin.js";
import { readonly } from "vue";
export default {
	name: "FormComponent",
	mixins: [mixin],
	components: { "decimal-field": DecimalField, "date-picker": DatePicker },
	mounted: function () {
		this.validateForm();
	},
	props: {
		value: {
			type: Object,
			default: () => {
				return {};
			},
		},
		root: {
			type: Object,
			default: () => {
				return {};
			},
		},
		pRows: {
			type: Array,
			default: () => {
				return [];
			},
		},
		readonly: {
			type: Boolean,
			default: () => {
				return false;
			},
		},
		formValue: {
			type: String,
			default: () => {
				return "1";
			},
		},
	},
	data() {
		return {
			datePicker: {},
		};
	},
	computed: {
		entry: {
			get() {
				return this.value;
			},
			set(val) {
				this.$emit("input", val);
			},
		},
		formValid: {
			get() {
				return this.$store.getters["formValid"];
			},
			set(val) {
				this.$store.commit("setFormValid", val);
			},
		},
	},
	methods: {
		getChoiceColor(choice) {
			const color = choice && choice.color;
			if (!color) return "#e0e0e0";
			if (typeof color == "string") return color;
			if (typeof color == "object") {
				return color.hexa || color.hex || color.value || "#e0e0e0";
			}
			return "#e0e0e0";
		},
		getChoiceTextColor(choice) {
			const color = String(this.getChoiceColor(choice)).replace("#", "");
			if (color.length < 6) return "black";
			const red = parseInt(color.substring(0, 2), 16);
			const green = parseInt(color.substring(2, 4), 16);
			const blue = parseInt(color.substring(4, 6), 16);
			const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
			return brightness > 150 ? "black" : "white";
		},
		validateForm() {
			this.$nextTick(() => {
				const form = this.$refs[`form-${this.formValue}`];
				if (form) form.validate();
			});
		},
		getRowsFromListField(entry, field) {
			let rows = [];
			let listFields = this.fieldToField[field].listFields;
			let cols = [];
			readonly;
			for (let j = 0; j < listFields.length; j++) {
				let col = {
					field: listFields[j].value,
					label: "",
				};
				cols.push(col);
			}
			let row = { cols };
			rows.push(row);
			return rows;
		},
		getRules(field) {
			if (!this.requiredFields[field]) return [];
			return [(v) => !!v || "Required"];
			// if (this.fieldToField[field]?.type === "singleLine") {
			//   return [(v) => !!v || "Required"];
			// }
			// if (this.fieldToField[field]?.type === "multipleLines") {
			//   return [(v) => !!v || "Required"];
			// }
			// if (this.fieldToField[field]?.type === "singleSelect") {
			//   return [(v) => !!v || "Required"];
			// }
			// if (this.fieldToField[field]?.type === "multipleSelect") {
			//   return [(v) => !!v || "Required"];
			// }
		},
	},
	watch: {
		pRows: function () {
			this.validateForm();
		},
	},
};
</script>
<style scoped>
.form-field-cell {
	padding: 4px 8px;
}

.choice-option {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.choice-dot {
	display: inline-block;
	width: 12px;
	height: 12px;
	border: 1px solid rgba(0, 0, 0, 0.18);
	border-radius: 50%;
}

@media only screen and (min-width: 960px) {
	.form-field-cell {
		padding: 4px 8px;
	}
}
</style>
