<template>
  <v-card class="rounded-lg" elevation="0" outlined>
    <v-card-title class="list-panel-title">
      <div>
        <div>Columns</div>
        <small>Choose which fields appear in the records table.</small>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div class="list-toolbar">
        <v-autocomplete
          dense
          outlined
          label="Column Set"
          :items="headerSets"
          :item-text="getHeaderSetText"
          v-model="headerSet"
          return-object
          @change="handleChange"
        ></v-autocomplete>
        <v-btn
          depressed
          color="success"
          @click="setFavoriteHeaderSet"
          :loading="isUpdateLoading"
          :disabled="!validHeaderSet"
        >
          <v-icon left>mdi-star-outline</v-icon>
          Favorite
        </v-btn>
        <v-btn
          icon
          color="primary"
          :disabled="!validHeaderSet"
          @click="openForm(true)"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-btn icon color="primary" @click="openForm(false)">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-if="isFormOpen">
          <div class="column-form-grid">
            <v-text-field
              dense
              outlined
              label="Column Set Name"
              v-model="headerSet.name"
            ></v-text-field>
            <v-autocomplete
              outlined
              dense
              :items="[
                { text: 'Yes', value: true },
                { text: 'No', value: false },
              ]"
              label="Public"
              v-model="headerSet.isPublic"
            ></v-autocomplete>
          </div>

          <div class="column-picker">
            <div class="column-list">
              <div
                v-for="(column, index) in workingColumns"
                :key="column.value"
                class="column-list-row"
                :class="{ 'column-list-row--inactive': !column.isActive }"
              >
                <v-checkbox
                  v-model="column.isActive"
                  dense
                  hide-details
                  :label="column.displayName"
                ></v-checkbox>
                <div class="column-list-meta">{{ column.value }}</div>
                <div class="column-list-actions">
                  <v-btn
                    icon
                    small
                    :disabled="index === 0"
                    @click="moveColumn(index, -1)"
                  >
                    <v-icon small>mdi-arrow-up</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    :disabled="index === workingColumns.length - 1"
                    @click="moveColumn(index, 1)"
                  >
                    <v-icon small>mdi-arrow-down</v-icon>
                  </v-btn>
                </div>
              </div>
              <v-alert
                v-if="workingColumns.length === 0"
                dense
                outlined
                type="info"
              >
                No fields available.
              </v-alert>
            </div>
            <v-btn
              v-if="!isUpdating"
              class="warning ml-2"
              @click="addHeaderSet"
              depressed
              :loading="isAddLoading"
            >
              <v-icon left>mdi-table-column-plus-after</v-icon>
              Add Column Set
            </v-btn>
            <v-btn
              v-else
              class="warning ml-2"
              @click="updateHeaderSet"
              depressed
              :loading="isUpdateLoading"
            >
              <v-icon left>mdi-content-save</v-icon>
              Update Column Set
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>
<script>
import generalMixin from "@/js/general-mixin";
import backendService from "@/services/backend-service";
export default {
  name: "HeaderSection",
  mixins: [generalMixin],
  props: {
    database: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  mounted: function () {
    this.headerSet = this.currentHeaderSet || {};
    this.buildWorkingColumns(this.headerSet);
  },
  data() {
    return {
      addingHeader: false,
      selectedFields: [],
      workingColumns: [],
      headerSet: {},
      isPublic: false,
      setName: "",
      isFormOpen: false,
      isUpdating: false,
      isUpdateLoading: false,
      isAddLoading: false,
    };
  },
  computed: {
    currentDatabase() {
      if (this.database && this.database.value) {
        return this.database;
      } else {
        let database = this.$store.getters["currentDatabase"];
        if (database && database.value) return database;
      }
      return {};
    },
    currentHeaderSet() {
      return this.$store.getters["currentHeaderSet"];
    },
    currentUser() {
      return this.$store.getters["currentUser"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    databaseToHeaderSets() {
      return this.$store.getters["databaseToHeaderSets"] || {};
    },
    fields() {
      return (this.databaseToFields[this.currentDatabase.value] || []).filter(
        (e) => e.type != "list"
      );
    },
    headerSets() {
      if (this.currentDatabase && this.currentDatabase.value) {
        const headerSets =
          this.databaseToHeaderSets[this.currentDatabase.value];
        const currentUserId = this.currentUser && this.currentUser.userId;
        if (headerSets && headerSets.length > 0)
          return headerSets.filter(
            (e) =>
              e.isPublic ||
              (e.createdBy && e.createdBy._id == currentUserId)
          );
      }
      return [];
    },
    validHeaderSet() {
      return this.headerSet && this.headerSet.name;
    },
  },
  watch: {
    fields() {
      if (this.isFormOpen) this.buildWorkingColumns(this.headerSet);
    },
    currentHeaderSet(newHeaderSet) {
      if (!this.isFormOpen) {
        this.headerSet = newHeaderSet || {};
        this.buildWorkingColumns(this.headerSet);
      }
    },
  },
  methods: {
    buildWorkingColumns(headerSet = {}) {
      const selectedFields = Array.isArray(headerSet.fields)
        ? headerSet.fields
        : [];
      const selectedFieldValues = new Set();
      const fieldByValue = {};

      this.fields.forEach((field) => {
        if (field && field.value) fieldByValue[field.value] = field;
      });

      const selectedColumns = selectedFields
        .filter((field) => field && field.value)
        .map((field) => {
          selectedFieldValues.add(field.value);
          return {
            ...(fieldByValue[field.value] || field),
            isActive: true,
          };
        });

      const inactiveColumns = this.fields
        .filter(
          (field) =>
            field && field.value && !selectedFieldValues.has(field.value)
        )
        .map((field) => ({
          ...field,
          isActive: false,
        }));

      this.workingColumns = [...selectedColumns, ...inactiveColumns];
    },
    getActiveColumnFields() {
      return this.workingColumns
        .filter((field) => field.isActive)
        .map((field, index) => {
          const savedField = { ...field };
          delete savedField.isActive;
          savedField.order = index + 1;
          return savedField;
        });
    },
    moveColumn(index, direction) {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= this.workingColumns.length) return;

      const columns = [...this.workingColumns];
      const [column] = columns.splice(index, 1);
      columns.splice(targetIndex, 0, column);
      this.workingColumns = columns;
    },
    validateHeaderSet() {
      if (!this.headerSet.name || !this.headerSet.name.trim()) {
        this.errorSnackbar("Column set name is required");
        return false;
      }

      const activeFields = this.getActiveColumnFields();
      if (activeFields.length === 0) {
        this.errorSnackbar("Choose at least one column");
        return false;
      }

      this.headerSet.fields = activeFields;
      return true;
    },
    addHeaderSet() {
      if (!this.validateHeaderSet()) return;
      this.headerSet.default = false;
      this.headerSet.database = this.currentDatabase.value;
      this.isAddLoading = true;
      backendService.addHeaderSet(this.headerSet).then((response) => {
        this.timer(1000).then(() => {
          this.$store.commit("addHeaderSet", response.data);
          this.isAddLoading = false;
          this.headerSet = {};
          this.workingColumns = [];
          this.isFormOpen = false;
          this.successSnackbar("Successfully added new column set");
        });
      });
    },
    getHeaderSetText(headerSet) {
      let setName = headerSet.name;
      if (headerSet.isFavorite) setName += " - Favorite";
      return setName;
    },
    handleChange() {
      this.$store.commit("setCurrentHeaderSet", this.headerSet);
      this.buildWorkingColumns(this.headerSet);
    },
    setFavoriteHeaderSet() {
      this.isUpdateLoading = true;
      let favorite = {
        id: this.headerSet._id,
        database: this.currentDatabase.value,
      };
      backendService
        .setFavoriteHeaderSet(favorite)
        .then(() => {
          this.timer(1000).then(() => {
            this.headerSets.forEach((e) => (e.isFavorite = false));
            this.headerSet.isFavorite = true;
            this.isUpdateLoading = false;
            this.$forceUpdate();
            this.successSnackbar("Successfully set favorite column set");
          });
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.isUpdateLoading = false;
            this.errorSnackbar("Ops! Something is not right");
          });
        });
    },
    openForm(isUpdating = false) {
      if (isUpdating) {
        this.isFormOpen = true;
        this.isUpdating = true;
        this.buildWorkingColumns(this.headerSet);
      } else {
        this.isFormOpen = true;
        this.isUpdating = false;
        this.headerSet = { isPublic: false, fields: [] };
        this.buildWorkingColumns(this.headerSet);
      }
    },
    updateHeaderSet() {
      if (!this.validateHeaderSet()) return;
      this.isUpdateLoading = true;
      backendService
        .updateHeaderSet(this.headerSet)
        .then(() => {
          this.timer(1000).then(() => {
            this.isUpdating = false;
            this.isFormOpen = false;
            this.isUpdateLoading = false;
            this.successSnackbar("Successfully updated column set");
          });
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.isUpdateLoading = false;
            this.errorSnackbar("Ops! Something is not right");
          });
        });
    },
  },
};
</script>
<style scoped>
.list-panel-title {
  align-items: flex-start;
}

.list-panel-title small {
  color: #627d98;
  display: block;
  font-size: 0.85rem;
  font-weight: 400;
  margin-top: 4px;
}

.list-toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) max-content max-content max-content;
  gap: 10px;
  align-items: start;
}

.column-form-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(160px, 240px);
  gap: 10px;
}

.column-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 10px;
  align-items: start;
}

.column-list {
  border: 1px solid #d9e2ec;
}

.column-list-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(120px, 0.55fr) max-content;
  gap: 10px;
  align-items: center;
  min-height: 52px;
  padding: 6px 8px;
  border-bottom: 1px solid #eef2f7;
}

.column-list-row:last-child {
  border-bottom: 0;
}

.column-list-row--inactive {
  background: #fbfcfe;
}

.column-list-row--inactive .column-list-meta {
  opacity: 0.7;
}

.column-list-meta {
  color: #627d98;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-list-actions {
  display: flex;
  justify-content: flex-end;
}

@media only screen and (max-width: 960px) {
  .list-toolbar,
  .column-form-grid,
  .column-picker {
    grid-template-columns: 1fr;
  }

  .column-list-row {
    grid-template-columns: minmax(0, 1fr) max-content;
  }

  .column-list-meta {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
</style>
