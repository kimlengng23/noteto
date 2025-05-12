<template>
	<v-container>
		<v-container
			class="d-flex justify-space-between pa-0 mb-2"
			style="gap: 2px">
			<v-container class="pa-0">
				<v-autocomplete
					rounded
					dense
					outlined
					hide-details
					:rules="[(v) => !!v || '']"
					:items="fieldTypes"
					item-text="displayName"
					item-value="value"
					label="Field Type"
					v-model="field.type"></v-autocomplete>
			</v-container>
			<v-container class="pa-0">
				<v-text-field
					rounded
					dense
					outlined
					hide-details
					:rules="[(v) => !!v || '']"
					label="Display Name"
					v-model="field.displayName"></v-text-field>
			</v-container>
			<v-container class="pa-0">
				<v-text-field
					rounded
					dense
					outlined
					hide-details
					:rules="[(v) => !!v || '']"
					label="Field Value"
					v-model="field.value"></v-text-field>
			</v-container>
		</v-container>
		<v-container
			class="pa-0"
			v-if="
				field.type == 'singleSelect' || field.type == 'multipleSelect'
			">
			<div
				v-for="(choice, idxJ) in field.choices"
				:key="`choice-${idxJ}`"
				class="d-flex"
				style="gap: 2px">
				<v-text-field
					class="mb-1"
					rounded
					dense
					outlined
					hide-details
					:rules="[(v) => !!v || '']"
					label="Choice"
					v-model="choice.displayName"></v-text-field>
				<v-text-field
					class="mb-1"
					rounded
					dense
					outlined
					hide-details
					:rules="[(v) => !!v || '']"
					label="Choice"
					v-model="choice.value"></v-text-field>
				<v-btn
					color="error"
					rounded
					depressed
					icon
					@click="field.choices.splice(idxJ, 1)">
					<i class="fas fa-times"></i>
				</v-btn>
			</div>
			<div class="d-flex justify-end">
				<v-btn
					rounded
					depressed
					color="primary"
					@click="field.choices.push({})">
					<i class="fas fa-plus mr-1"></i>
					Choice
				</v-btn>
			</div>
		</v-container>
	</v-container>
</template>
<script>
export default {
	name: "FieldForm",
	props: {
		value: {
			type: Object,
			default: () => {
				return {};
			},
		},
	},
	computed: {
		field: {
			get() {
				return this.value;
			},
			set(val) {
				this.$emit("input", val);
			},
		},
		fieldTypes() {
			return this.$store.getters["dropdowns"]["fieldType"];
		},
	},
};
</script>
