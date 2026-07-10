<template>
  <v-dialog v-model="dialog" persistent max-width="640">
    <v-card>
      <v-card-title>MongoDB Connection</v-card-title>
      <v-card-text>
        <v-alert v-if="message" :type="messageType" dense text>
          {{ message }}
        </v-alert>
        <v-text-field
          v-model="connectionString"
          label="Connection string"
          placeholder="mongodb://127.0.0.1:27017"
          :disabled="loading"
          outlined
          dense
        ></v-text-field>
        <div class="text-body-2 grey--text text--darken-1">
          Noteto will use the <strong>Noteto</strong> database automatically.
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn text :disabled="loading" @click="checkStatus">Refresh</v-btn>
        <v-btn color="secondary" :loading="testing" @click="testConnection">
          Test
        </v-btn>
        <v-btn color="primary" :loading="saving" @click="saveConnection">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import backendService from "../services/backend-service.js";

export default {
  name: "MongoConnectionDialog",
  data() {
    return {
      connectionString: "mongodb://127.0.0.1:27017",
      dialog: false,
      message: "",
      messageType: "info",
      saving: false,
      testing: false,
    };
  },
  computed: {
    loading() {
      return this.saving || this.testing;
    },
  },
  mounted() {
    this.checkStatus();
  },
  methods: {
    getConfig() {
      return {
        connectionString: this.connectionString,
      };
    },
    setMessage(type, message) {
      this.messageType = type;
      this.message = message;
    },
    checkStatus() {
      backendService
        .getDatabaseStatus()
        .then((response) => {
          const status = response.data;
          if (
            status.connectionString &&
            !status.connectionString.includes("noteto-database")
          ) {
            this.connectionString = status.connectionString;
          }
          this.dialog = !status.configured || !status.connected;
          if (this.dialog) {
            const message = status.connectionString?.includes("noteto-database")
              ? "Use mongodb://127.0.0.1:27017 when running outside Docker. The noteto-database hostname only exists inside Docker Compose."
              : "Connect Noteto to MongoDB before signing in.";
            this.setMessage("info", message);
          }
        })
        .catch(() => {
          this.dialog = false;
        });
    },
    testConnection() {
      this.testing = true;
      backendService
        .testDatabaseConnection(this.getConfig())
        .then(() => {
          this.setMessage("success", "MongoDB connection succeeded.");
        })
        .catch((error) => {
          this.setMessage(
            "error",
            error.response?.data?.message || "Unable to connect to MongoDB."
          );
        })
        .finally(() => {
          this.testing = false;
        });
    },
    saveConnection() {
      this.saving = true;
      backendService
        .saveDatabaseConnection(this.getConfig())
        .then(() => {
          this.setMessage("success", "MongoDB connection saved.");
          this.dialog = false;
        })
        .catch((error) => {
          this.setMessage(
            "error",
            error.response?.data?.message || "Unable to save MongoDB connection."
          );
        })
        .finally(() => {
          this.saving = false;
        });
    },
  },
};
</script>
