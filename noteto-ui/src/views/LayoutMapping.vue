<template>
  <div>
    <v-card elevation="0">
      <v-card-title>
        <h3 class="mb-5">Add Layout</h3>
        <v-spacer></v-spacer>
        <v-autocomplete
          rounded
          outlined
          label="Database"
          @change="getLayoutByDatabase"
          :items="databases"
          item-text="displayName"
          item-value="value"
          v-model="databaseValue"
        ></v-autocomplete>

        <v-spacer></v-spacer>
        <div class="mb-5">
          <v-btn rounded class="primary ml-2" @click="addRow" depressed dark
            ><i class="fas fa-arrows-alt-v"></i
          ></v-btn>
          <v-btn
            rounded
            class="success ml-2"
            @click="saveLayout"
            depressed
            dark
            :loading="isLoading"
            ><i class="fas fa-save"></i
          ></v-btn>
        </div>
      </v-card-title>
      <v-card-text
        ><v-row v-for="(row, idxI) in rows" :key="idxI" class="mx-2">
          <v-col md="2">
            <v-autocomplete
              label="Type"
              :items="rowTypes"
              item-text="displayName"
              item-value="value"
              return-object
              v-model="selectedRowTypes[idxI]"
            ></v-autocomplete>
          </v-col>
          <v-col v-for="(col, idxJ) in row" :key="idxJ">
            <v-autocomplete
              v-if="selectedRowTypes[idxI].value == 'row'"
              :label="`Item (${idxI + 1},${idxJ + 1})`"
              :items="fields"
              item-text="displayName"
              item-value="value"
              v-model="col.field"
            ></v-autocomplete>
            <v-text-field
              v-else-if="selectedRowTypes[idxI].value == 'label'"
              :label="`Label (${idxI + 1},${idxJ + 1})`"
              v-model="col.label"
            ></v-text-field>
          </v-col>
          <v-col class="d-flex justify-content-end">
            <v-btn
              rounded
              class="primary ml-2 mt-1"
              @click="addColumn(idxI)"
              depressed
              dark
              ><i class="fas fa-arrows-alt-h"></i
            ></v-btn>
            <v-btn
              rounded
              class="red ml-2 mt-1"
              @click="removeColumn(idxI)"
              depressed
              dark
              ><i class="fas fa-minus"></i
            ></v-btn>
          </v-col> </v-row
      ></v-card-text>
    </v-card>
    <general-snackbar></general-snackbar>
  </div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import GeneralSnackbar from "../components/GeneralSnackBar.vue";
import formMixin from "@/js/form-mixin";
export default {
  name: "LayoutSetting",
  mixins: [formMixin],
  components: {
    "general-snackbar": GeneralSnackbar,
  },
  computed: {
    rowTypes() {
      return this.$store.getters["dropdowns"]["rowType"];
    },
    fields() {
      return this.$store.getters["databaseToFields"][this.databaseValue];
    },
    database() {
      return this.$store.getters["currentDatabase"];
    },
    databases() {
      return this.$store.getters["allDatabases"];
    },
    databaseToLayoutMappings() {
      return this.$store.getters["databaseToLayoutMappings"];
    },
    // layout() {
    //   return this.$store.getters["databaseToLayoutMappings"][
    //     this.database.value
    //   ];
    // },
  },
  data() {
    return {
      types: [
        { name: "Row", id: 1 },
        { name: "Label", id: 2 },
      ],
      rows: [],
      selectedRowTypes: [],
    };
  },
  created: function () {
    //this.getAllFields();
    //this.generateRowsCols();
  },
  methods: {
    addRow() {
      this.rows.push([]);
      this.selectedRowTypes.push(
        this.rowTypes.find((type) => type.value == "row")
      );
    },
    addColumn(rowNum) {
      let cols = this.rows[rowNum];
      if (cols.length < 4) cols.push({ label: "", field: "" });
    },
    removeColumn(rowNum) {
      let cols = this.rows[rowNum];
      if (cols.length > 0) {
        cols.pop();
      } else {
        this.rows.splice(rowNum, 1);
        this.selectedRowTypes.splice(rowNum, 1);
      }
    },
    returnWhole(item) {
      return item;
    },
    getLayoutByDatabase() {
      let layout = [];
      this.rows = [];
      this.selectedRowTypes = [];
      if (this.databaseToLayoutMappings[this.databaseValue]) {
        layout = this.databaseToLayoutMappings[this.databaseValue];
      }
      layout.forEach((row) => {
        this.rows.push(row.cols);
        this.selectedRowTypes.push(row.type);
      });
    },
    saveLayout() {
      let layout = [];
      this.rows.forEach((row, idx) => {
        layout.push({
          order: idx + 1,
          cols: row,
          database: this.databaseValue,
          type: this.selectedRowTypes[idx],
        });
      });
      this.isLoading = true;
      backendService.removeLayoutByDatabase(this.database.value).then(() => {
        backendService.addLayout(layout).then(() => {
          this.$store.commit("setLayout", layout);
          setTimeout(() => {
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Successfully Updated the Layout",
              "success",
              true
            );
          }, 1000);
        });
      });
    },
  },
};
</script>
