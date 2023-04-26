<template>
  <v-container fluid class="d-flex justify-center mt-2">
    <v-card elevation="0">
      <v-card-title class="d-flex justify-space-between"
        ><h3>Database Access</h3>
        <v-btn
          rounded
          color="primary ml-2"
          depressed
          @click="update"
          :disabled="!isLoggedIn"
          ><i class="fas fa-save mr-2"></i>Update</v-btn
        >
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="formValid" lazy-validation> </v-form>
        <v-autocomplete
          label="Database"
          @change="refreshUserList"
          v-model="access.database"
          :items="databases"
          return-object
          item-text="displayName"
        ></v-autocomplete>
        <v-autocomplete
          label="Username"
          v-model="access.user"
          :items="allUsers"
          return-object
          :item-text="getFullName"
        ></v-autocomplete>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-center">Id</th>
              <th class="text-center">Full Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usersWithAccess.length == 0">
              <td class="text-center" colspan="2">Empty List</td>
            </tr>
            <tr v-for="(user, idx) in usersWithAccess" :key="idx">
              <td>{{ user._id }}</td>
              <td>{{ user.first + " " + user.last }}</td>
              <td>
                <v-btn
                  rounded
                  color="red white--text ml-2"
                  depressed
                  @click="removeAccess(idx)"
                  :disabled="!isLoggedIn"
                  ><i class="fas fa-times mr-2"></i>Remove</v-btn
                >
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <general-snackbar></general-snackbar>
  </v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import GeneralSnackbar from "../components/GeneralSnackBar.vue";
import mixin from "../js/mixin.js";
export default {
  name: "DatabaseAccess",
  components: {
    "general-snackbar": GeneralSnackbar,
  },
  data() {
    return {
      access: {},
      usersWithAccess: [],
    };
  },
  mixins: [mixin],
  computed: {
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"];
    },
    databases() {
      return this.$store.getters["allDatabases"];
    },
    allUsers() {
      return this.$store.getters["allUsers"];
    },
  },
  methods: {
    update() {
      backendService.addDatabaseAccess(this.access).then(() => {
        this.usersWithAccess.push(this.access.user);
        eventBus.$emit(
          "setSnackbar",
          "Successfully Added User to the Database",
          "success",
          true
        );
      });
    },
    getFullName(user) {
      return user.first + " " + user.last;
    },
    removeAccess(idx) {
      let access = {
        database: this.access.database,
        user: this.usersWithAccess[idx],
      };
      backendService.removeDatabaseAccess(access).then(() => {
        this.usersWithAccess.splice(idx, 1);
        eventBus.$emit(
          "setSnackbar",
          "Successfully Remove User from the Database",
          "success",
          true
        );
      });
    },
    refreshUserList(database) {
      backendService.getUsersByDatabase(database.value).then((response) => {
        this.usersWithAccess = response.data;
      });
    },
  },
};
</script>
