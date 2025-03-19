<template>
  <v-container fluid class="d-flex justify-space-around">
    <v-card
      class="rounded-xl"
      elevation="0"
      outlined
      min-width="350"
      width="50%"
    >
      <v-card-text>
        <v-autocomplete
          rounded
          outlined
          dense
          :items="databases"
          item-text="displayName"
          item-value="value"
          filled
          label="Database"
          v-model="databaseValue"
        ></v-autocomplete>
        <h2 class="mb-1">Update Headers</h2>
        <div class="d-flex">
          <v-autocomplete
            rounded
            outlined
            v-model="selectedHeaders"
            label="Headers"
            :items="fields"
            return-object
            item-text="displayName"
            chips
            deletable-chips
            multiple
          ></v-autocomplete
          ><v-btn
            rounded
            class="warning ml-2"
            @click="updateHeaders"
            depressed
            :loading="isUpdatingLoading"
          >
            <i class="fas fa-heading mr-2"></i>
            Update Header
          </v-btn>
        </div>

        <h2 class="mb-1">Add/Update Field</h2>
        <v-autocomplete
          rounded
          outlined
          dense
          label="Field Type"
          :items="fieldTypes"
          v-model="fieldType"
          item-value="value"
          item-text="displayName"
          :disabled="isUpdating"
        ></v-autocomplete>
        <v-text-field
          rounded
          outlined
          dense
          label="Display Name"
          v-model="displayName"
        ></v-text-field>
        <v-text-field
          rounded
          outlined
          dense
          label="Field Name"
          v-model="fieldValue"
          :disabled="isUpdating"
        ></v-text-field>

        <div>
          <div
            v-if="fieldType == 'singleSelect' || fieldType == 'multipleSelect'"
          >
            <h3>Choices</h3>
            <div
              class="d-flex justify-space-between"
              v-for="(choice, idx) in choices"
              :key="idx"
            >
              <div>
                <v-text-field
                  label="Name"
                  outlined
                  v-model="choice.value"
                ></v-text-field>
              </div>
              <div>
                <v-text-field
                  label="Display Name"
                  outlined
                  v-model="choice.displayName"
                ></v-text-field>
              </div>
              <div class="text-center">
                <v-btn
                  class="red mt-2"
                  dark
                  rounded
                  depressed
                  @click="removeChoice(idx)"
                  v-if="choice.isActive == true"
                >
                  <i class="fas fa-minus"></i>
                </v-btn>
                <v-btn
                  class="blue mt-2"
                  dark
                  rounded
                  depressed
                  @click="activateChoice(idx)"
                  v-else
                >
                  <i class="fas fa-plus"></i>
                </v-btn>
              </div>
            </div>
            <v-btn
              rounded
              class="primary ml-2 mt-1"
              depressed
              dark
              @click="addChoice"
            >
              <i class="fas fa-plus"></i>
            </v-btn>
          </div>
          <div v-if="fieldType == 'list'">
            <h3>Within Fields</h3>
            <v-autocomplete
              v-model="listFields"
              :items="fields"
              return-object
              item-text="displayName"
              chips
              deletable-chips
              multiple
              outlined
            ></v-autocomplete>
          </div>
        </div>
        <div class="d-flex justify-space-between mt-2">
          <v-btn
            rounded
            class="blue-grey darken-3"
            @click="reset"
            depressed
            dark
          >
            <i class="fas fa-save mr-2"></i>
            Reset
          </v-btn>
          <v-btn
            v-show="!isUpdating"
            rounded
            class="primary ml-2"
            @click="addField"
            depressed
            dark
            :loading="isLoading"
          >
            <i class="fas fa-save mr-2"></i>
            Add
          </v-btn>
          <v-btn
            v-show="isUpdating"
            rounded
            class="primary ml-2"
            @click="updateField"
            depressed
            dark
            :loading="isLoading"
          >
            <i class="fas fa-save mr-2"></i>
            Update
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    <v-card
      class="rounded-xl"
      outlined
      elevation="0"
      min-width="350"
      width="48%"
    >
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="text-left"
                v-for="field in fields"
                :key="field.value"
                @click="getFieldToUpdate(field)"
              >
                <td>{{ field.displayName }}</td>
                <td>{{ field.value }}</td>
                <td>{{ field.type }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import formMixin from "@/js/form-mixin";
export default {
  name: "FieldSection",
  data() {
    return {
      isUpdating: false,
      choices: [],
      types: [],
      headerSets: [],
      listFields: [],

      dollarOptions: {
        locale: "en-US",
        prefix: "$",
        suffix: "",
        length: 7,
        precision: 2,
      },
      kgOptions: {
        locale: "en-US",
        prefix: "",
        suffix: "Kg",
        length: 7,
        precision: 2,
      },
      lbOptions: {
        locale: "en-US",
        prefix: "",
        suffix: "Lbs",
        length: 7,
        precision: 2,
      },
      users: [],
    };
  },
  mixins: [formMixin],
  components: {},
  mounted: function () {},
  computed: {
    databases() {
      return this.$store.getters["allDatabases"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    databaseToChoices() {
      return this.$store.getters["databaseToChoices"];
    },
    databaseToHeaders() {
      return this.$store.getters["databaseToHeaders"];
    },
    fields() {
      return this.databaseToFields[this.databaseValue];
    },
    fieldToChoices() {
      let fieldToChoices = {};
      let choices = this.databaseToChoices[this.databaseValue];
      if (choices) {
        for (let i = 0; i < choices.length; i++) {
          if (!fieldToChoices[choices[i].field])
            fieldToChoices[choices[i].field] = [];
          fieldToChoices[choices[i].field].push(choices[i]);
        }
      }
      return fieldToChoices;
    },
    fieldTypes() {
      return this.$store.getters["dropdowns"]["fieldType"];
    },
    selectedHeaders: {
      get() {
        let headerSets = this.databaseToHeaders[this.databaseValue];
        console.log(headerSets);
        if (!headerSets) headerSets = [];
        return headerSets;
      },
      set(val) {
        this.$store.commit("replaceHeadersInDatabaseToHeaders", val);
      },
    },
  },
  methods: {
    addChoice() {
      this.choices.push({
        isActive: true,
        field: this.fieldValue,
        database: this.databaseValue,
      });
    },
    activateChoice(idx) {
      this.choices[idx].isActive = true;
    },

    addField() {
      let field = {};
      field.displayName = this.displayName;
      field.value = this.fieldValue;
      field.type = this.fieldType;
      field.database = this.databaseValue;
      this.isLoading = true;
      if (this.fieldType == "list") {
        field.listFields = [];
        this.listFields.forEach((eField, idx) => {
          eField.order = idx + 1;
          field.listFields.push(eField);
        });
      }
      if (this.fieldType == "currencyInDollar") {
        field.options = this.dollarOptions;
      }
      if (this.fieldType == "weightInKg") {
        field.options = this.kgOptions;
      }
      if (this.fieldType == "weightInLb") {
        field.options = this.lbOptions;
      }
      backendService
        .addField(field)
        .then((response) => {
          field._id = response.data.insertedId;
          this.$store.commit("addNewField", field);
          if (
            this.fieldType == "singleSelect" ||
            this.fieldType == "multipleSelect"
          ) {
            backendService.addChoices(this.choices).then((response) => {
              this.$store.commit("addNewChoices", response.data);
            });
          }
          setTimeout(() => {
            this.choices = [];
            this.displayName = "";
            this.fieldValue = "";
            this.fieldType = "";
            this.listFields = [];
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Successfully created a new field",
              "success"
            );
          }, 1000);
        })
        .catch(() => {
          setTimeout(() => {
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Oops! something is not right!",
              "error"
            );
          }, 1000);
        });
    },
    getValueText(obj) {
      if (obj.username) {
        return `${obj.first} ${obj.last} - ${obj.username}`;
      } else {
        return obj.displayName;
      }
    },
    getFieldToUpdate(field) {
      this.displayName = field.displayName;
      this.fieldValue = field.value;
      this.fieldType = field.type;
      this.listFields = field.listFields;
      this.isUpdating = true;
      if (field.type == "singleSelect" || field.type == "multipleSelect") {
        this.choices = this.fieldToChoices[field.value];
        if (!this.choices) {
          this.choices = [];
        }
      }
    },
    // getSelectedHeadersByDatabase() {

    // 	if (!this.selectedHeaders) this.selectedHeaders = [];
    // },

    removeChoice(idx) {
      if (this.isUpdating) this.choices[idx].isActive = false;
      else this.choices.splice(idx, 1);
    },
    removeHeader(header) {
      delete this.headerSets[header];
    },
    reset() {
      this.displayName = "";
      this.fieldValue = "";
      this.fieldtype = "";
      this.isUpdating = false;
      this.choices = [];
      this.listFields = [];
    },
    updateField() {
      let field = {};
      field.database = this.databaseValue;
      field.value = this.fieldValue;
      field.displayName = this.displayName;
      this.isLoading = true;
      if (this.fieldType == "list") {
        field.listFields = [];
        this.listFields.forEach((eField, idx) => {
          eField.order = idx + 1;
          field.listFields.push(eField);
        });
      }
      backendService
        .updateField(field)
        .then(() => {
          if (
            this.fieldType == "singleSelect" ||
            this.fieldType == "multiSelect"
          ) {
            backendService.updateChoices(this.choices).then((response) => {
              this.$store.commit(
                "replaceChoicesInDatabaseToChoices",
                response.data
              );
            });
          }
          setTimeout(() => {
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Successfully updated field",
              "success"
            );
          }, 1000);
        })
        .catch(() => {
          setTimeout(() => {
            this.isLoading = false;
            eventBus.$emit(
              "setSnackbar",
              "Oops! something is not right!",
              "error"
            );
          }, 1000);
        });
    },
    updateHeaders() {
      for (let i = 0; i < this.selectedHeaders.length; i++) {
        let header = this.selectedHeaders[i];
        header.order = i + 1;
      }
      this.isUpdatingLoading = true;
      backendService.removeHeadersByDatabase(this.databaseValue).then(() => {
        backendService
          .addSelectedHeaders(this.selectedHeaders)
          .then((response) => {
            this.selectedHeaders = response.data;
            setTimeout(() => {
              this.isUpdatingLoading = false;
              eventBus.$emit(
                "setSnackbar",
                "Successfully updated headers",
                "success"
              );
            }, 1000);
          });
      });
    },
  },
};
</script>
