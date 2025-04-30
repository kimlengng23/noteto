<template>
  <v-container fluid class="d-flex justify-space-between">
    <v-card
      class="rounded-xl"
      outlined
      elevation="0"
      min-width="350"
      width="30%"
    >
      <v-card-text>
        <v-form ref="form" v-model="formValid">
          <v-autocomplete
            :rules="[(v) => !!v || 'Required']"
            rounded
            outlined
            dense
            :items="databases"
            item-text="displayName"
            item-value="value"
            label="Database"
            @change="getAttributes"
            v-model="selectedDatabase"
            return-object
            required
          ></v-autocomplete>

          <v-autocomplete
            :rules="[(v) => !!v || 'Required']"
            rounded
            outlined
            dense
            :items="automationTypes"
            item-text="displayName"
            item-value="value"
            label="Automation Type"
            v-model="autoType"
            required
          ></v-autocomplete>
          <h2 v-if="autoType == 'conditionSet'" class="mb-1">Condition</h2>
          <v-autocomplete
            v-if="autoType == 'conditionSet'"
            rounded
            outlined
            dense
            :items="conFields"
            item-text="displayName"
            return-object
            label="Condition Field"
            v-model="conField"
          ></v-autocomplete>
          <v-autocomplete
            v-if="isSingleSelect(conField) && autoType == 'conditionSet'"
            rounded
            outlined
            dense
            :items="conValues"
            :item-text="getValueText"
            label="Condition Value"
            return-object
            v-model="conValue"
          ></v-autocomplete>
          <h2 class="mb-1">Action</h2>
          <div>
            <v-autocomplete
              v-if="autoType != 'link'"
              :rules="[(v) => !!v || 'Required']"
              rounded
              outlined
              dense
              :items="actFields"
              item-text="displayName"
              return-object
              label="Action Field"
              v-model="actField"
              required
            ></v-autocomplete>
          </div>
          <div v-if="autoType != 'required'">
            <v-autocomplete
              v-if="isSingleSelect(actField)"
              rounded
              outlined
              dense
              :items="actValues"
              :item-text="getValueText"
              label="Action Value"
              return-object
              v-model="actValue"
            ></v-autocomplete>
            <v-autocomplete
              v-else-if="isMultipleSelect(actField)"
              rounded
              outlined
              dense
              :items="actValues"
              :item-text="getValueText"
              label="Action Value"
              return-object
              multiple
              v-model="actValue"
            ></v-autocomplete>
            <v-textarea
              v-else-if="isSingleLine(actField) || isMultipleLines(actField)"
              rounded
              outlined
              dense
              v-model="actValue"
              label="Action Value"
            ></v-textarea>
            <v-text-field
              rounded
              outlined
              dense
              v-else-if="isNumber(actField)"
              v-model.number="actValue"
              label="Action Value"
            ></v-text-field>
            <v-text-field
              v-if="autoType == 'link'"
              label="Button Name"
              v-model="btnName"
            ></v-text-field>
            <v-textarea
              v-if="autoType == 'link'"
              label="Link"
              v-model="link"
            ></v-textarea>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-space-between mt-2">
        <v-btn rounded color="warning" depressed>
          <i class="fas fa-save mr-2"></i>
          Reset
        </v-btn>

        <v-btn v-if="isUpdating" rounded class="primary" depressed>
          <i class="fas fa-save mr-2"></i>
          Update
        </v-btn>
        <v-btn
          v-else
          rounded
          class="primary"
          @click="addAutomation"
          depressed
          :disabled="!formValid"
          :loading="isLoading"
        >
          <i class="fas fa-plus mr-2"></i>
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      class="rounded-xl"
      outlined
      elevation="0"
      min-width="350"
      width="68%"
    >
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>Type</th>
                <th>Cond Field</th>
                <th>Cond Value</th>
                <th>Act Field</th>
                <th>Act Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="text-left"
                v-for="auto in automations"
                :key="auto._id"
                @click="getAutomationToUpdate(auto)"
              >
                <td>{{ auto.type }}</td>
                <td>{{ getConField(auto.conField) }}</td>
                <td>
                  {{ getConValue(auto.conField, auto.conValue) }}
                </td>
                <td>{{ getActField(auto.actField) }}</td>
                <td>
                  {{ getActValue(auto.actField, auto.actValue) }}
                </td>
                <td>{{ auto.isActive }}</td>
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
import formMixin from "@/js/form-mixin.js";
export default {
  name: "AutomationSection",
  data() {
    return {
      automations: [],
      actField: null,
      actValue: null,
      btnName: "",
      conField: null,
      conValue: null,
      formValid: false,
      link: "",
      users: [],
      selectedDatabase: null,
      isUpdating: false,
    };
  },
  mixins: [formMixin],
  computed: {
    actFields() {
      return this.conFields;
    },
    actValues() {
      if (this.actField && this.actField.value) {
        if (
          this.actField.type == "singleSelect" ||
          this.actField.type == "multipleSelect"
        ) {
          return this.fieldToChoices[this.actField.value];
        } else if (
          this.actField.type == "singleUser" ||
          this.actField.type == "multipleUsers"
        ) {
          return this.users;
        } else {
          return [];
        }
      } else {
        return [];
      }
    },
    automationTypes() {
      return this.$store.getters["dropdowns"]["autoType"];
    },
    conFields() {
      if (this.databaseValue) {
        return this.databaseToFields[this.databaseValue];
      } else {
        return [];
      }
    },
    conValues() {
      if (this.conField && this.conField.value) {
        if (
          this.conField.type == "singleSelect" ||
          this.conField.type == "multipleSelect"
        )
          return this.fieldToChoices[this.conField.value];
        else if (
          this.conField.type == "singleUser" ||
          this.conField.type == "multipleUsers"
        ) {
          return this.users;
        } else {
          return [];
        }
      } else {
        return [];
      }
    },
    databases() {
      return this.$store.getters["allDatabases"];
    },
    databaseToFields() {
      return this.$store.getters["databaseToFields"];
    },
    databaseToChoices() {
      return this.$store.getters["databaseToChoices"];
    },
    databaseValue() {
      if (this.selectedDatabase && this.selectedDatabase.value) {
        return this.selectedDatabase.value;
      }
      return null;
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
  },
  methods: {
    addAutomation() {
      if (
        this.autoType != "link" &&
        this.conField &&
        this.actField &&
        this.conField._id == this.actField._id
      ) {
        eventBus.$emit(
          "setSnackbar",
          "Condition field and Action field can't be the same field",
          "error"
        );
        return;
      }
      let automation = {};
      automation.type = this.autoType;
      automation.database = this.databaseValue;
      automation.conField = this.conField;
      automation.conValue = this.conValue;
      automation.actField = this.actField;
      automation.actValue = this.actValue;
      automation.btnName = this.btnName;
      automation.link = this.link;
      this.isLoading = true;
      backendService.addAutomation(automation).then(() => {
        setTimeout(() => {
          this.automations.push(automation);
          this.autoType = "";
          this.conField = null;
          this.conValue = null;
          this.actField = null;
          this.actValue = null;
          this.$refs.form.reset();
          eventBus.$emit(
            "setSnackbar",
            "Successfully added automation",
            "success"
          );
          this.isLoading = false;
        }, 1000);
      });
    },
    getActField(actField) {
      return this.getConField(actField);
    },
    getActValue(actField, actValue) {
      return this.getConValue(actField, actValue);
    },
    getAttributes() {
      this.getAutomations();
      this.getUsers();
    },
    getAutomations() {
      if (this.databaseValue)
        backendService
          .getAutomationsByDatabase(this.databaseValue)
          .then((response) => {
            this.automations = response.data;
          });
    },
    getAutomationToUpdate(automation) {
      this.autoType = automation.type;
      this.conField = automation.conField;
      this.conValue = automation.conValue;
      this.actField = automation.actField;
      this.actValue = automation.actValue;
    },
    getConValue(conField, conValue) {
      if (
        !conField ||
        !conField.displayName ||
        !conValue ||
        (!conValue && !conValue.value && !conValue.username)
      )
        return "";
      if (conField.type == "singleSelect" || conField.type == "multipleSelect")
        return conValue.displayName;
      else if (
        conField.type == "singleUser" ||
        conField.type == "multipleUsers"
      )
        return conValue.username;
      else return conValue;
    },
    getConField(conField) {
      if (!conField || !conField.displayName) return "";
      else if (conField && conField.displayName) {
        return conField.displayName;
      } else {
        return "";
      }
    },
    getUsers() {
      if (this.databaseValue)
        backendService
          .getUsersByDatabase(this.databaseValue)
          .then((response) => {
            this.users = response.data;
          });
    },
    getValueText(obj) {
      if (obj.username) {
        return `${obj.first} ${obj.last} - ${obj.username}`;
      } else {
        return obj.displayName;
      }
    },

    isMultipleLines(field) {
      return field && field.type == "multipleLines";
    },
    isMultipleSelect(field) {
      return (
        field &&
        (field.type == "multipleSelect" || field.type == "multipleUsers")
      );
    },
    isNumber(field) {
      return field && field.type == "number";
    },
    isSingleLine(field) {
      return field && field.type == "singleLine";
    },
    isSingleSelect(field) {
      return (
        field && (field.type == "singleSelect" || field.type == "singleUser")
      );
    },
  },
};
</script>
