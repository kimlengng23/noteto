<template>
  <div>
    <v-card>
      <v-card-title
        ><v-progress-circular
          indeterminate
          color="primary"
          class="mr-2"
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
  created: function () {
    this.logout();
  },
  methods: {
    logout() {
      if (!localStorage.getItem("sessionId")) {
        this.$router.push({ name: "HomePage" }).catch(() => {});
        return;
      }
      backendService.logout().then(() => {
        localStorage.removeItem("fullname");
        localStorage.removeItem("username");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("userId");
        localStorage.removeItem("session");
        localStorage.removeItem("currentDatabase");
        this.$store.commit("setCurrentDatabase", {});
        this.$store.commit("setAutomations", []);
        this.$store.commit("setCurrentUser", {});
        this.$store.commit("setNavigationOptions", []);
        this.$store.commit("setAllGroups", []);
        this.$store.commit("setAllDatabases", []);
        this.$store.commit("setAvailableDatabases", []);
        setTimeout(() => {
          this.$router.push({ name: "HomePage" }).catch(() => {});
        }, 1000);
      });
    },
  },
};
</script>
