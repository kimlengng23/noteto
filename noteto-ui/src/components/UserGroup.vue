<template>
	<v-tabs v-model="tab" @change="reset" grow>
		<v-tab>Create Group</v-tab>
		<v-tab>Members</v-tab>

		<v-tabs-items v-model="tab">
			<v-tab-item>
				<v-container fluid>
					<v-card elevation="0" class="-lg" outlined>
						<v-card-title class="d-flex justify-space-between">
							<div>Create Group</div>
							<v-btn
								color="primary ml-2"
								depressed
								:disabled="
									!isLoggedIn || selectedUsers.length == 0
								"
								@click="addGroup"
								:loading="isLoading">
								<v-icon left>mdi-plus</v-icon>
								Add
							</v-btn>
						</v-card-title>
						<v-card-text>
							<v-text-field
								outlined
								dense
								label="Display Name"
								v-model="displayName"></v-text-field>
							<v-text-field
								outlined
								dense
								label="Value"
								v-model="value"></v-text-field>
							<v-data-table
								v-model="selectedUsers"
								:headers="userHeaders"
								:items="allUsers"
								show-select
								item-key="_id"
								:options="{ itemsPerPage: 15 }"></v-data-table>
						</v-card-text>
					</v-card>
				</v-container>
			</v-tab-item>
			<v-tab-item>
				<v-container fluid>
					<v-card elevation="0" class="rounded-lg" outlined>
						<v-card-title class="d-flex justify-space-between">
							<div>Group Members</div>
							<v-btn
								color="primary ml-2"
								depressed
								:disabled="!isLoggedIn || !selectedGroup"
								@click="updateGroupMembers"
								:loading="isLoading">
								<v-icon left>mdi-content-save</v-icon>
								Update
							</v-btn>
						</v-card-title>
						<v-card-text>
							<v-autocomplete
								outlined
								dense
								label="Group"
								:items="allGroups"
								:item-text="getGroupNameText"
								v-model="selectedGroup"
								@change="reselectUsers"
								return-object></v-autocomplete>
							<v-data-table
								v-model="selectedUsers"
								:headers="userHeaders"
								:items="allUsers"
								show-select
								item-key="_id"
								:options="{ itemsPerPage: 15 }"></v-data-table>
						</v-card-text>
					</v-card>
				</v-container>
			</v-tab-item>
		</v-tabs-items>
	</v-tabs>
</template>
<script>
import backendService from "@/services/backend-service";
import mixin from "@/js/mixin";
import formMixin from "@/js/form-mixin";
import eventBus from "@/js/event-bus";
import _ from "lodash";
export default {
	name: "UserGroup",
	data() {
		return {
			tab: null,
			selectedGroup: null,
			displayName: "",
			value: "",
			user: {},
			selectedUsers: [],
			userHeaders: [
				{
					text: "Id",
					value: "_id",
					align: "center",
				},
				{
					text: "First",
					value: "first",
					align: "center",
				},
				{
					text: "Last",
					value: "last",
					align: "center",
				},
				{
					text: "Username",
					value: "username",
					align: "right",
				},
			],
		};
	},
	components: {},
	mixins: [mixin, formMixin],
	methods: {
		addGroup() {
			let group = {};
			group.displayName = this.displayName;
			group.value = this.value;
			group.users = this.selectedUsers;
			this.isLoading = true;
			backendService
				.addGroup(group)
				.then((response) => {
					group._id = response.data.insertedId;
					this.$store.commit("addNewGroupToList", group);
					this.selectedUsers = [];
					this.value = "";
					this.displayName = "";
					setTimeout(() => {
						eventBus.$emit(
							"setSnackbar",
							"Successfully added a group",
							"success",
						);
						this.isLoading = false;
					}, 1000);
				})
				.catch((response) => {
					console.error(response);
					setTimeout(() => {
						eventBus.$emit(
							"setSnackbar",
							"Oops! Something is not right!",
							"red",
						);
						this.isLoading = false;
					}, 1000);
				});
		},
		updateGroupMembers() {
			let group = {};
			group.groupId = this.selectedGroup._id;
			group.users = this.selectedUsers;
			this.isLoading = true;
			backendService.updateGroupMembers(group).then(() => {
				this.selectedGroup.users = this.selectedUsers;
				this.$store.commit("setGroup", this.selectedGroup);
				this.$store.commit("setGroupsInDatabases", this.selectedGroup);
				setTimeout(() => {
					this.isLoading = false;
					eventBus.$emit(
						"setSnackbar",
						"Successfully updated members",
						"success",
					);
				}, 1000);
			});
		},
		getGroupNameText(group) {
			return `${group.displayName} - ${group.value}`;
		},
		reset() {
			this.displayName = "";
			this.value = "";
			this.selectedUsers = [];
			this.selectedGroup = null;
		},
		reselectUsers(item) {
			this.selectedUsers = item && item.users ? item.users : [];
		},
	},
	watch: {
		displayName: function (newValue, oldValue) {
			const previousValue = _.camelCase(oldValue || "");
			if (!this.value || this.value == previousValue) {
				this.value = _.camelCase(newValue);
			}
		},
	},
};
</script>

<style scoped>
.v-tab {
	letter-spacing: 0;
}
</style>
