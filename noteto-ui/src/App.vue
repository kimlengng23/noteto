<template>
  <v-app>
    <main-navbar v-if="parentName != 'CustomView'"></main-navbar>
    <second-navbar
      v-if="isMobile && isLoggedIn && parentName != 'CustomView'"
    ></second-navbar>
    <v-main class="grey lighten-4">
      <router-view></router-view>
    </v-main>
    <mongo-connection-dialog v-if="showMongoConnectionDialog"></mongo-connection-dialog>
    <general-dialog></general-dialog>
    <general-snackbar></general-snackbar>
  </v-app>
</template>

<script>
import GeneralDialog from "./components/GeneralDialog.vue";
import GeneralSnackbar from "./components/GeneralSnackbar.vue";
import MainNavbar from "./components/Navbar.vue";
import MongoConnectionDialog from "./components/MongoConnectionDialog.vue";
import SecondNavbar from "./components/SecondNavbar.vue";
import backendService from "./services/backend-service.js";
export default {
  name: "App",
  mounted: function () {
    if (this.$route.name != "Logout" && localStorage.getItem("token")) {
      this.bootstrapSession();
    }
  },
  methods: {
    bootstrapSession() {
      backendService
        .verifyToken()
        .then((response) => {
          localStorage.setItem("session", JSON.stringify(response.data));
          localStorage.setItem("userId", response.data.userId);
          //localStorage.setItem("token", response.data.token);
          localStorage.setItem("username", response.data.username);
          localStorage.setItem(
            "fullname",
            response.data.first + " " + response.data.last
          );
          localStorage.setItem(
            "options",
            JSON.stringify(response.data.options)
          );

          this.$store.commit("setCurrentUser", response.data);
          this.$store.dispatch("getNavigationOptions");
          this.$store.dispatch("getDropdowns");
          this.$store.dispatch("getAllDatabases");
          this.$store.dispatch("getAllGroups");
          this.$store.dispatch("getAllUsers");
          this.$store.dispatch("getDatabaseToFields");
          this.$store.dispatch("getDatabaseToChoices");
          this.$store.dispatch("getDatabaseToHeaderSets");
          this.$store.dispatch("getDatabaseToFilterSets");
          this.$store.dispatch("getDatabaseToLayoutMappings");

          return this.$store.dispatch("getDatabasesByUserId");
        })
        .then(() => {
          const database = this.resolveStartupDatabase();
          if (!database || !database.value) return;
          this.$store.commit("setCurrentDatabase", database);
          return this.loadCurrentDatabaseData(database.value);
        })
        .catch(() => {
          localStorage.clear();
        });
    },
    getStoredDatabase() {
      try {
        return JSON.parse(localStorage.getItem("currentDatabase") || "{}");
      } catch (error) {
        return {};
      }
    },
    resolveStartupDatabase() {
      const queryDatabaseValue = this.$route.query.database;
      const storedDatabase = this.getStoredDatabase();
      const databases = this.$store.getters["availableDatabases"] || [];
      return (
        databases.find((database) => database.value == queryDatabaseValue) ||
        databases.find((database) => database.value == storedDatabase.value) ||
        databases[0] ||
        {}
      );
    },
    loadCurrentDatabaseData(databaseValue) {
      return Promise.all([
        this.$store.dispatch("getFieldsByDatabase", databaseValue),
        this.$store.dispatch("getChoicesByDatabase", databaseValue),
        this.$store.dispatch("getEmptyEntryByDatabase", databaseValue),
        this.$store.dispatch("getAutomationsByDatabase", databaseValue),
        this.$store.dispatch("getUsersByDatabase", databaseValue),
        this.$store.dispatch("getLayoutByDatabase", databaseValue),
      ]);
    },
  },
  components: {
    GeneralDialog,
    GeneralSnackbar,
    MainNavbar,
    MongoConnectionDialog,
    SecondNavbar,
  },
  computed: {
    databaseToChoices() {
      return this.$store.getters["databaseToChoices"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    databaseToLayoutMappings() {
      return this.$store.getters["databaseToLayoutMappings"];
    },
    isAdmin() {
      return this.$store.getters["isAdmin"];
    },
    isMobile() {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    },
    parentName() {
      return this.$route.matched[0].name;
    },
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"];
    },
    showMongoConnectionDialog() {
      return !["Home", "Help"].includes(this.$route.name);
    },
  },
  data: () => ({
    //
  }),
};
</script>
<style>
body {
  text-size-adjust: 100%;
}
.kh {
  font-family: "Battambang", cursive;
}

.v-input:not(.v-input--selection-controls) .v-input__slot {
  border-radius: 4px !important;
}

.v-text-field--rounded > .v-input__control > .v-input__slot {
  padding: 0 12px !important;
}
</style>
