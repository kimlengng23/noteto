<template>
  <div>
    <v-tabs v-model="tab" @change="reset" grow>
      <v-tab>Add Group</v-tab>
      <v-tab>Update Group Members</v-tab>
      <v-tab>Update Database Access</v-tab>
      <v-tabs-items v-model="tab" class="d-flex justify-center mt-2">
        <v-tab-item>
          <v-card outlined elevation="0">
            <v-card-title class="d-flex justify-space-between"
              ><h3>New Group</h3>
              <v-btn
                rounded
                color="primary ml-2"
                depressed
                :disabled="!isLoggedIn || selectedUsers.length == 0"
                @click="addGroup"
                :loading="isLoading"
                ><i class="fas fa-plus mr-2"></i>Add</v-btn
              >
            </v-card-title>

            <v-card-text>
              <v-text-field
                label="Display Name"
                v-model="displayName"
              ></v-text-field>
              <v-text-field label="Value Name" v-model="value"></v-text-field>
              <v-data-table
                v-model="selectedUsers"
                :headers="userHeaders"
                :items="allUsers"
                show-select
                item-key="_id"
                :options="{ itemsPerPage: 15 }"
              >
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card elevation="0" outlined>
            <v-card-title class="d-flex justify-space-between"
              ><h3>Update Group</h3>
              <v-btn
                rounded
                color="primary ml-2"
                depressed
                :disabled="!isLoggedIn || !selectedGroup"
                @click="updateGroupMembers"
                :loading="isLoading"
                ><i class="fas fa-save mr-2"></i>Update</v-btn
              >
            </v-card-title>
            <v-card-text>
              <v-autocomplete
                label="Group"
                :items="allGroups"
                :item-text="getGroupNameText"
                v-model="selectedGroup"
                @change="reselectUsers"
                return-object
              ></v-autocomplete>
              <v-data-table
                v-model="selectedUsers"
                :headers="userHeaders"
                :items="allUsers"
                show-select
                item-key="_id"
                :options="{ itemsPerPage: 15 }"
              >
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card elevation="0" outlined>
            <v-card-title class="d-flex justify-space-between"
              ><h3>Database Access</h3>
              <v-btn
                rounded
                color="primary ml-2"
                depressed
                :disabled="!isLoggedIn || !selectedDatabase"
                @click="updateDatabaseGroups"
                :loading="isLoading"
                ><i class="fas fa-save mr-2"></i>Update</v-btn
              >
            </v-card-title>
            <v-card-text>
              <v-autocomplete
                label="Database"
                :items="allDatabases"
                v-model="selectedDatabase"
                @change="reselectGroups"
                :item-text="getDatabaseNameText"
                return-object
              ></v-autocomplete>
              <v-data-table
                v-model="selectedGroups"
                :headers="groupHeaders"
                :items="allGroups"
                show-select
                item-key="_id"
                :options="{ itemsPerPage: 15 }"
              >
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    <general-snackbar></general-snackbar>
  </div>
</template>
<script>
import backendService from "@/services/backend-service";
import mixin from "@/js/mixin";
import GeneralSnackBar from "@/components/GeneralSnackBar.vue";
import formMixin from "@/js/form-mixin";
import eventBus from "@/js/event-bus";
export default {
  Name: "GroupRegister",
  data() {
    return {
      tab: null,
      selectedDatabase: null,
      selectedGroup: null,
      displayName: "",
      value: "",
      user: {},
      selectedGroups: [],
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
      groupHeaders: [
        {
          text: "Id",
          value: "_id",
          alight: "center",
        },
        {
          text: "Display Name",
          value: "displayName",
          align: "center",
        },
        {
          text: "Value Name",
          value: "value",
          align: "center",
        },
      ],
    };
  },
  components: { "general-snackbar": GeneralSnackBar },
  mixins: [mixin, formMixin],
  computed: {},
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
              true
            );
            this.isLoading = false;
          }, 1000);
        })
        .catch((response) => {
          console.error(response);
          setTimeout(() => {
            eventBus.$emit(
              "setSnackbar",
              "Ops! Something is not right!",
              "red",
              true
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
            "Successfully Updated Members",
            "success",
            true
          );
        }, 1000);
      });
    },
    updateDatabaseGroups() {
      let database = {};
      database.databaseId = this.selectedDatabase._id;
      database.groups = this.selectedGroups;
      this.isLoading = true;
      backendService.updateDatabaseGroups(database).then(() => {
        this.selectedDatabase.groups = this.selectedGroups;
        this.$store.commit("setDatabase", this.selectedDatabase);
        setTimeout(() => {
          eventBus.$emit(
            "setSnackbar",
            "Successfully Updated Database's Groups",
            "success",
            true
          );
          this.isLoading = false;
        }, 1000);
      });
    },
    getGroupNameText(group) {
      return `${group.displayName} - ${group.value}`;
    },
    getDatabaseNameText(database) {
      return `${database.displayName} - ${database.value}`;
    },
    reset() {
      this.displayName = "";
      this.value = "";
      this.selectedDatabase = {};
      this.selectedGroups = [];
      this.selectedUsers = [];
    },
    reselectUsers(item) {
      this.selectedUsers = item.users;
    },
    reselectGroups(item) {
      this.selectedGroups = item.groups;
    },
  },
  watch: {},
};
</script>

<style></style>
