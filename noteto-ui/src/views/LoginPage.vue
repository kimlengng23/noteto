<template>
  <v-container class="d-flex justify-center">
    <v-card
      class="rounded-xl"
      outlined
      elevation="0"
      min-width="350"
      width="60%"
    >
      <v-card-title>Login</v-card-title>
      <v-card-text class="py-0">
        <v-form v-model="isFormValid" ref="form">
          <v-text-field
            dense
            rounded
            outlined
            :rules="emailRules"
            label="Email"
            v-model="email"
            v-on:keyup.enter="login()"
            required
          ></v-text-field>
          <v-text-field
            dense
            rounded
            outlined
            :rules="pwRules"
            type="password"
            label="Password"
            v-model="password"
            v-on:keyup.enter="login()"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-text class="d-flex justify-end pt-0">
        <v-btn
          class="warning"
          depressed
          rounded
          @click="login"
          :disabled="!isFormValid"
          :loading="isLoading"
        >
          <i class="fas fa-sign-in-alt mr-2"></i>
          Login
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import backendService from "../services/backend-service.js";
import FormMixin from "../js/form-mixin.js";
import generalMixin from "@/js/general-mixin.js";
export default {
  name: "LoginPage",

  mixins: [FormMixin, generalMixin],
  data() {
    return {};
  },
  computed: {
    currentUser() {
      return this.$store.getters["currentUser"];
    },
    isAdmin() {
      return this.$store.getters["isAdmin"];
    },
  },
  methods: {
    login() {
      if (!this.$refs.form.validate()) {
        return;
      }
      let account = {};
      account.email = this.email;
      account.password = this.password;
      this.isLoading = true;
      backendService
        .login(account)
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
          this.$store.dispatch("getDropdowns");
          this.$store.dispatch("getNavigationOptions");
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
            let nextRouteName = "Home";
            if (localStorage.getItem("nextRouteName")) {
              nextRouteName = localStorage.getItem("nextRouteName");
              localStorage.removeItem("nextRouteName");
            }
            this.$router.push({ name: nextRouteName });
            this.isLoading = false;
          }, 1000);
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.errorSnackbar("Incorrect username or password");
            this.isLoading = false;
          });
        });
    },
  },
};
</script>
<style scoped></style>
