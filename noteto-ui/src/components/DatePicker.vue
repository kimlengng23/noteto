<template>
	<v-menu
		ref="menu"
		v-model="datePickerDialog"
		:close-on-content-click="false"
		:return-value.sync="input"
		transition="scale-transition"
		offset-y
		min-width="auto">
		<template v-slot:activator="{ on, attrs }">
			<v-text-field
				:rules="rules"
				v-model="formattedDate"
				:label="label"
				prepend-icon="mdi-calendar"
				:readonly="readonly"
				v-bind="attrs"
				v-on="on"
				outlined
				dense
				:disabled="disabled"
				hide-details></v-text-field>
		</template>
		<v-date-picker v-model="input" no-title scrollable>
			<v-spacer></v-spacer>
			<v-btn text color="primary" @click="datePickerDialog = false">
				Cancel
			</v-btn>
			<v-btn text color="primary" @click="$refs.menu.save(input)">
				OK
			</v-btn>
		</v-date-picker>
	</v-menu>
</template>
<script>
export default {
	name: "DatePicker",
	mounted: function () {
		setTimeout(() => {
			if (this.input) {
				this.formattedDate = this.formatDate(this.input);
			}
		}, 100);
	},
	props: {
		value: {
			type: Number,
			default: () => {
				return null;
			},
		},
		label: {
			type: String,
			default: () => {
				return "Label";
			},
		},
		rules: {
			type: Array,
			default: () => {
				return [];
			},
		},
		disabled: {
			type: Boolean,
			default: () => {
				return false;
			},
		},
		readonly: {
			type: Boolean,
			default: () => {
				return false;
			},
		},
	},
	computed: {
		input: {
			get() {
				return this.parseDate(this.value);
			},
			set(val) {
				this.$emit("input", new Date(val).getTime());
			},
		},
	},
	data() {
		return {
			formattedDate: null,
			datePickerDialog: false,
		};
	},
	methods: {
		formatDate(date) {
			if (!date) return null;
			if (date.includes("T")) date = date.split("T")[0];
			const [year, month, day] = date.split("-");
			return `${month}/${day}/${year}`;
		},
		parseDate(time) {
			if (!time) return null;
			let iso = new Date(time).toISOString();
			iso = iso.split("T")[0];
			const [year, month, day] = iso.split("-");
			const toReturn = `${year}-${month.padStart(2, "0")}-${day.padStart(
				2,
				"0",
			)}`;
			return toReturn;
		},
	},
	watch: {
		input() {
			this.formattedDate = this.formatDate(this.input);
		},
	},
};
</script>
