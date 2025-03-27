<template>
  <v-app>
    <main-navbar v-if="parentName != 'CustomView'"></main-navbar>
    <second-navbar
      v-if="isMobile && isLoggedIn && parentName != 'CustomView'"
    ></second-navbar>
    <v-main class="grey lighten-4">
      <router-view></router-view>
    </v-main>
    <general-dialog></general-dialog>
    <general-snackbar></general-snackbar>
  </v-app>
</template>

<script>
import GeneralDialog from "./components/GeneralDialog.vue";
import GeneralSnackbar from "./components/GeneralSnackbar.vue";
import MainNavbar from "./components/Navbar.vue";
import SecondNavbar from "./components/SecondNavbar.vue";
import backendService from "./services/backend-service.js";
export default {
  name: "App",
  mounted: function () {
    if (this.$route.name != "Logout" && localStorage.getItem("sessionId")) {
      backendService
        .verifyToken()
        .then((response) => {
          localStorage.setItem("session", JSON.stringify(response.data));
          localStorage.setItem("userId", response.data.userId);
          localStorage.setItem("sessionId", response.data.sessionId);
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
          this.$store.dispatch("getDatabasesByUserId");
          this.$store.dispatch("getNavigationOptions");
          this.$store.dispatch("getDropdowns");
          if (this.isAdmin) {
            this.$store.dispatch("getAllDatabases");
            this.$store.dispatch("getAllGroups");
            this.$store.dispatch("getAllUsers");
            this.$store.dispatch("getDatabaseToFields");
            this.$store.dispatch("getDatabaseToHeaderSets");
            this.$store.dispatch("getDatabaseToLayoutMappings");
            this.$store.dispatch("getDatabaseToChoices");
          }
          setTimeout(() => {
            let query = this.$route.query;
            let databaseValue = query.database ? query.database : null;
            let database = this.$store.getters["availableDatabases"].find(
              (e) => e.value == databaseValue
            );
            if (database) {
              this.$store.commit("setCurrentDatabase", database);
              this.$store.dispatch("getAutomationsByDatabase");
              this.$store.dispatch("getChoicesByDatabase");
              this.$store.dispatch("getEmptyEntryByDatabase");
              this.$store.dispatch("getEntriesByDatabase");
              this.$store.dispatch("getFieldsByDatabase");
              this.$store.dispatch("getHeaderSetsByDatabase");
              this.$store.dispatch("getUsersByDatabase");
              this.$store.dispatch("getLayoutByDatabase");
            }
          }, 1000);
        })
        .catch(() => {
          localStorage.clear();
        });
    }
  },
  components: {
    GeneralDialog,
    GeneralSnackbar,
    MainNavbar,
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
</style>
