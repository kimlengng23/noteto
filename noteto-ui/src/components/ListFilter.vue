<template>
  <v-card class="rounded-lg" elevation="0" outlined>
    <v-card-title class="list-panel-title">
      <div>
        <div>Filters</div>
        <small>Create saved filter sets for this records table.</small>
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
        return-object
        label="Filter Set"
        :items="filterSets"
        item-text="name"
        v-model="filterSet"
        @change="handleChange"
      ></v-autocomplete>
      <v-btn
        depressed
        color="success"
        @click="setFavoriteFilterSet"
        :loading="isUpdateLoading"
        :disabled="!validFilterSet"
      >
        <v-icon left>mdi-star-outline</v-icon>
        Favorite
      </v-btn>
      <v-btn
        icon
        color="primary"
        :disabled="!validFilterSet"
        @click="$store.dispatch('getEntriesByDatabase')"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        icon
        color="primary"
        :disabled="!validFilterSet"
        @click="openForm"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      <v-btn icon color="primary" @click="openForm(false)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
    <v-expand-transition>
      <v-form v-if="isFormOpen" ref="form" v-model="formValid">
        <div class="filter-form-grid">
          <v-text-field
            :rules="[(v) => !!v || '']"
            dense
            outlined
            hide-details
            label="Filter Name"
            v-model="filterSet.name"
          ></v-text-field
          ><v-autocomplete
            :rules="[(v) => (v != undefined && v != null) || '']"
            dense
            outlined
            hide-details
            label="Public"
            :items="[
              { text: 'Yes', value: true },
              { text: 'No', value: false },
            ]"
            v-model="filterSet.isPublic"
          ></v-autocomplete>
        </div>
        <div
          v-for="(condition, idx) in conditions"
          :key="`condition-${idx}`"
          class="condition-row"
        >
          <div>
            <v-autocomplete
              :rules="[(v) => !!v || '']"
              dense
              outlined
              return-object
              hide-details
              label="Field"
              :items="fields"
              :item-text="getFieldText"
              v-model="condition.field"
              @change="condition.value = null"
            ></v-autocomplete>
          </div>
          <div>
            <v-autocomplete
              :rules="[(v) => !!v || '']"
              dense
              outlined
              hide-details
              return-object
              label="Operator"
              :items="getOperatorsByFieldType(condition.field?.type)"
              item-text="displayName"
              v-model="condition.operator"
            >
            </v-autocomplete>
          </div>
          <div
            v-if="
              condition.field?.type == 'singleSelect' ||
              condition.field?.type == 'multipleSelect'
            "
          >
            <v-autocomplete
              :rules="[(v) => !!v || '']"
              dense
              outlined
              :items="getChoicesByField(condition.field?.value)"
              label="Value"
              item-text="displayName"
              multiple
              hide-details
              v-model="condition.value"
            ></v-autocomplete>
          </div>

          <div v-else-if="condition.field?.type == 'date'">
            <date-picker
              :rules="[(v) => !!v || '']"
              v-model="condition.value"
            ></date-picker>
          </div>
          <div v-else-if="condition.field?.type == 'number'">
            <v-text-field
              :rules="[(v) => !!v || '']"
              outlined
              dense
              hide-details
              label="Value"
              v-model.number="condition.value"
            ></v-text-field>
          </div>
          <div v-else></div>
          <div class="condition-actions">
            <v-btn depressed icon color="red" @click="removeCondition(idx)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="filter-actions">
          <v-btn depressed color="primary" @click="addCondition">
            <v-icon left>mdi-plus</v-icon>
            <span>Condition</span>
          </v-btn>
          <v-btn
            v-if="isUpdating"
            depressed
            color="warning"
            :loading="isUpdateLoading"
            :disabled="!formValid"
            @click="updateFilterSet"
          >
            <v-icon left>mdi-content-save</v-icon>
            <span>Update Filter Set</span>
          </v-btn>
          <v-btn
            v-else
            depressed
            color="primary"
            :loading="isAddLoading"
            :disabled="!formValid"
            @click="addFilterSet"
          >
            <v-icon left>mdi-plus</v-icon>
            <span>Add Filter Set</span>
          </v-btn>
        </div>
        <v-container class="bg-grey lighten-4 rounded-lg">
          <pre>{{ filter }}</pre>
        </v-container>
      </v-form>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>
<script>
import backendService from "@/services/backend-service.js";
import DatePicker from "@/components/DatePicker.vue";
import generalMixin from "@/js/general-mixin";
import mixin from "@/js/mixin";
export default {
  name: "ListFilter",
  mixins: [generalMixin, mixin],
  components: { "date-picker": DatePicker },
  mounted: function () {
    this.filterSet = this.currentFilterSet;
  },
  computed: {
    currentFilterSet() {
      return this.$store.getters["currentFilterSet"];
    },
    choices() {
      return (
        this.$store.getters["databaseToChoices"][this.currentDatabase.value] ||
        []
      );
    },
    databaseToFilterSets() {
      return this.$store.getters["databaseToFilterSets"];
    },
    fields() {
      let fields = (
        this.$store.getters["databaseToFields"][this.currentDatabase.value] ||
        []
      ).filter(
        (e) =>
          e.type == "singleSelect" ||
          e.type == "multipleSelect" ||
          e.type == "date"
      );
      return fields.concat(this.defaultFields);
    },
    filter() {
      const filter = {};
      this.conditions.forEach(({ field, operator, value }) => {
        if (!field || !operator || !value) return;
        let parsedValue = value;
        try {
          if (!isNaN(Number(value))) {
            parsedValue = Number(value);
          }
        } catch (error) {
          console.log(error);
        }
        let fieldKey = field.value;
        if (field.type == "singleSelect") {
          fieldKey += `.value`;
        }
        if (!filter[fieldKey]) filter[fieldKey] = {};
        filter[fieldKey][operator.value] = parsedValue;
      });
      return JSON.stringify(filter, null, 2);
    },
    filterSets() {
      if (this.currentDatabase && this.currentDatabase.value) {
        const filterSets =
          this.databaseToFilterSets[this.currentDatabase.value];
        if (filterSets && filterSets.length > 0)
          return filterSets.filter(
            (e) =>
              e.isPublic ||
              (e.createdBy && e.createdBy._id == this.currentUser.userId)
          );
      }
      return [];
    },
    validFilterSet() {
      return this.filterSet && this.filterSet.name;
    },
  },
  data() {
    return {
      conditions: [],
      operatorDict: {
        singleSelect: [
          { value: "$in", displayName: "In" },
          { value: "$nin", displayName: "Not in" },
        ],
        multipleSelect: [
          { value: "$in", displayName: "In" },
          { value: "$nin", displayName: "Not in" },
        ],
        date: [
          { value: "$eq", displayName: "Equal to" },
          { value: "$gt", displayName: "Greater than" },
          { value: "$gte", displayName: "Greater than or Equal to" },
          { value: "$lt", displayName: "Less than" },
          { value: "$lte", displayName: "Less than or Equal to" },
        ],
        number: [
          { value: "$eq", displayName: "Equal to" },
          { value: "$ne", displayName: "Not Equal to" },
          { value: "$gt", displayName: "Greater than" },
          { value: "$gte", displayName: "Greater than or Equal to" },
          { value: "$lt", displayName: "Less than" },
          { value: "$lte", displayName: "Less than or Equal to" },
        ],
        currencyInDollar: [
          { value: "$eq", displayName: "Equal to" },
          { value: "$ne", displayName: "Not Equal to" },
          { value: "$gt", displayName: "Greater than" },
          { value: "$gte", displayName: "Greater than or Equal to" },
          { value: "$lt", displayName: "Less than" },
          { value: "$lte", displayName: "Less than or Equal to" },
        ],
      },
      // operators: [
      //   { value: "$eq", displayName: "Equal to" },
      //   { value: "$ne", displayName: "Not Equal to" },
      //   { value: "$gt", displayName: "Greater than" },
      //   { value: "$gte", displayName: "Greater than or Equal to" },
      //   { value: "$lt", displayName: "Less than" },
      //   { value: "$lte", displayName: "Less than or Equal to" },
      //   { value: "$in", displayName: "In" },
      //   { value: "$nin", displayName: "Not in" },
      // ],
      defaultFields: [
        {
          value: "_data.id",
          displayName: "Id",
          type: "number",
        },
        {
          value: "_data.createdBy",
          displayName: "Created By",
          type: "singleUser",
        },
        {
          value: "_data.dateCreated",
          displayName: "Date Created",
          type: "date",
        },
      ],
      isFormOpen: false,
      isUpdating: false,
      filterSet: null,
      isAddLoading: false,
      isUpdateLoading: false,
      formValid: false,
    };
  },
  methods: {
    addFilterSet() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.isAddLoading = true;
      this.filterSet.database = this.currentDatabase.value;
      this.filterSet.conditions = this.filter;
      backendService.addFilterSet(this.filterSet).then((response) => {
        this.timer(1000).then(() => {
          this.$store.commit("addFilterSet", response.data);
          this.isAddLoading = false;
          this.filterSet = {};
          this.successSnackbar("Successfully added new filter set");
        });
      });
    },
    addCondition() {
      this.conditions.push({ field: null, operator: null, value: null });
    },
    getChoicesByField(field) {
      if (field) return this.choices.filter((e) => e.field == field);
      return [];
    },
    getFieldText(field) {
      return `${field.displayName} - ${field.type}`;
    },
    getOperatorsByFieldType(fieldType) {
      if (fieldType && this.operatorDict[fieldType]) {
        return this.operatorDict[fieldType];
      }
      return [];
    },
    handleChange() {
      this.$store.commit("setCurrentFilterSet", this.filterSet);
    },
    openForm(isUpdating = false) {
      if (isUpdating) {
        this.isFormOpen = true;
        this.isUpdating = true;
        let filter = JSON.parse(this.filterSet.conditions);
        let fields = Object.keys(filter);
        let conditions = [];
        for (let i = 0; i < fields.length; i++) {
          let rawField = fields[i];
          let field = rawField.split(".")[0];
          let rawConditions = filter[rawField];
          let operators = Object.keys(rawConditions);
          for (let j = 0; j < operators.length; j++) {
            let operator = operators[j];
            let condition = {};
            if (field[0] == "_") {
              condition = {
                field: this.defaultFields.find((e) => e.value == rawField),
                operator: { value: operator },
                value: rawConditions[operator],
              };
            } else {
              condition = {
                field: this.fieldToField[field],
                operator: { value: operator },
                value: rawConditions[operator],
              };
            }
            conditions.push(condition);
          }
        }
        this.conditions = conditions;
      } else {
        this.isFormOpen = true;
        this.isUpdating = false;
        this.filterSet = { isPublic: false };
      }
    },
    removeCondition(idx) {
      this.conditions.splice(idx, 1);
    },
    setFavoriteFilterSet() {
      this.isUpdateLoading = true;
      let favorite = {
        id: this.filterSet._id,
        database: this.currentDatabase.value,
      };
      backendService
        .setFavoriteFilterSet(favorite)
        .then(() => {
          this.timer(1000).then(() => {
            this.filterSets.forEach((e) => (e.isFavorite = false));
            this.filterSet.isFavorite = true;
            this.isUpdateLoading = false;
            this.$forceUpdate();
            this.successSnackbar("Successfully set favorite filter set");
          });
        })
        .catch(() => {
          this.timer(1000).then(() => {
            this.isUpdateLoading = false;
            this.errorSnackbar("Ops! Something is not right");
          });
        });
    },
    updateFilterSet() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.isUpdateLoading = true;
      this.filterSet.conditions = this.filter;
      backendService
        .updateFilterSet(this.filterSet)
        .then(() => {
          this.timer(1000).then(() => {
            this.isUpdating = false;
            this.isFormOpen = false;
            this.isUpdateLoading = false;
            this.successSnackbar("Successfully updated filter set");
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
  grid-template-columns: minmax(240px, 1fr) max-content max-content max-content max-content;
  gap: 10px;
  align-items: start;
}

.filter-form-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(160px, 240px);
  gap: 10px;
  margin-bottom: 14px;
}

.condition-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) max-content;
  gap: 10px;
  align-items: start;
}

.condition-actions {
  display: flex;
  justify-content: flex-end;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 12px 0;
}

@media only screen and (max-width: 960px) {
  .list-toolbar,
  .filter-form-grid,
  .condition-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
