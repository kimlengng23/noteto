<template>
	<v-container fluid class="d-flex justify-space-between" style="gap: 5px">
		<v-card class="rounded-xl" outlined elevation="0" min-width="70%">
			<v-card-title class="d-flex justify-space-between">
				<h3>New Database</h3>
				<v-btn
					rounded
					color="primary ml-2"
					depressed
					@click="addDatabase"
					:disabled="!isFormValid"
					:loading="isLoading">
					<i class="fas fa-save mr-1"></i>
					Submit
				</v-btn>
			</v-card-title>
			<v-form ref="form" v-model="isFormValid" lazy-validation>
				<v-card-text>
					<v-text-field
						rounded
						outlined
						dense
						label="Display Name"
						v-model="displayName"
						:rules="strRules"
						required></v-text-field>
					<v-text-field
						rounded
						outlined
						dense
						label="Value Name"
						v-model="value"
						:rules="strRules"
						required></v-text-field>
					<v-textarea
						rounded
						outlined
						dense
						label="Description"
						v-model="description"
						:rules="strRules"
						required></v-textarea>
				</v-card-text>
				<v-card-text>
					<div
						v-for="(field, idxI) in fields"
						:key="`field-${idxI}`"
						class="d-flex align-center grey lighten-4 rounded-xl mb-2">
						<div>
							<v-btn color="error" rounded depressed dense>
								<i class="fas fa-minus mr-1"></i>
								Field
							</v-btn>
						</div>
						<field-form v-model="fields[idxI]"></field-form>
					</div>
					<v-container class="d-flex justify-end">
						<v-btn
							color="primary"
							rounded
							depressed
							@click="fields.push({})">
							<i class="fas fa-plus mr-1"></i>
							Field
						</v-btn>
					</v-container>
				</v-card-text>
			</v-form>
		</v-card>
		<v-card class="rounded-xl" outlined elevation="0" width="30%">
			<v-card-title>New Requests</v-card-title>
			<v-card-text>
				<v-list rounded>
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
			let database = {};
			database.displayName = this.displayName;
			database.value = this.value;
			database.description = this.description;
			this.isLoading = true;
			backendService.addDatabase(database).then((response) => {
				database._id = response.data.insertedId;
				this.$store.commit("addNewDatabaseToList", database);
				this.$store.dispatch("getDatabaseToFields");
				this.$store.dispatch("getDatabaseToHeaderSets");
				this.$store.dispatch("getDatabaseToChoices");
				setTimeout(() => {
					this.displayName = "";
					this.value = "";
					this.description = "";
					this.resetValidation();
					eventBus.$emit(
						"setSnackbar",
						"Successfully added a new database",
						"success"
					);
					this.isLoading = false;
				}, 1000);
			});
		},
		getDatabaseRequests() {
			backendService.getDatabaseRequests().then((response) => {
				this.requests = response.data;
			});
		},
	},
	watch: {
		selectedRequestIdx: function () {
			let selectedRequest = this.requests[this.selectedRequestIdx];
			this.displayName = selectedRequest.displayName;
			this.value = _.camelCase(selectedRequest.displayName);
			this.description = selectedRequest.description;
			this.fields = selectedRequest.fields;
			this.fields.forEach((e) => (e.value = _.camelCase(e.displayName)));
		},
	},
};
</script>
