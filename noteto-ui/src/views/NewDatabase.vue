<template>
  <v-container fluid class="d-flex justify-center">
    <v-card class="rounded-xl" elevation="0" min-width="350" width="60%">
      <v-card-title class="d-flex justify-space-between">
        <h3>New Database</h3>
        <v-btn
          rounded
          color="primary ml-2"
          depressed
          @click="addDatabase"
          :disabled="!isLoggedIn"
          :loading="isLoading"
        >
          <i class="fas fa-save mr-1"></i>
          Submit
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" lazy-validation>
          <v-text-field
            rounded
            outlined
            dense
            label="Display Name"
            v-model="displayName"
            :rules="strRules"
            required
          ></v-text-field>
          <v-text-field
            rounded
            outlined
            dense
            label="Value Name"
            v-model="value"
            :rules="strRules"
            required
          ></v-text-field>
          <v-textarea
            rounded
            outlined
            dense
            label="Description"
            v-model="description"
            :rules="strRules"
            required
          ></v-textarea>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service";
import mixin from "../js/mixin.js";
import formMixin from "@/js/form-mixin";
export default {
  name: "NewDatabase",

  mixins: [mixin, formMixin],
  data() {
    return {};
  },
  computed: {
    isEmpty() {
      return (
        this.displayName.length == 0 ||
        this.value.length == 0 ||
        this.description.length == 0
      );
    },
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"];
    },
  },
  methods: {
    addDatabase() {
      if (!this.validate()) {
        return;
      }
      let database = {};
      database.displayName = this.displayName;
      database.value = this.value;
      database.description = this.description;
      this.isLoading = true;
      backendService.addDatabase(database).then((response) => {
        database._id = response.data.insertedId;
        this.$store.commit("addNewDatabaseToList", database);
        this.$store.dispatch("getDatabaseToFields");
        this.$store.dispatch("getDatabaseToHeaderSets");
        this.$store.dispatch("getDatabaseToChoices");
        setTimeout(() => {
          this.displayName = "";
          this.value = "";
          this.description = "";
          this.resetValidation();
          eventBus.$emit(
            "setSnackbar",
            "Successfully added a new database",
            "success"
          );
          this.isLoading = false;
        }, 1000);
      });
    },
  },
};
</script>
