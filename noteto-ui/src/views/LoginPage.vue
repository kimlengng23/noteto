<template>
  <div class="d-flex justify-center">
    <v-card class="mt-5" elevation="1" min-width="600">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form v-model="isFormValid" ref="form">
          <v-text-field
            :rules="emailRules"
            label="Email"
            v-model="email"
            v-on:keyup.enter="login()"
            required
          ></v-text-field>
          <v-text-field
            :rules="pwRules"
            type="password"
            label="Password"
            v-model="password"
            v-on:keyup.enter="login()"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          class="warning"
          depressed
          rounded
          @click="login"
          :disabled="!isFormValid"
          :loading="isLoading"
          ><i class="fas fa-sign-in-alt mr-2"></i>Login</v-btn
        >
      </v-card-actions>
    </v-card>
    <general-snackbar></general-snackbar>
  </div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import GeneralSnackbar from "../components/GeneralSnackBar.vue";
import backendService from "../services/backend-service.js";
import FormMixin from "../js/form-mixin.js";
export default {
  name: "LoginPage",
  components: {
    GeneralSnackbar,
  },
  mixins: [FormMixin],
  data() {
    return {};
  },
  computed: {
    currentUser() {
      return this.$store.getters["currentUser"];
    },
  },
  created: () => {},
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
          this.$store.commit("setCurrentUser", response.data);
          this.$store.dispatch("getAllDatabases");
          this.$store.dispatch("getAllUsers");
          this.$store.dispatch("getAllGroups");
          this.$store.dispatch("getNavigationOptions");
          this.$store.dispatch("getDatabasesByUserId");
          this.$store.dispatch("getDatabaseToFields");
          this.$store.dispatch("getDatabaseToHeaders");
          this.$store.dispatch("getDatabaseToLayoutMappings");
          this.$store.dispatch("getDatabaseToChoices");
          this.$store.dispatch("getDropdowns");
          setTimeout(() => {
            this.$router.push({ name: "Home" });
            this.isLoading = false;
          }, 1000);
        })
        .catch(() => {
          setTimeout(() => {
            eventBus.$emit(
              "setSnackbar",
              "Incorrect Username or Password",
              "red darken-1 white--text",
              true
            );
            this.isLoading = false;
          }, 1000);
        });
    },
  },
};
</script>
<style scoped></style>
