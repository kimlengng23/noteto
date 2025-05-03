<template>
  <v-container class="white rounded-xl">
    <div class="d-flex flex-wrap flex-md-nowrap flex-lg-nowrap mb-2">
      <v-autocomplete
        rounded
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
        rounded
        depressed
        color="success"
        class="ml-2 mr-1"
        @click="setFavoriteFilterSet"
        :loading="isUpdateLoading"
        :disabled="!validFilterSet"
      >
        <i class="far fa-star mr-1"></i>
        Favorite
      </v-btn>
      <v-btn
        rounded
        icon
        color="primary"
        class="mr-1"
        :disabled="!validFilterSet"
        @click="$store.dispatch('getEntriesByDatabase')"
      >
        <i class="fas fa-sync"></i>
      </v-btn>
      <v-btn
        rounded
        icon
        color="primary"
        class="mr-1"
        :disabled="!validFilterSet"
        @click="openForm"
      >
        <i class="fas fa-cog"></i>
      </v-btn>
      <v-btn rounded icon color="primary" @click="openForm(false)">
        <i class="fas fa-plus"></i>
      </v-btn>
    </div>
    <v-expand-transition>
      <div v-if="isFormOpen">
        <div class="d-flex">
          <v-text-field
            class="mr-1"
            rounded
            dense
            outlined
            hide-details
            label="Fitler Name"
            v-model="filterSet.name"
          ></v-text-field
          ><v-autocomplete
            rounded
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
          class="d-flex justify-space-between"
          style="gap: 5px"
        >
          <v-container class="pl-0">
            <v-autocomplete
              rounded
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
          </v-container>
          <v-container>
            <v-autocomplete
              rounded
              dense
              outlined
              hide-details
              return-object
              label="Operator"
              :items="operators"
              item-text="displayName"
              v-model="condition.operator"
            >
            </v-autocomplete>
          </v-container>
          <v-container
            v-if="
              condition.field?.type == 'singleSelect' ||
              condition.field?.type == 'multipleSelect'
            "
            class="pr-0"
          >
            <v-autocomplete
              rounded
              dense
              outlined
              :items="getChoicesByField(condition.field?.value)"
              label="Value"
              item-text="displayName"
              multiple
              hide-details
              v-model="condition.value"
            ></v-autocomplete>
          </v-container>

          <v-container v-if="condition.field?.type == 'date'" class="pr-0">
            <date-picker v-model="condition.value"></date-picker>
          </v-container>
          <v-container style="width: 25%"
            ><v-btn
              rounded
              depressed
              icon
              color="red"
              @click="removeCondition(idx)"
            >
              <i class="fas fa-times"></i></v-btn
          ></v-container>
        </div>
        <v-container class="d-flex justify-space-between">
          <v-btn rounded depressed color="primary" @click="addCondition">
            <i class="fas fa-plus mr-1"></i>
            <span>Condition</span> </v-btn
          ><v-btn
            v-if="isUpdating"
            rounded
            depressed
            color="warning"
            @click="updateFilterSet"
            :loading="isUpdateLoading"
          >
            <i class="fa fa-save mr-1"></i>
            <span>Update Filter Set</span>
          </v-btn>
          <v-btn
            v-else
            rounded
            depressed
            color="primary"
            @click="addFilterSet"
            :loading="isAddLoading"
          >
            <i class="fas fa-plus mr-1"></i>
            <span>Add Filter Set</span>
          </v-btn>
        </v-container>
        <v-container class="bg-grey lighten-4 rounded-xl">
          <pre>{{ filter }}</pre>
        </v-container>
      </div>
    </v-expand-transition>
  </v-container>
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
      return this.$store.getters["databaseToChoices"][
        this.currentDatabase.value
      ];
    },
    databaseToFilterSets() {
      return this.$store.getters["databaseToFilterSets"];
    },
    fields() {
      let fields = this.$store.getters["databaseToFields"][
        this.currentDatabase.value
      ].filter(
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
            (e) => e.createdBy._id == this.currentUser.userId
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
      operators: [
        { value: "$eq", displayName: "Equal to" },
        { value: "$ne", displayName: "Not Equal to" },
        { value: "$gt", displayName: "Greater than" },
        { value: "$gte", displayName: "Greater than or Equal to" },
        { value: "$lt", displayName: "Less than" },
        { value: "$lte", displayName: "Less than or Equal to" },
        { value: "$in", displayName: "In" },
        { value: "$nin", displayName: "Not in" },
      ],
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
    };
  },
  methods: {
    addFilterSet() {
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
