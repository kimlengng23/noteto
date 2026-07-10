<template>
	<v-container fluid class="white">
		<v-card v-if="isSuccessful" class="-xl" elevation="0" outlined>
			<v-card-title class="d-flex justify-space-between">
				<div>System Message</div>
				<div>
					<v-btn depressed color="primary" @click="reset">
						<v-icon left>mdi-plus</v-icon>
						Request
					</v-btn>
				</div>
			</v-card-title>
			<v-card-text class="text-center">
				<div>
					<span class="text-h5">We have received your request</span>
				</div>
				<div class="text-h3 success--text">
					<v-icon>mdi-check-circle-outline</v-icon>
				</div>
			</v-card-text>
		</v-card>
		<v-card v-else class="" elevation="0" outlined>
			<v-card-title class="d-flex justify-space-between">
				<div>Database Request</div>
				<div>
					<v-btn
						depressed
						color="success"
						:disabled="!formValid || isSuccessful"
						:loading="isLoading"
						@click="submitRequest">
						<v-icon left>mdi-send</v-icon>
						Submit Request
					</v-btn>
				</div>
			</v-card-title>
			<v-card-text>
				<v-form ref="form" v-model="formValid">
					<v-text-field
						class="mb-2"
						dense
						outlined
						hide-details
						:rules="[(v) => !!v || '']"
						label="Database Name"
						v-model="request.displayName"></v-text-field>
					<v-textarea
						dense
						outlined
						hide-details
						:rules="[(v) => !!v || '']"
						label="Database Description"
						v-model="request.description"></v-textarea>
					<v-container>
						<div class="text-h6">Field List</div>
					</v-container>
					<div
						v-for="(field, idxI) in fields"
						:key="`field-${idxI}`"
						class="d-flex align-center mb-2">
						<div class="px-1">
							<v-btn
								color="error"
								depressed
								dense
								@click="fields.splice(idxI, 1)">
								<v-icon left>mdi-minus</v-icon>
								Field
							</v-btn>
						</div>
						<field-form
							v-model="fields[idxI]"
							:show-value="false"></field-form>
					</div>
					<v-container class="d-flex justify-end">
						<v-btn
							color="primary"
							depressed
							@click="
								fields.push({ choices: [], listFields: [] })
							">
							<v-icon left>mdi-plus</v-icon>
							Field
						</v-btn>
					</v-container>
				</v-form>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import FieldForm from "@/components/FieldForm.vue";
import generalMixin from "@/js/general-mixin.js";
import backendService from "@/services/backend-service";
export default {
	name: "DatabaseRequest",
	components: {
		"field-form": FieldForm,
	},
	mixins: [generalMixin],
	computed: {
		fieldTypes() {
			return this.$store.getters["dropdowns"]["fieldType"];
		},
	},
	data() {
		return {
			formValid: false,
			request: {},
			fields: [],
			isLoading: false,
			isSuccessful: false,
		};
	},
	methods: {
		reset() {
			this.fields = [];
			this.request = {};
			this.isSuccessful = false;
		},
		submitRequest() {
			if (!this.$refs.form.validate()) return;
			if (this.fields.length == 0) return;

			for (let i = 0; i < this.fields.length; i++) {
				let field = this.fields[i];
				if (
					field.type == "singleSelect" ||
					field.type == "multipleSelect"
				) {
					if (field.choices.length == 0) {
						this.errorSnackbar(
							"Dropdown field must contain choices",
						);
					}
				}
			}
			this.isLoading = true;
			this.request.fields = this.fields;
			backendService.addDatabaseRequest(this.request).then(() => {
				this.timer(1000).then(() => {
					this.isLoading = false;
					this.isSuccessful = true;
					this.successSnackbar("Successfully submitted your request");
				});
			});
		},
	},
};
</script>
