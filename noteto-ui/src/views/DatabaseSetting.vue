<template>
  <v-container fluid class="settings-page">
    <div class="settings-header">
      <div>
        <div class="overline primary--text">Workspace Settings</div>
        <h1>
          {{
            settingsDatabase && settingsDatabase.displayName
              ? settingsDatabase.displayName
              : "Settings"
          }}
        </h1>
        <div
          v-if="settingsDatabase && settingsDatabase.displayName"
          class="settings-subtitle"
        >
          {{ settingsDatabase.value }}
        </div>
      </div>
      <div class="settings-actions">
        <v-btn
          color="primary"
          depressed
          :to="{ name: 'NewDatabase' }"
        >
          <v-icon left>mdi-database-plus</v-icon>
          New Database
        </v-btn>
      </div>
    </div>

    <div class="settings-summary">
      <div
        v-for="item in summaryItems"
        :key="item.label"
        class="summary-item"
      >
        <div class="summary-icon">
          <v-icon>{{ item.icon }}</v-icon>
        </div>
        <div>
          <div class="summary-value">{{ item.value }}</div>
          <div class="summary-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <v-tabs
      v-model="tab"
      class="settings-tabs"
      background-color="transparent"
      show-arrows
      @change="updateSectionQuery"
    >
      <v-tab
        v-for="section in sections"
        :key="section.key"
      >
        <v-icon left>{{ section.icon }}</v-icon>
        {{ section.title }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" class="settings-content">
      <v-tab-item>
        <field-section v-if="settingsReady" :key="settingsDatabaseValue"></field-section>
      </v-tab-item>
      <v-tab-item>
        <form-layout v-if="settingsReady" :key="settingsDatabaseValue"></form-layout>
      </v-tab-item>
      <v-tab-item>
        <database-access v-if="settingsReady" :key="settingsDatabaseValue"></database-access>
      </v-tab-item>
      <v-tab-item>
        <user-group v-if="settingsReady" :key="settingsDatabaseValue"></user-group>
      </v-tab-item>
      <v-tab-item>
        <automation-section v-if="settingsReady" :key="settingsDatabaseValue"></automation-section>
      </v-tab-item>
      <v-tab-item>
        <div v-if="settingsReady && settingsDatabaseValue" class="danger-zone">
          <div>
            <div class="danger-title">Danger Zone</div>
            <div class="danger-copy">
              Drop this database and permanently remove its records, fields, choices,
              layout, list settings, filters, access, automations, comments, and
              history.
            </div>
          </div>
          <v-btn color="error" outlined depressed @click="openDropDatabaseDialog">
            <v-icon left>mdi-database-remove</v-icon>
            Drop Database
          </v-btn>
        </div>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="dropDatabaseDialog" max-width="560">
      <v-card>
        <v-card-title>Drop database?</v-card-title>
        <v-card-text>
          <v-alert type="error" outlined dense>
            This permanently removes the selected database and everything tied
            to it. This cannot be undone from Noteto.
          </v-alert>
          <p class="mb-3">
            Type <strong>{{ settingsDatabaseValue }}</strong> to confirm.
          </p>
          <v-text-field
            outlined
            dense
            label="Database name"
            v-model="dropDatabaseConfirmation"
            :disabled="isDroppingDatabase"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDropDatabaseDialog" :disabled="isDroppingDatabase">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            depressed
            @click="dropDatabase"
            :disabled="!canDropDatabase"
            :loading="isDroppingDatabase"
          >
            <v-icon left>mdi-delete-forever</v-icon>
            Drop Database
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import backendService from "@/services/backend-service.js";
import eventBus from "@/js/event-bus.js";
import AutomationSection from "@/components/AutomationSection.vue";
import FieldSection from "@/components/FieldSection.vue";
import DatabaseAccess from "@/components/DatabaseAccess.vue";
import UserGroup from "@/components/UserGroup.vue";
import FormLayout from "@/components/FormLayout.vue";

export default {
  name: "DatabaseSetting",
  data() {
    return {
      tab: 0,
      settingsReady: false,
      dropDatabaseDialog: false,
      dropDatabaseConfirmation: "",
      isDroppingDatabase: false,
      sections: [
        {
          key: "fields",
          title: "Fields",
          icon: "mdi-format-list-bulleted",
        },
        {
          key: "layout",
          title: "Layout",
          icon: "mdi-view-column",
        },
        {
          key: "access",
          title: "Access",
          icon: "mdi-account-check",
        },
        {
          key: "groups",
          title: "Groups",
          icon: "mdi-account-group",
        },
        {
          key: "automation",
          title: "Automation",
          icon: "mdi-lightning-bolt",
        },
        {
          key: "danger",
          title: "Danger Zone",
          icon: "mdi-alert-octagon",
        },
      ],
    };
  },
  computed: {
    allDatabases() {
      return this.$store.getters["allDatabases"] || [];
    },
    availableDatabases() {
      return this.$store.getters["availableDatabases"] || [];
    },
    databases() {
      const databaseByValue = {};
      this.availableDatabases.concat(this.allDatabases).forEach((database) => {
        if (database && database.value) databaseByValue[database.value] = database;
      });
      return Object.values(databaseByValue).sort((a, b) => {
        return String(a.displayName || a.value).localeCompare(
          String(b.displayName || b.value)
        );
      });
    },
    allGroups() {
      return this.$store.getters["allGroups"] || [];
    },
    allUsers() {
      return this.$store.getters["allUsers"] || [];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"] || {};
    },
    fieldCount() {
      return Object.values(this.databaseToFields).reduce((count, fields) => {
        return count + (fields ? fields.length : 0);
      }, 0);
    },
    summaryItems() {
      return [
        {
          label: "Fields",
          value: this.fieldCount,
          icon: "mdi-format-list-bulleted",
        },
        {
          label: "Users",
          value: this.allUsers.length,
          icon: "mdi-account",
        },
        {
          label: "Groups",
          value: this.allGroups.length,
          icon: "mdi-account-group",
        },
      ];
    },
    settingsDatabase() {
      return this.$store.getters["currentDatabase"] || {};
    },
    settingsDatabaseValue() {
      return this.settingsDatabase && this.settingsDatabase.value
        ? this.settingsDatabase.value
        : "";
    },
    canDropDatabase() {
      return (
        this.settingsDatabaseValue &&
        this.dropDatabaseConfirmation.trim() == this.settingsDatabaseValue
      );
    },
  },
  methods: {
    findDatabase(databaseValue) {
      if (!databaseValue) return null;
      return this.databases.find((database) => database.value == databaseValue);
    },
    openDropDatabaseDialog() {
      this.dropDatabaseConfirmation = "";
      this.dropDatabaseDialog = true;
    },
    closeDropDatabaseDialog() {
      this.dropDatabaseDialog = false;
      this.dropDatabaseConfirmation = "";
      this.isDroppingDatabase = false;
    },
    dropDatabase() {
      if (!this.canDropDatabase) return;
      const databaseValue = this.settingsDatabaseValue;
      this.isDroppingDatabase = true;
      backendService
        .dropDatabase(databaseValue)
        .then(() => {
          this.$store.commit("removeDatabase", databaseValue);
          const nextDatabase = this.databases.find((database) => {
            return database.value != databaseValue;
          });
          this.closeDropDatabaseDialog();
          eventBus.$emit("setSnackbar", "Database dropped", "success");
          if (nextDatabase) {
            this.setSettingsDatabase(nextDatabase);
            this.$router
              .replace({
                query: {
                  database: nextDatabase.value,
                  section: this.sections[this.tab].key,
                },
              })
              .catch(() => {});
          } else {
            this.$router.push({ name: "NewDatabase" }).catch(() => {});
          }
        })
        .catch((err) => {
          const message =
            err.response && err.response.data
              ? err.response.data
              : "Could not drop database";
          eventBus.$emit("setSnackbar", message, "error");
          this.isDroppingDatabase = false;
        });
    },
    setSettingsDatabase(database) {
      this.settingsReady = false;
      this.$store.commit("setCurrentDatabase", database);
      this.$store.dispatch("getFieldsByDatabase", database.value);
      this.$store.dispatch("getChoicesByDatabase", database.value);
      this.$store.dispatch("getLayoutByDatabase", database.value);
      this.$store.dispatch("getUsersByDatabase");
      this.$store.dispatch("getAutomationsByDatabase");
      this.$nextTick(() => {
        this.settingsReady = true;
      });
    },
    syncSettingsDatabase() {
      if (this.databases.length == 0) {
        this.settingsReady = true;
        return;
      }
      let database =
        this.findDatabase(this.$route.query.database) ||
        this.findDatabase(this.settingsDatabaseValue) ||
        this.databases[0];
      if (!database) return;
      if (database.value != this.settingsDatabaseValue) {
        this.setSettingsDatabase(database);
      } else {
        this.settingsReady = true;
      }
      if (this.$route.query.database != database.value) {
        this.$router
          .replace({
            query: {
              ...this.$route.query,
              database: database.value,
            },
          })
          .catch(() => {});
      }
    },
    updateSectionQuery() {
      const section = this.sections[this.tab];
      if (!section || this.$route.query.section == section.key) return;
      this.$router
        .replace({
          query: {
            ...this.$route.query,
            section: section.key,
          },
        })
        .catch(() => {});
    },
  },
  mounted() {
    this.$store.dispatch("getAllDatabases");
    this.$store.dispatch("getDatabasesByUserId");
    this.syncSettingsDatabase();
    if (this.$route.query.section) {
      const sectionIndex = this.sections.findIndex(
        (section) => section.key == this.$route.query.section
      );
      if (sectionIndex >= 0) this.tab = sectionIndex;
    }
  },
  watch: {
    "$route.query.database": function () {
      this.syncSettingsDatabase();
    },
    databases: function () {
      this.syncSettingsDatabase();
    },
  },
  components: {
    "automation-section": AutomationSection,
    "field-section": FieldSection,
    "database-access": DatabaseAccess,
    "user-group": UserGroup,
    "form-layout": FormLayout,
  },
};
</script>

<style scoped>
.settings-page {
  padding: 24px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.settings-header h1 {
  margin: 0;
  color: #1f2933;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  font-weight: 800;
  line-height: 1.1;
}

.settings-subtitle {
  color: #627d98;
  margin-top: 6px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.settings-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 86px;
  padding: 18px;
  border: 1px solid rgba(31, 41, 51, 0.08);
  border-radius: 12px;
  background: #ffffff;
}

.summary-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #1565c0;
  background: #e3f2fd;
}

.summary-value {
  color: #1f2933;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1;
}

.summary-label {
  color: #627d98;
  font-size: 0.9rem;
}

.settings-tabs {
  border-bottom: 1px solid rgba(31, 41, 51, 0.08);
}

.settings-content {
  padding-top: 18px;
  background: transparent;
}

.danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding: 18px;
  border: 1px solid rgba(211, 47, 47, 0.28);
  background: #fffafa;
}

.danger-title {
  color: #b71c1c;
  font-weight: 800;
  margin-bottom: 4px;
}

.danger-copy {
  color: #52606d;
  max-width: 760px;
}

@media only screen and (max-width: 960px) {
  .settings-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media only screen and (max-width: 600px) {
  .settings-page {
    padding: 14px;
  }

  .settings-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .settings-actions {
    width: 100%;
    justify-content: stretch;
  }

  .settings-actions .v-btn {
    width: 100%;
  }

  .settings-summary {
    grid-template-columns: 1fr;
  }

  .danger-zone {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
