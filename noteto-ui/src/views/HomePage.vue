<template>
  <div class="home-page montserrat">
    <section class="connect-section">
      <v-container class="connect-container">
        <v-row align="center" class="connect-row">
          <v-col cols="12" lg="7">
            <div class="connect-copy fade-up">
              <div class="overline primary--text mb-3">MongoDB setup</div>
              <h1>Connect Noteto to a MongoDB server.</h1>
              <p>
                Start with a local MongoDB instance, a Docker-hosted database,
                or a MongoDB Atlas connection string. Noteto uses the selected
                server to store users, databases, fields, records, and history
                through the backend API.
              </p>
              <div class="quick-instructions">
                <div
                  v-for="step in instructions"
                  :key="step.title"
                  class="instruction-item">
                  <v-icon color="primary">{{ step.icon }}</v-icon>
                  <div>
                    <strong>{{ step.title }}</strong>
                    <span>{{ step.text }}</span>
                  </div>
                </div>
              </div>
              <div class="copy-actions">
                <v-btn
                  color="primary"
                  text
                  class="px-0"
                  :to="{ name: 'Help' }">
                  <v-icon left>mdi-help-circle-outline</v-icon>
                  Help
                </v-btn>
              </div>
            </div>
          </v-col>

          <v-col cols="12" lg="5">
            <v-card class="connection-card fade-up delay-2" elevation="0">
              <v-card-title class="connection-title">
                <v-icon color="primary" left>mdi-database-cog</v-icon>
                MongoDB connection
              </v-card-title>
              <v-card-text>
                <v-alert v-if="message" :type="messageType" dense text>
                  {{ message }}
                </v-alert>

                <v-text-field
                  v-model="connectionName"
                  label="Connection name"
                  placeholder="Local MongoDB"
                  :disabled="loading"
                  outlined
                  dense></v-text-field>

                <v-text-field
                  v-model="connectionString"
                  label="Connection string"
                  placeholder="mongodb://127.0.0.1:27017"
                  :disabled="loading"
                  outlined
                  dense></v-text-field>

                <v-text-field
                  v-model="databaseName"
                  label="Database name"
                  placeholder="Noteto"
                  :disabled="loading"
                  outlined
                  dense></v-text-field>

                <div class="form-note">
                  This saves the backend API's active MongoDB connection. Saved
                  presets below are only shortcuts in this browser; a
                  SQLite-backed connection library can move presets server-side
                  later.
                </div>
              </v-card-text>
              <v-card-actions class="connection-actions">
                <v-btn text :disabled="loading" @click="checkStatus">
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="secondary"
                  :loading="testing"
                  depressed
                  @click="testConnection">
                  <v-icon left>mdi-lan-check</v-icon>
                  Test
                </v-btn>
                <v-btn
                  color="primary"
                  :loading="saving"
                  depressed
                  @click="saveConnection">
                  <v-icon left>mdi-content-save</v-icon>
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>

            <div v-if="savedConnections.length" class="saved-list fade-up">
              <div class="saved-list-header">
                <h2>Saved presets</h2>
                <v-btn icon small @click="clearSavedConnections">
                  <v-icon small>mdi-delete-sweep</v-icon>
                </v-btn>
              </div>
              <button
                v-for="connection in savedConnections"
                :key="connection.id"
                class="saved-connection"
                type="button"
                :disabled="loading"
                @click="selectConnection(connection)">
                <v-icon color="primary">mdi-server</v-icon>
                <span>
                  <strong>{{ connection.name }}</strong>
                  <small>{{ connection.connectionString }}</small>
                </span>
              </button>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script>
import backendService from "../services/backend-service.js";

const savedConnectionsKey = "notetoMongoConnections";

export default {
  name: "HomePage",
  data() {
    return {
      connectionName: "Local MongoDB",
      connectionString: "mongodb://127.0.0.1:27017",
      databaseName: "Noteto",
      instructions: [
        {
          icon: "mdi-database-search",
          title: "Choose a server",
          text: "Use a local MongoDB URI, Docker host, or Atlas URI.",
        },
        {
          icon: "mdi-lan-check",
          title: "Test first",
          text: "Confirm Noteto can ping the database before saving.",
        },
        {
          icon: "mdi-account-plus",
          title: "Create users",
          text: "After connecting, continue into account setup and start building databases.",
        },
      ],
      message: "",
      messageType: "info",
      isConnected: false,
      savedConnections: [],
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
    this.loadSavedConnections();
    this.checkStatus();
  },
  methods: {
    getConfig() {
      return {
        connectionString: this.connectionString,
        databaseName: this.databaseName || "Noteto",
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
          if (status.connectionString && !status.connectionString.includes("***")) {
            this.connectionString = status.connectionString;
          }
          if (status.databaseName) {
            this.databaseName = status.databaseName;
          }
          const sourceText =
            status.source == "runtime"
              ? " Saved from the setup form."
              : status.source == "environment"
              ? " Set by backend environment."
              : "";
          const statusText = status.connected
            ? "Noteto is connected to MongoDB."
            : "Noteto is not connected yet.";
          this.isConnected = status.connected;
          this.setMessage(
            status.connected ? "success" : "info",
            `${statusText}${sourceText}`
          );
        })
        .catch(() => {
          this.isConnected = false;
          this.setMessage(
            "warning",
            "The API is not reachable yet. Make sure noteto-api is running."
          );
        });
    },
    loadSavedConnections() {
      try {
        this.savedConnections = JSON.parse(
          localStorage.getItem(savedConnectionsKey) || "[]"
        );
      } catch (error) {
        console.log(error);
        this.savedConnections = [];
      }
    },
    persistSavedConnections() {
      localStorage.setItem(
        savedConnectionsKey,
        JSON.stringify(this.savedConnections)
      );
    },
    rememberConnection() {
      const name = this.connectionName || "MongoDB server";
      const connectionString = this.connectionString;
      const databaseName = this.databaseName || "Noteto";
      const id = `${connectionString}|${databaseName}`;
      const nextConnection = {
        id,
        name,
        connectionString,
        databaseName,
      };
      this.savedConnections = [
        nextConnection,
        ...this.savedConnections.filter((connection) => connection.id != id),
      ].slice(0, 6);
      this.persistSavedConnections();
    },
    selectConnection(connection) {
      this.connectionName = connection.name;
      this.connectionString = connection.connectionString;
      this.databaseName = connection.databaseName || "Noteto";
      this.saving = true;
      this.setMessage("info", "Connecting to saved preset.");
      backendService
        .saveDatabaseConnection(this.getConfig())
        .then(() => {
          this.isConnected = true;
          this.rememberConnection();
          this.$router.push({ name: "Login" }).catch(() => {});
        })
        .catch((error) => {
          this.setMessage(
            "error",
            error.response?.data?.message || "Unable to connect to saved preset."
          );
        })
        .finally(() => {
          this.saving = false;
        });
    },
    clearSavedConnections() {
      this.savedConnections = [];
      localStorage.removeItem(savedConnectionsKey);
    },
    testConnection() {
      this.testing = true;
      backendService
        .testDatabaseConnection(this.getConfig())
        .then(() => {
          this.setMessage("success", "MongoDB connection succeeded.");
          this.rememberConnection();
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
          this.isConnected = true;
          this.rememberConnection();
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

<style scoped>
.home-page {
  min-height: 100%;
  background: #f6f8fb;
  color: #1f2933;
}

.montserrat {
  font-family: "Montserrat", sans-serif !important;
  line-height: 1.5;
}

.connect-section {
  min-height: calc(100vh - 1px);
  background:
    linear-gradient(135deg, rgba(21, 101, 192, 0.08), transparent 42%),
    linear-gradient(315deg, rgba(0, 150, 136, 0.08), transparent 38%),
    #ffffff;
}

.connect-container {
  min-height: calc(100vh - 1px);
  display: flex;
  align-items: center;
  padding-top: 92px;
  padding-bottom: 48px;
}

.connect-row {
  width: 100%;
}

.connect-copy {
  max-width: 720px;
}

.connect-copy h1 {
  color: #102a43;
  font-size: clamp(2.4rem, 5vw, 4.6rem);
  font-weight: 800;
  line-height: 1.02;
  margin: 0 0 22px;
}

.connect-copy p {
  color: #486581;
  font-size: 1.18rem;
  max-width: 650px;
}

.quick-instructions {
  display: grid;
  gap: 14px;
  margin: 34px 0 20px;
  max-width: 650px;
}

.instruction-item {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 14px;
  align-items: start;
  padding: 14px 0;
  border-top: 1px solid rgba(31, 41, 51, 0.1);
}

.instruction-item strong {
  display: block;
  color: #243b53;
  font-size: 1rem;
}

.instruction-item span {
  color: #52616f;
}

.copy-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.connection-card {
  border: 1px solid rgba(31, 41, 51, 0.1);
  border-radius: 8px;
  box-shadow: 0 22px 60px rgba(31, 41, 51, 0.1) !important;
}

.connection-title {
  color: #102a43;
  font-weight: 800;
  padding-bottom: 8px;
}

.form-note {
  color: #52616f;
  font-size: 0.88rem;
}

.connection-actions {
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 18px;
}

.saved-list {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid rgba(31, 41, 51, 0.1);
  border-radius: 8px;
  background: #f8fafc;
}

.saved-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.saved-list-header h2 {
  color: #243b53;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.saved-connection {
  width: 100%;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  border: 0;
  border-top: 1px solid rgba(31, 41, 51, 0.08);
  background: transparent;
  color: #243b53;
  cursor: pointer;
  text-align: left;
}

.saved-connection strong,
.saved-connection small {
  display: block;
}

.saved-connection small {
  overflow: hidden;
  color: #66788a;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fade-up {
  animation: fade-up 520ms ease both;
}

.delay-2 {
  animation-delay: 160ms;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up {
    animation: none;
  }
}

@media only screen and (max-width: 600px) {
  .connect-container {
    padding-top: 86px;
  }

  .connect-copy h1 {
    font-size: 2.35rem;
  }

  .connection-actions {
    justify-content: stretch;
  }

  .connection-actions .v-btn {
    flex: 1 1 auto;
  }
}
</style>
