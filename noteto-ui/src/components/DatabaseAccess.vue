<template>
	<v-container fluid class="pa-0">
		<v-card class="rounded-lg" elevation="0" outlined>
			<v-card-title class="d-flex justify-space-between">
				<div>Database Access</div>
				<v-btn
					color="primary ml-2"
					depressed
					:disabled="!isLoggedIn || !selectedDatabase.value"
					@click="updateDatabaseAccess"
					:loading="isLoading">
					<v-icon left>mdi-content-save</v-icon>
					Update
				</v-btn>
			</v-card-title>
			<v-card-text>
				<v-autocomplete
					outlined
					dense
					label="Database"
					:items="allDatabases"
					v-model="selectedDatabase"
					@change="reselectedUsers"
					:item-text="getDatabaseNameText"
					return-object></v-autocomplete>
				<v-data-table
					v-model="selectedUsers"
					:headers="headers"
					:items="allUsers"
					show-select
					item-key="_id"
					:options="{ itemsPerPage: -1 }">
					<template #[`item.dateCreated`]="{ item }">
						<td>
							{{ convertToDate(item.dateCreated) }}
						</td>
					</template>
				</v-data-table>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import eventBus from "@/js/event-bus";
import formMixin from "@/js/form-mixin";
import mixin from "@/js/mixin";
import backendService from "@/services/backend-service";
export default {
	name: "DatabaseAccess",

	data() {
		return {
			headers: [
				{
					text: "Id",
					value: "_id",
					alight: "center",
				},
				{
					text: "First",
					value: "first",
					alight: "center",
				},
				{
					text: "Last",
					value: "last",
					alight: "center",
				},
				{
					text: "Username",
					value: "username",
					alight: "center",
				},
				{
					text: "Date Created",
					value: "dateCreated",
				},
			],
			selectedDatabase: {},
			selectedUsers: [],
		};
	},
	mixins: [mixin, formMixin],
	mounted() {
		this.selectDefaultDatabase();
	},
	computed: {
		isLoggedIn() {
			return this.$store.getters["isLoggedIn"];
		},
	},
	methods: {
		selectDefaultDatabase() {
			const currentDatabase = this.$store.getters["currentDatabase"];
			if (currentDatabase && currentDatabase.value) {
				this.selectedDatabase = currentDatabase;
			} else if ((this.allDatabases || []).length > 0) {
				this.selectedDatabase = this.allDatabases[0];
			}
			if (this.selectedDatabase && this.selectedDatabase.value) {
				this.reselectedUsers();
			}
		},
		getDatabaseNameText(database) {
			return `${database.displayName} - ${database.value}`;
		},
		reselectedUsers() {
			backendService
				.getAccessesByDatabase(this.selectedDatabase.value)
				.then((response) => {
					let selectedUsers = [];
					let accesses = response.data || [];
					for (let i = 0; i < accesses.length; i++) {
						selectedUsers.push(accesses[i].user);
					}
					this.selectedUsers = selectedUsers;
				});
		},
		updateDatabaseAccess() {
			let wrappedAccess = {};
			wrappedAccess.database = this.selectedDatabase;
			wrappedAccess.selectedUsers = this.selectedUsers;
			this.isLoading = true;
			backendService.updateDatabaseAccess(wrappedAccess).then(() => {
				setTimeout(() => {
					this.isLoading = false;
					eventBus.$emit(
						"setSnackbar",
						"Successfully updated database access",
						"success",
					);
				}, 1000);
			});
		},
	},
};
</script>
