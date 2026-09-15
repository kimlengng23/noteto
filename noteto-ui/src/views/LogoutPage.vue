<template>
  <div>
    <v-card>
      <v-card-title
        ><v-progress-circular
          indeterminate
          color="primary"
          class="mr-1"
        ></v-progress-circular>
        You are being logged out...
      </v-card-title>
    </v-card>
  </div>
</template>
<script>
import backendService from "@/services/backend-service";

export default {
  name: "LogoutPage",
  data() {
    return {
      isLoading: false,
    };
  },
  mounted: function () {
    this.logout();
  },
  methods: {
    clearSession() {
      localStorage.removeItem("fullname");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("session");
      localStorage.removeItem("currentDatabase");
      localStorage.removeItem("options");
      localStorage.removeItem("nextRouteName");
      this.$store.commit("setCurrentUser", {});
      this.$store.commit("setCurrentDatabase", {});
    },
    goToDatabaseConnection() {
      this.$router.replace({ name: "Home" }).catch(() => {});
    },
    logout() {
      const logoutRequest = localStorage.getItem("token")
        ? backendService.logout().catch(() => {})
        : Promise.resolve();

      logoutRequest.finally(() => {
        this.clearSession();
        // this.$store.commit("setCurrentDatabase", {});
        // this.$store.commit("setAutomations", []);
        // this.$store.commit("setCurrentUser", {});
        // this.$store.commit("setNavigationOptions", []);
        // this.$store.commit("setAllGroups", []);
        // this.$store.commit("setAllDatabases", []);
        // this.$store.commit("setAvailableDatabases", []);
        setTimeout(() => {
          this.goToDatabaseConnection();
        }, 1000);
      });
    },
  },
};
</script>
