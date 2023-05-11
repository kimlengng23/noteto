<template>
  <v-app>
    <main-navbar></main-navbar>
    <second-navbar v-if="isMobile"></second-navbar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
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
          this.$store.commit("setCurrentUser", response.data);

          this.$store.dispatch("getAllUsers");
          this.$store.dispatch("getAllGroups");
          this.$store.dispatch("getAllDatabases");
          this.$store.dispatch("getNavigationOptions");
          this.$store.dispatch("getDatabasesByUserId");
          this.$store.dispatch("getDatabaseToFields");
          this.$store.dispatch("getDatabaseToHeaders");
          this.$store.dispatch("getDatabaseToLayoutMappings");
          this.$store.dispatch("getDatabaseToChoices");
          this.$store.dispatch("getDropdowns");
          setTimeout(() => {
            if (localStorage.getItem("currentDatabase")) {
              let database = JSON.parse(
                localStorage.getItem("currentDatabase")
              );
              this.$store.commit("setCurrentDatabase", database);
              this.$store.dispatch("getAutomations");
              this.$store.dispatch("getEntriesByDatabase");
              this.$store.dispatch("getHeaders");
              this.$store.dispatch("getDatabaseUsers");
            }
          }, 1000);
        })
        .catch(() => {
          this.$router.push({ name: "Logout" }).catch(() => {});
        });
    }
  },
  components: {
    MainNavbar,
    SecondNavbar,
  },
  computed: {
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
  },
  data: () => ({
    //
  }),
};
</script>
<style>
h1,
h2,
h3,
h4,
h5,
h6,
div {
  font-family: "Montserrat", sans-serif;
}
</style>
