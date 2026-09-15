<template>
  <v-container fluid class="list-view-page">
    <div class="list-toolbar">
      <div>
        <div class="overline primary--text">Records</div>
        <h1>{{ currentDatabase.displayName || "Records" }}</h1>
      </div>
      <div class="list-actions">
        <v-btn depressed outlined color="primary" @click="columnDialog = true">
          <v-icon left>mdi-table-column</v-icon>
          Column Sets
        </v-btn>
        <v-btn depressed outlined color="primary" @click="filterDialog = true">
          <v-icon left>mdi-filter-variant</v-icon>
          Filter Sets
        </v-btn>
        <v-btn
          depressed
          outlined
          color="primary"
          :disabled="filteredEntries.length == 0"
          @click="generateCsv"
        >
          <v-icon left>mdi-file-download-outline</v-icon>
          Download
        </v-btn>
        <v-btn
          depressed
          color="primary"
          :disabled="!currentDatabase.value"
          @click="openNewEntryDrawer"
        >
          <v-icon left>mdi-plus</v-icon>
          New
        </v-btn>
      </div>
    </div>

    <div class="table-scroll">
      <v-data-table
        class="records-table"
        mobile-breakpoint="0"
        :loading="isListLoading"
        loading-text="Loading records..."
        :items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredEntries"
        @update:items-per-page="setItemsPerPage"
      >
        <template v-slot:header>
          <tr>
            <th
              v-for="(header, idx) in headers"
              :key="`header-${idx}`"
            >
              <v-text-field
                class="table-filter"
                v-model="search[header.value]"
                placeholder="filter"
                solo-inverted
                hide-details
                flat
                dense
              ></v-text-field>
            </th>
          </tr>
        </template>

        <template v-slot:item="{ item, index }">
          <tr
            :class="[
              index % 2 == 0 ? 'bg-grey entry' : 'entry',
              selected == item._data.id ? 'selected-row' : '',
            ]"
            :key="`item-${index}`"
            @click="highlightRow(item._data.id)"
            @dblclick="goToDetailForm(item)"
          >
            <td
              v-for="(header, idx) in headers"
              :key="`header-${index}-${idx}`"
            >
              <span v-if="header.isDefault && header.value == '_data.id'">
                <a @click.stop="goToDetailForm(item)">
                  {{ item._data.id }}
                </a>
              </span>
            <span v-else-if="header.isDefault">
              {{ getDataText(header, item) }}
            </span>
            <span
              v-else-if="header.type == 'singleSelect'"
              class="choice-badge"
              :style="getChoiceBadgeStyle(header, item[header.value])"
            >
              {{ getEntryText(header, item) }}
            </span>
            <span
              v-else-if="header.type == 'multipleSelect'"
              class="choice-badge-list"
            >
              <span
                v-for="choice in item[header.value] || []"
                :key="getChoiceText(choice)"
                class="choice-badge"
                :style="getChoiceBadgeStyle(header, choice)"
              >
                {{ getChoiceText(choice) }}
              </span>
            </span>
            <span v-else>
              {{ getEntryText(header, item) }}
            </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <v-dialog v-model="columnDialog" max-width="960">
      <header-section @close="columnDialog = false"></header-section>
    </v-dialog>

    <v-dialog v-model="filterDialog" max-width="1080">
      <list-filter @close="filterDialog = false"></list-filter>
    </v-dialog>

    <div
      v-if="entryDrawer"
      class="entry-slide-backdrop"
      @click="closeEntryDrawer"
    ></div>
    <aside
      v-if="entryDrawer"
      class="entry-slide-panel"
      :style="{ width: `${entryDrawerWidth}px` }"
    >
      <div class="entry-slide-resize" @mousedown="startEntryDrawerResize"></div>
      <div class="entry-slide-header">
        <div>
          <div class="overline primary--text">{{ entryDrawerLabel }}</div>
          <h2>{{ entryDrawerTitle }}</h2>
        </div>
        <v-btn icon @click="closeEntryDrawer">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="entry-slide-body">
        <entry-form-panel
          :key="entryDrawerKey"
          embedded
          :entry-id="entryDrawerEntryId"
          :database-value="entryDrawerDatabaseValue"
          @saved="closeEntryDrawer"
          @deleted="closeEntryDrawer"
          @updated="loadListSettings"
        ></entry-form-panel>
      </div>
    </aside>
  </v-container>
</template>
<script>
import EntryFormPanel from "@/components/EntryFormPanel.vue";
import HeaderSection from "@/components/HeaderSection.vue";
import ListFilter from "@/components/ListFilter.vue";
//import backendService from "../services/backend-service.js";
export default {
  name: "ListView",
  components: {
    "entry-form-panel": EntryFormPanel,
    "header-section": HeaderSection,
    "list-filter": ListFilter,
  },
  data() {
    return {
      columnDialog: false,
      datePicker: {},
      entryDrawer: false,
      entryDrawerDatabaseValue: "",
      entryDrawerEntryId: "",
      entryDrawerKey: 0,
      entryDrawerMode: "new",
      entryDrawerWidth: 720,
      isResolvingListDatabase: false,
      isResizingEntryDrawer: false,
      entryDrawerAnimationFrame: null,
      listSettingsKey: "",
      isListLoading: false,
      filterDialog: false,
      filter: {},
      defaultHeaders: [
        {
          value: "_data.id",
          text: "Id",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.createdBy",
          text: "Created By",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.dateCreated",
          text: "Date Created",
          align: "start",
          isDefault: true,
        },
        {
          value: "_data.comment",
          text: "Comment",
          align: "start",
          isDefault: true,
        },
      ],
    };
  },
  mounted: function () {
    this.loadListSettings();
    if (this.$route.query.newEntry) this.openNewEntryDrawer(false);
    if (this.$route.query.detailEntry) {
      this.openDetailEntryDrawer(
        this.$route.query.detailEntry,
        this.$route.query.database,
        false
      );
    }
  },
  computed: {
    allDatabases() {
      return this.$store.getters["allDatabases"] || [];
    },
    availableDatabases() {
      return this.$store.getters["availableDatabases"] || [];
    },
    currentDatabase() {
      return this.$store.getters["currentDatabase"];
    },
    currentHeaderSet() {
      return this.$store.getters["currentHeaderSet"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"] || {};
    },
    databaseToChoices() {
      return this.$store.getters["databaseToChoices"] || {};
    },
    databaseToHeaderSets() {
      return this.$store.getters["databaseToHeaderSets"];
    },
    databaseName() {
      return this.currentDatabase.value;
    },
    databases() {
      const databaseByValue = {};
      this.availableDatabases.concat(this.allDatabases).forEach((database) => {
        if (database && database.value) {
          databaseByValue[database.value] = database;
        }
      });
      return Object.values(databaseByValue);
    },
    databaseOptionsKey() {
      return this.databases.map((database) => database.value).join("|");
    },
    entries() {
      return this.$store.getters["entries"];
    },
    fields() {
      return this.$store.getters["fields"] || [];
    },
    entryDrawerLabel() {
      return this.entryDrawerMode == "detail" ? "Entry Detail" : "New Entry";
    },
    entryDrawerTitle() {
      if (this.entryDrawerMode == "detail") return "Update Entry";
      return this.currentDatabase.displayName || "New Entry";
    },
    favoriteHeaderSet() {
      if (this.currentDatabase && this.currentDatabase.value) {
        const headerSets =
          this.databaseToHeaderSets[this.currentDatabase.value];
        if (headerSets && headerSets.length > 0) {
          const headerSet = headerSets.find((e) => e.isFavorite);
          if (headerSet) return headerSet;
          return headerSets[0];
        }
      }
      return [];
    },
    filteredEntries() {
      let entries = this.entries;
      for (let key in this.search) {
        let searchStr = this.search[key].trim().toLowerCase();
        let header = this.headers.find((header) => header.value == key);
        if (searchStr && searchStr.length) {
          if (header && !header.isDefault) {
            entries = entries.filter((e) => {
              let str = this.getEntryText(header, e);
              return str
                .toString()
                .trim()
                .toLowerCase()
                .includes(this.search[key].toLowerCase());
            });
          } else if (header && header.isDefault) {
            entries = entries.filter((e) => {
              let str = this.getDataText(header, e);
              return str
                .toString()
                .trim()
                .toLowerCase()
                .includes(this.search[key].toLowerCase());
            });
          }
        }
      }
      return entries;
    },
    headers() {
      let processedHeaders = [...this.defaultHeaders];
      const headerSetFields =
        this.currentHeaderSet && this.currentHeaderSet.fields
          ? this.currentHeaderSet.fields
          : [];
      const rawHeaders =
        headerSetFields.length > 0 ? headerSetFields : this.listFields;
      if (rawHeaders.length > 0) {
        for (let i = 0; i < rawHeaders.length; i++) {
          let processedHeader = { ...rawHeaders[i] };
          processedHeader.text = rawHeaders[i].displayName;
          processedHeader.align = "start";
          processedHeaders.push(processedHeader);
        }
      }
      return processedHeaders;
    },
    listFields() {
      const databaseValue = this.currentDatabase && this.currentDatabase.value;
      const databaseFields = this.databaseToFields[databaseValue] || [];
      const fields =
        databaseFields.length > 0 ? databaseFields : this.fields;
      return (fields || []).filter((field) => {
        return field && field.value && field.isActive !== false;
      });
    },
    choiceLookup() {
      const databaseValue = this.currentDatabase && this.currentDatabase.value;
      const choices = this.databaseToChoices[databaseValue] || [];
      const lookup = {};
      choices.forEach((choice) => {
        if (!choice || !choice.field) return;
        if (!lookup[choice.field]) lookup[choice.field] = {};
        if (choice.value) lookup[choice.field][choice.value] = choice;
        if (choice.displayName) {
          lookup[choice.field][choice.displayName] = choice;
        }
      });
      return lookup;
    },
    itemsPerPage() {
      return this.$store.getters["itemsPerPage"];
    },
    search: {
      get: function () {
        return this.$store.getters["search"];
      },
      set: function (val) {
        this.$store.commit("setSearch", val);
      },
    },
    selected: {
      get: function () {
        return this.$store.getters["selectedRow"];
      },
      set: function (val) {
        this.$store.commit("setSelectedRow", val);
      },
    },
    routeName() {
      return this.$route.name;
    },
  },
  methods: {
    formatDate(rawDate) {
      let date = new Date(rawDate);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
    generateCsv() {
      let filteredEntries = this.filteredEntries;
      let headerStr = this.headers.map((header) => header.text).join(";");

      let rows = [];
      for (let i = 0; i < filteredEntries.length; i++) {
        let row = [];
        let entry = filteredEntries[i];
        for (let j = 0; j < this.headers.length; j++) {
          let header = this.headers[j];
          let str = "";
          if (header && !header.isDefault) {
            str = this.getEntryText(header, entry);
          } else if (header && header.isDefault) {
            str = this.getDataText(header, entry);
          }
          row.push(str);
        }
        rows.push(row);
      }

      let csvContent = "";
      csvContent += headerStr + "\r\n";

      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let rowStr = row.join(";");
        csvContent += rowStr + "\r\n";
      }
      let blob = new Blob([csvContent], { type: "text/plain" });
      let url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `noteto-${this.databaseName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    getDataText(header, entry) {
      if (header.value == "_data.id") {
        return entry._data.id;
      } else if (header.value == "_data.dateCreated") {
        return this.formatDate(entry._data.dateCreated);
      } else if (header.value == "_data.createdBy") {
        return this.getFullName(entry._data.createdBy);
      } else if (header.value == "_data.comment") {
        return entry._data.comment;
      } else {
        return "";
      }
    },
    getEntryText(header, entry) {
      if (!header.type) {
        return entry[header.value];
      }
      if (!entry[header.value]) {
        return "";
      }
      if (header.type == "multipleSelect") {
        return entry[header.value].map((e) => this.getChoiceText(e)).join(", ");
      } else if (header.type == "singleSelect") {
        return this.getChoiceText(entry[header.value]);
      } else if (header.type == "singleUser") {
        return this.getFullName(entry[header.value]);
      } else if (header.type.includes("currency")) {
        return (
          header.options.prefix +
          " " +
          entry[header.value].toFixed(header.options.precision)
        );
      } else if (header.type.includes("weight")) {
        return (
          entry[header.value].toFixed(header.options.precision) +
          " " +
          header.options.suffix
        );
      } else if (header.type == "multipleUsers") {
        return entry[header.value].map((e) => this.getFullName(e)).join(", ");
      } else if (header.type == "date") {
        return this.formatDate(entry[header.value]);
      } else if (header.type == "number") {
        return entry[header.value];
      } else {
        return entry[header.value];
      }
    },
    getChoiceBadgeStyle(header, choice) {
      const color = this.getChoiceColor(header, choice);
      return {
        backgroundColor: color,
        color: this.getChoiceTextColor(color),
      };
    },
    getChoiceColor(header, choice) {
      const matchedChoice = this.getChoiceDefinition(header, choice);
      const color = matchedChoice && matchedChoice.color;
      if (!color) return "#e0e0e0";
      if (typeof color == "string") return color;
      if (typeof color == "object") {
        return color.hexa || color.hex || color.value || "#e0e0e0";
      }
      return "#e0e0e0";
    },
    getChoiceDefinition(header, choice) {
      if (!header || !choice) return choice;
      if (choice.color) return choice;
      const fieldChoices = this.choiceLookup[header.value] || {};
      if (typeof choice == "string") return fieldChoices[choice] || choice;
      return (
        fieldChoices[choice.value] ||
        fieldChoices[choice.displayName] ||
        choice
      );
    },
    getChoiceText(choice) {
      if (!choice) return "";
      if (typeof choice == "string") return choice;
      return choice.displayName || choice.value || "";
    },
    getChoiceTextColor(color) {
      const hex = String(color || "#e0e0e0").replace("#", "");
      if (hex.length < 6) return "black";
      const red = parseInt(hex.substring(0, 2), 16);
      const green = parseInt(hex.substring(2, 4), 16);
      const blue = parseInt(hex.substring(4, 6), 16);
      const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
      return brightness > 150 ? "black" : "white";
    },
    goToDetailForm(entry) {
      if (!entry || !entry._id) return;
      this.openDetailEntryDrawer(entry._id, entry._data?.database);
    },

    getFullName(user) {
      if (user) return `${user.first} ${user.last}`;
      else return "";
    },
    highlightRow(idx) {
      this.selected = idx;
    },
    closeEntryDrawer() {
      this.entryDrawer = false;
      this.entryDrawerDatabaseValue = "";
      this.entryDrawerEntryId = "";
      this.loadListSettings();
      if (this.$route.query.newEntry || this.$route.query.detailEntry) {
        const query = { ...this.$route.query };
        delete query.newEntry;
        delete query.detailEntry;
        this.$router.replace({ query }).catch(() => {});
      }
    },
    openNewEntryDrawer(updateRoute = true) {
      this.entryDrawerKey++;
      this.entryDrawerMode = "new";
      this.entryDrawerDatabaseValue = this.currentDatabase.value;
      this.entryDrawerEntryId = "";
      this.entryDrawer = true;
      if (updateRoute && !this.$route.query.newEntry) {
        this.$router
          .replace({
            query: {
              ...this.$route.query,
              database: this.currentDatabase.value,
              newEntry: "true",
            },
          })
          .catch(() => {});
      }
    },
    openDetailEntryDrawer(entryId, databaseValue = "", updateRoute = true) {
      if (!entryId) return;
      this.entryDrawerKey++;
      this.entryDrawerMode = "detail";
      this.entryDrawerDatabaseValue = databaseValue || this.currentDatabase.value;
      this.entryDrawerEntryId = entryId;
      this.entryDrawer = true;
      if (updateRoute && this.$route.query.detailEntry != entryId) {
        const query = { ...this.$route.query };
        delete query.newEntry;
        query.database = this.entryDrawerDatabaseValue;
        query.detailEntry = entryId;
        this.$router.replace({ query }).catch(() => {});
      }
    },
    startEntryDrawerResize(event) {
      event.preventDefault();
      this.isResizingEntryDrawer = true;
      document.body.classList.add("resizing-entry-drawer");
      window.addEventListener("mousemove", this.resizeEntryDrawer);
      window.addEventListener("mouseup", this.stopEntryDrawerResize);
    },
    resizeEntryDrawer(event) {
      if (!this.isResizingEntryDrawer) return;
      const clientX = event.clientX;
      if (this.entryDrawerAnimationFrame) return;
      this.entryDrawerAnimationFrame = window.requestAnimationFrame(() => {
        const minWidth = 420;
        const maxWidth = window.innerWidth - 8;
        const nextWidth = window.innerWidth - clientX;
        this.entryDrawerWidth = Math.min(
          Math.max(nextWidth, minWidth),
          maxWidth
        );
        this.entryDrawerAnimationFrame = null;
      });
    },
    stopEntryDrawerResize() {
      this.isResizingEntryDrawer = false;
      if (this.entryDrawerAnimationFrame) {
        window.cancelAnimationFrame(this.entryDrawerAnimationFrame);
        this.entryDrawerAnimationFrame = null;
      }
      document.body.classList.remove("resizing-entry-drawer");
      window.removeEventListener("mousemove", this.resizeEntryDrawer);
      window.removeEventListener("mouseup", this.stopEntryDrawerResize);
    },
    isNumber(header) {
      if (header.type.includes("currency")) {
        return true;
      } else if (header.type.includes("weight")) {
        return true;
      } else if (header.type.includes("number")) {
        return true;
      } else {
        return false;
      }
    },
    setItemsPerPage(val) {
      this.$store.commit("setItemsPerPage", val);
    },
    loadListSettings() {
      const database = this.ensureListDatabase();
      if (!database || !database.value) {
        this.loadDatabasesThenRetry();
        return;
      }
      const databaseValue = database.value;
      const listSettingsKey = `${databaseValue}:${this.databaseOptionsKey}`;
      if (this.listSettingsKey == listSettingsKey) return;
      this.listSettingsKey = listSettingsKey;
      this.isListLoading = true;
      this.$store.dispatch("getFieldsByDatabase", databaseValue);
      this.$store.dispatch("getChoicesByDatabase", databaseValue);
      this.$store.dispatch("getHeaderSetsByDatabase");
      this.$store
        .dispatch("getFilterSetsByDatabase")
        .then(() => {
          return this.$store.dispatch("getEntriesByDatabase", databaseValue);
        })
        .finally(() => {
          this.isListLoading = false;
        });
    },
    loadDatabasesThenRetry() {
      if (this.isResolvingListDatabase) return;
      this.isListLoading = true;
      this.isResolvingListDatabase = true;
      Promise.all([
        this.$store.dispatch("getDatabasesByUserId"),
        this.$store.dispatch("getAllDatabases"),
      ])
        .then(() => {
          this.loadListSettings();
        })
        .finally(() => {
          this.isResolvingListDatabase = false;
          if (!this.currentDatabase || !this.currentDatabase.value) {
            this.isListLoading = false;
          }
        });
    },
    ensureListDatabase() {
      const database = this.resolveListDatabase();
      if (!database || !database.value) return null;
      if (
        !this.currentDatabase ||
        this.currentDatabase.value != database.value ||
        !this.currentDatabase.displayName
      ) {
        this.$store.commit("setCurrentDatabase", database);
      }
      if (this.$route.query.database != database.value) {
        this.$router
          .replace({
            query: { ...this.$route.query, database: database.value },
          })
          .catch(() => {});
      }
      return database;
    },
    resolveListDatabase() {
      const currentValue = this.currentDatabase && this.currentDatabase.value;
      const queryValue = this.$route.query.database;
      const storedDatabase = this.getStoredDatabase();
      return (
        this.findDatabase(queryValue) ||
        this.findDatabase(currentValue) ||
        this.findDatabase(storedDatabase.value) ||
        (currentValue ? this.currentDatabase : null) ||
        this.databases[0] ||
        null
      );
    },
    findDatabase(databaseValue) {
      if (!databaseValue) return null;
      return this.databases.find((database) => database.value == databaseValue);
    },
    getStoredDatabase() {
      try {
        return JSON.parse(localStorage.getItem("currentDatabase") || "{}");
      } catch (error) {
        return {};
      }
    },
    timer(seconds) {
      let promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds);
      });
      return promise;
    },
  },
  watch: {
    "currentDatabase.value": {
      immediate: true,
      handler: function () {
        this.loadListSettings();
      },
    },
    "$route.query.database": function () {
      this.loadListSettings();
    },
    databaseOptionsKey: function () {
      this.loadListSettings();
    },
    "$route.query.newEntry": function (newValue) {
      if (newValue) this.openNewEntryDrawer(false);
      else if (!this.$route.query.detailEntry) this.entryDrawer = false;
    },
    "$route.query.detailEntry": function (newValue) {
      if (newValue) {
        this.openDetailEntryDrawer(
          newValue,
          this.$route.query.database,
          false
        );
      }
      else if (!this.$route.query.newEntry) this.entryDrawer = false;
    },
    entryDrawer: function (newValue) {
      if (
        !newValue &&
        (this.$route.query.newEntry || this.$route.query.detailEntry)
      ) {
        const query = { ...this.$route.query };
        delete query.newEntry;
        delete query.detailEntry;
        this.$router.replace({ query }).catch(() => {});
      }
    },
  },
  destroyed: function () {
    this.stopEntryDrawerResize();
  },
};
</script>
<style scoped>
.list-view-page {
  padding: 0;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px 14px;
}

.list-toolbar h1 {
  margin: 0;
  color: #1f2933;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
}

.list-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
}

.records-table {
  min-width: 100%;
  width: max-content;
  border-radius: 0;
}

.records-table::v-deep .v-data-table__wrapper {
  overflow: visible;
}

.records-table::v-deep table {
  border-collapse: collapse;
  table-layout: auto;
}

.records-table::v-deep th,
.records-table::v-deep td {
  min-width: 140px;
  max-width: 320px;
  height: 34px !important;
  padding: 4px 8px !important;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.records-table::v-deep th:first-child,
.records-table::v-deep td:first-child {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

.records-table::v-deep thead th {
  color: #1f2933 !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  background: #f4f6f8;
}

.records-table::v-deep tbody td {
  overflow: hidden;
  font-size: 0.84rem;
  text-overflow: ellipsis;
}

.table-filter {
  margin: 0;
  min-width: 120px;
}

.records-table::v-deep .table-filter .v-input__slot {
  min-height: 28px !important;
  padding: 0 6px !important;
  box-shadow: none !important;
}

.records-table::v-deep .table-filter input {
  padding: 2px 0;
  font-size: 0.78rem;
}

.choice-badge-list {
  display: inline-flex;
  gap: 4px;
}

.choice-badge {
  display: inline-flex;
  align-items: center;
  max-width: 180px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.entry-slide-backdrop {
  position: fixed;
  inset: 0;
  z-index: 19;
  background: rgba(15, 23, 42, 0.28);
}

.entry-slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  max-width: calc(100vw - 8px);
  min-width: 420px;
  overflow: visible;
  border-left: 1px solid rgba(31, 41, 51, 0.12);
  background: #ffffff;
  box-shadow: -10px 0 30px rgba(15, 23, 42, 0.18);
  animation: entry-slide-in 140ms ease-out;
}

.entry-slide-resize {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -5px;
  z-index: 2;
  width: 10px;
  cursor: ew-resize;
}

.entry-slide-resize::after {
  position: absolute;
  top: 50%;
  left: 4px;
  width: 3px;
  height: 52px;
  content: "";
  border-radius: 999px;
  background: rgba(21, 101, 192, 0.32);
  transform: translateY(-50%);
}

.entry-slide-resize:hover::after {
  background: rgba(21, 101, 192, 0.68);
}

.entry-slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 14px;
  border-bottom: 1px solid rgba(31, 41, 51, 0.08);
}

.entry-slide-header h2 {
  margin: 0;
  color: #1f2933;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
}

.entry-slide-body {
  height: calc(100vh - 88px);
  overflow: auto;
}

@keyframes entry-slide-in {
  from {
    transform: translateX(24px);
  }
  to {
    transform: translateX(0);
  }
}

tbody tr.entry:hover {
  background-color: #ff8521 !important;
  color: white;
}
tbody tr.entry:hover a {
  background-color: #ff8521 !important;
  color: white;
}
.selected-row {
  background-color: #0275d8 !important;
  color: white;
}
.selected-row a {
  text-decoration: none;
  color: white;
}
.bg-grey {
  background-color: #e6e6e6;
}
.filter {
  border-radius: 15px !important;
  min-height: 10px;
}

@media only screen and (max-width: 600px) {
  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 12px;
  }

  .list-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .entry-slide-panel {
    min-width: 0;
    width: 100vw !important;
    max-width: 100vw;
  }

  .entry-slide-resize {
    display: none;
  }
}
</style>

<style>
body.resizing-entry-drawer {
  cursor: ew-resize;
  user-select: none;
}
</style>
