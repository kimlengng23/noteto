<template>
  <v-container fluid class="new-database-page">
    <div class="new-database-shell">
      <div class="new-database-copy">
        <div class="overline primary--text">New Workspace</div>
        <h1>Create a bare database</h1>
        <p>
          Start with only the system field Noteto needs. You can add fields,
          layout, access, groups, and automation from Settings afterward.
        </p>
      </div>

      <v-card outlined elevation="0" class="rounded-lg">
        <v-card-title>Create Database</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid" lazy-validation>
            <v-text-field
              v-model="displayName"
              label="Display Name"
              :rules="strRules"
              outlined
              dense
              required
            ></v-text-field>
            <v-text-field
              v-model="value"
              label="Value"
              :rules="strRules"
              outlined
              dense
              required
            ></v-text-field>
            <v-textarea
              v-model="description"
              label="Description"
              outlined
              dense
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn
            depressed
            outlined
            :to="
              currentDatabase && currentDatabase.value
                ? {
                    name: 'DatabaseSetting',
                    query: { database: currentDatabase.value },
                  }
                : { name: 'Home' }
            "
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            :disabled="!isFormValid"
            :loading="isLoading"
            @click="createDatabase"
          >
            <v-icon left>mdi-database-plus</v-icon>
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import _ from "lodash";
import backendService from "@/services/backend-service";
import eventBus from "@/js/event-bus";
import formMixin from "@/js/form-mixin";

export default {
  name: "NewDatabase",
  mixins: [formMixin],
  computed: {
    currentDatabase() {
      return this.$store.getters["currentDatabase"] || {};
    },
  },
  methods: {
    createDatabase() {
      if (!this.validate()) return;
      const database = {
        displayName: this.displayName,
        value: this.value,
        description: this.description,
      };
      this.isLoading = true;
      backendService
        .addDatabase(database)
        .then((response) => {
          database._id = response.data.insertedId;
          database.groups = [];
          database.isActive = true;
          this.$store.commit("addNewDatabaseToList", database);
          this.$store.commit("setCurrentDatabase", database);
          this.$store.dispatch("getAllDatabases");
          this.$store.dispatch("getDatabasesByUserId");
          this.$store.dispatch("getDatabaseToFields");
          eventBus.$emit(
            "setSnackbar",
            "Successfully created a bare database",
            "success"
          );
          this.$router
            .push({
              name: "DatabaseSetting",
              query: { database: database.value, section: "fields" },
            })
            .catch(() => {});
        })
        .catch((error) => {
          console.error(error);
          eventBus.$emit("setSnackbar", "Could not create database", "error");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
  watch: {
    displayName: function (newValue, oldValue) {
      const previousValue = _.camelCase(oldValue || "");
      if (!this.value || this.value == previousValue) {
        this.value = _.camelCase(newValue);
      }
    },
  },
};
</script>

<style scoped>
.new-database-page {
  padding: 24px;
}

.new-database-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 520px);
  gap: 24px;
  align-items: start;
  max-width: 1120px;
  margin: 0 auto;
}

.new-database-copy h1 {
  margin: 0;
  color: #1f2933;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.1;
}

.new-database-copy p {
  color: #627d98;
  margin-top: 12px;
  max-width: 560px;
}

@media only screen and (max-width: 960px) {
  .new-database-shell {
    grid-template-columns: 1fr;
  }
}

@media only screen and (max-width: 600px) {
  .new-database-page {
    padding: 14px;
  }
}
</style>
