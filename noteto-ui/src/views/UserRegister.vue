<template>
  <div class="d-flex justify-center">
    <v-card class="mt-5" outlined elevation="0" min-width="350" width="60%">
      <v-card-title>Register User</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-text-field
            :rules="nameRules"
            v-model="first"
            label="First Name"
            required
          ></v-text-field>
          <v-text-field
            :rules="nameRules"
            v-model="last"
            label="Last Name"
            required
          ></v-text-field>

          <v-text-field
            :rules="emailRules"
            v-model="email"
            label="Email"
            required
          ></v-text-field>
          <v-text-field
            :rules="pwRules"
            type="password"
            v-model="password"
            label="Password"
            required
          ></v-text-field>
          <v-text-field
            :rules="confRules"
            type="password"
            v-model="confPassword"
            label="Confirm Password"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn depressed rounded color="warning" @click="clear">
          <i class="fas fa-times mr-2"></i>Clear
        </v-btn>
        <v-btn
          depressed
          rounded
          color="success"
          @click="register"
          :disabled="!isFormValid"
          :loading="isLoading"
        >
          <i class="fas fa-cash-register mr-2"></i>Register
        </v-btn>
      </v-card-actions>
    </v-card>
    <general-snackbar></general-snackbar>
  </div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import FormMixin from "../js/form-mixin.js";
import GeneralSnackbar from "../components/GeneralSnackBar.vue";
import backendService from "../services/backend-service.js";
export default {
  name: "RegisterUser",
  mixins: [FormMixin],
  components: {
    GeneralSnackbar,
  },

  data() {
    return {
      isFormValid: false,
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters["currentUser"];
    },
  },
  created: () => {},
  methods: {
    clear() {
      this.clearVariables();
      this.$refs.form.resetValidation();
    },
    register() {
      if (!this.$refs.form.validate()) {
        return;
      }
      let account = {};
      account.first = this.first;
      account.last = this.last;
      account.email = this.email;
      account.username = this.email;
      account.password = this.password;
      this.isLoading = true;
      backendService
        .registerUser(account)
        .then(() => {
          setTimeout(() => {
            eventBus.$emit(
              "setSnackbar",
              "User Successfully Register",
              "success",
              true
            );
            this.clear();
            this.isLoading = false;
          }, 1000);
        })
        .catch(() => {
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
  },
};
</script>
<style scoped></style>
