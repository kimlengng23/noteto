<template>
  <v-container fluid class="new-database-page">
    <div class="new-database-shell">
      <div class="new-database-copy">
        <div class="overline primary--text">New Workspace</div>
        <h1>Create a database</h1>
        <p>
          Start blank or choose a ready-to-use template with fields, choices,
          and layout already set up.
        </p>
      </div>

      <v-card outlined elevation="0" class="rounded-lg">
        <v-card-title>Create Database</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid" lazy-validation>
            <v-alert
              v-if="selectedTemplate"
              type="info"
              outlined
              dense
              class="mb-4"
            >
              Template: {{ selectedTemplate.title }}
            </v-alert>
            <v-text-field
              v-model="displayName"
              label="Display Name"
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
            {{ selectedTemplate ? "Create From Template" : "Create Blank" }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <div class="template-panel">
        <div class="template-panel-header">
          <div>
            <div class="overline primary--text">Templates</div>
            <h2>Start faster</h2>
          </div>
          <v-btn
            small
            text
            color="primary"
            :disabled="!selectedTemplateKey"
            @click="clearTemplate"
          >
            Clear
          </v-btn>
        </div>
        <div class="template-grid">
          <button
            v-for="template in templates"
            :key="template.key"
            type="button"
            class="template-card"
            :class="{ selected: selectedTemplateKey == template.key }"
            @click="selectTemplate(template)"
          >
            <div class="template-card-title">{{ template.title }}</div>
            <div class="template-card-copy">{{ template.description }}</div>
            <div class="template-card-meta">
              {{ template.fieldCount }} fields
            </div>
          </button>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import backendService from "@/services/backend-service";
import eventBus from "@/js/event-bus";
import formMixin from "@/js/form-mixin";

const defaultTemplates = [
  {
    key: "crm",
    title: "CRM",
    description: "Track companies, contacts, deal status, next steps, and ownership.",
    fieldCount: 7,
  },
  {
    key: "project_tracker",
    title: "Project Tracker",
    description: "Manage projects, owners, priorities, due dates, progress, and blockers.",
    fieldCount: 7,
  },
  {
    key: "inventory",
    title: "Inventory",
    description: "Track stock, suppliers, reorder levels, cost, and item location.",
    fieldCount: 7,
  },
  {
    key: "bug_tracker",
    title: "Bug Tracker",
    description: "Track software issues, severity, reproduction steps, releases, and status.",
    fieldCount: 7,
  },
  {
    key: "hiring_pipeline",
    title: "Hiring Pipeline",
    description: "Manage candidates, roles, stages, interview dates, and feedback.",
    fieldCount: 7,
  },
  {
    key: "content_calendar",
    title: "Content Calendar",
    description: "Plan content topics, channels, owners, publish dates, and status.",
    fieldCount: 7,
  },
  {
    key: "event_planning",
    title: "Event Planning",
    description: "Organize vendors, tasks, costs, due dates, and planning status.",
    fieldCount: 7,
  },
  {
    key: "help_desk",
    title: "Help Desk",
    description: "Track support tickets, requesters, priority, status, and resolution notes.",
    fieldCount: 6,
  },
  {
    key: "asset_register",
    title: "Asset Register",
    description: "Track equipment, serial numbers, assignment, warranty, and condition.",
    fieldCount: 7,
  },
  {
    key: "sales_pipeline",
    title: "Sales Pipeline",
    description: "Track opportunities, deal stage, expected close date, amount, and probability.",
    fieldCount: 7,
  },
];

export default {
  name: "NewDatabase",
  mixins: [formMixin],
  data() {
    return {
      templates: defaultTemplates,
      selectedTemplateKey: "",
    };
  },
  mounted() {
    this.getTemplates();
  },
  computed: {
    currentDatabase() {
      return this.$store.getters["currentDatabase"] || {};
    },
    selectedTemplate() {
      return this.templates.find((template) => {
        return template.key == this.selectedTemplateKey;
      });
    },
  },
  methods: {
    getTemplates() {
      backendService
        .getDatabaseTemplates()
        .then((response) => {
          this.templates =
            response.data && response.data.length > 0
              ? response.data
              : defaultTemplates;
        })
        .catch((error) => {
          console.error(error);
          this.templates = defaultTemplates;
        });
    },
    selectTemplate(template) {
      this.selectedTemplateKey = template.key;
      this.displayName = template.title;
      this.description = template.description;
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.validate();
      });
    },
    clearTemplate() {
      this.selectedTemplateKey = "";
      this.displayName = "";
      this.description = "";
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation();
      });
    },
    createDatabase() {
      if (!this.validate()) return;
      const database = {
        displayName: this.displayName,
        description: this.description,
      };
      this.isLoading = true;
      const request = this.selectedTemplateKey
        ? backendService.spawnDatabaseTemplate({
            ...database,
            templateKey: this.selectedTemplateKey,
          })
        : backendService.addDatabase(database);
      request
        .then((response) => {
          const createdDatabase = response.data.database || database;
          createdDatabase._id = response.data.insertedId || createdDatabase._id;
          this.$store.commit("addNewDatabaseToList", createdDatabase);
          this.$store.commit("setCurrentDatabase", createdDatabase);
          this.$store.dispatch("getAllDatabases");
          this.$store.dispatch("getDatabasesByUserId");
          this.$store.dispatch("getDatabaseToFields");
          this.$store.dispatch("getDatabaseToChoices");
          this.$store.dispatch("getDatabaseToLayoutMappings");
          eventBus.$emit(
            "setSnackbar",
            "Successfully created database",
            "success"
          );
          this.$router
            .push({
              name: "DatabaseSetting",
              query: { database: createdDatabase.value, section: "fields" },
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

.template-panel {
  grid-column: 1 / -1;
}

.template-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.template-panel-header h2 {
  margin: 0;
  color: #1f2933;
  font-size: 1.35rem;
  font-weight: 800;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.template-card {
  min-height: 132px;
  padding: 12px;
  border: 1px solid rgba(31, 41, 51, 0.14);
  border-radius: 6px;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
  text-align: left;
}

.template-card:hover,
.template-card.selected {
  border-color: #1565c0;
  box-shadow: inset 0 0 0 1px #1565c0;
}

.template-card-title {
  font-weight: 800;
  margin-bottom: 6px;
}

.template-card-copy {
  color: #52606d;
  font-size: 0.84rem;
  line-height: 1.35;
}

.template-card-meta {
  color: #1565c0;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 10px;
}

@media only screen and (max-width: 960px) {
  .new-database-shell {
    grid-template-columns: 1fr;
  }

  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media only screen and (max-width: 600px) {
  .new-database-page {
    padding: 14px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
