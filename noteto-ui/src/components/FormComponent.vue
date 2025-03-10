<template>
  <v-container class="pa-0">
    <v-container
      class="d-flex"
      v-for="(row, idxI) in pRows"
      :key="`row-${idxI}`">
      <v-container
        class="py-0"
        v-for="(col, idxJ) in row.cols"
        :key="`col-${idxJ}`">
        <v-text-field
          rounded
          outlined
          dense
          v-if="fieldToField[col.field]?.type === 'singleLine'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          :readonly="readonly"></v-text-field>
        <decimal-field
          v-else-if="fieldToField[col.field]?.type === 'currencyInDollar'"
          :label="fieldToField[col.field]?.displayName"
          prefix="$"
          v-model="value[col.field]"
          :readonly="readonly"></decimal-field>
        <decimal-field
          v-else-if="fieldToField[col.field]?.type === 'weightInLb'"
          :label="fieldToField[col.field]?.displayName"
          suffix="Lbs"
          v-model="value[col.field]"
          :readonly="readonly"></decimal-field>
        <decimal-field
          v-else-if="fieldToField[col.field]?.type === 'weightInKg'"
          :label="fieldToField[col.field]?.displayName"
          suffix="Kg"
          v-model="value[col.field]"
          :readonly="readonly"></decimal-field>
        <v-text-field
          rounded
          outlined
          dense
          v-else-if="fieldToField[col.field]?.type === 'number'"
          :label="fieldToField[col.field]?.displayName"
          v-model.number="value[col.field]"
          :readonly="readonly"></v-text-field>
        <v-textarea
          rounded
          outlined
          dense
          v-else-if="fieldToField[col.field]?.type === 'multipleLines'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          :readonly="readonly"></v-textarea>
        <v-autocomplete
          rounded
          outlined
          dense
          @change="automate(col.field)"
          v-else-if="fieldToField[col.field]?.type === 'singleSelect'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          :items="fieldToChoices[col.field]"
          item-text="displayName"
          return-object
          small-chips
          deletable-chips
          :readonly="readonly"></v-autocomplete>
        <v-autocomplete
          rounded
          outlined
          dense
          v-else-if="fieldToField[col.field]?.type === 'multipleSelect'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          :items="fieldToChoices[col.field]"
          item-text="displayName"
          return-object
          multiple
          small-chips
          deletable-chips
          :readonly="readonly"></v-autocomplete>
        <v-autocomplete
          rounded
          outlined
          dense
          @change="automate(col.field)"
          v-else-if="fieldToField[col.field]?.type === 'singleUser'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          return-object
          :items="users"
          :item-text="getFullName"
          :readonly="readonly"></v-autocomplete>
        <v-autocomplete
          rounded
          outlined
          dense
          v-else-if="fieldToField[col.field]?.type === 'multipleUsers'"
          :label="fieldToField[col.field]?.displayName"
          v-model="value[col.field]"
          return-object
          :items="users"
          :item-text="getFullName"
          deletable-chipsoutlined
          multiple
          chips
          deletable-chips
          :readonly="readonly"></v-autocomplete>
        <v-menu
          v-else-if="fieldToField[col.field]?.type === 'date'"
          v-model="datePicker[col.field]"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              rounded
              outlined
              dense
              :value="formatDate(value[col.field])"
              :label="fieldToField[col.field]?.displayName"
              persistent-hint
              prepend-icon="mdi-calendar"
              v-bind="attrs"
              v-on="on"
              :readonly="readonly"></v-text-field>
          </template>
          <v-date-picker
            v-model="value[col.field]"
            no-title
            @input="datePicker[col.field] = false"></v-date-picker>
        </v-menu>
        <div v-else-if="fieldToField[col.field]?.type === 'list'">
          <v-container class="mx-3">
            <h2>{{ fieldToField[col.field]?.displayName }}</h2>
          </v-container>
          <div
            v-for="(lRow, lIdxI) in entry[col.field]"
            :key="`lRow-${lIdxI}`"
            class="d-flex">
            <form-component
              :entry="value[col.field][lIdxI]"
              :p-rows="getRowsFromListField(entry, col.field)">
            </form-component>
            <div class="d-flex justify-end" style="width: 10%">
              <v-btn
                rounded
                color="error mt-2"
                depressed
                @click="removeFromList(lIdxI, col.field)">
                <i class="fas fa-trash-alt"></i>
              </v-btn>
            </div>
          </div>
          <v-container>
            <v-row>
              <v-col>
                <v-btn
                  rounded
                  color="primary ml-2"
                  depressed
                  @click="addRowIntoList(col.field)">
                  <i class="fas fa-plus mr-2"></i>
                  Add
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-container>
    </v-container>
  </v-container>
</template>
<script>
import DecimalField from "@/components/DecimalField.vue";
import mixin from "@/js/mixin.js";
import { readonly } from "vue";
export default {
  name: "FormComponent",
  mixins: [mixin],
  components: { "decimal-field": DecimalField },
  props: {
    entry: {
      type: Object,
      default: () => {
        return {};
      },
    },
    pRows: {
      type: Array,
      default: () => {
        return [];
      },
    },
    readonly: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  data() {
    return {
      datePicker: {},
    };
  },
  computed: {
    value: {
      get() {
        return this.entry;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    getRowsFromListField(entry, field) {
      let rows = [];
      let listFields = this.fieldToField[field].listFields;
      let cols = [];
      readonly;
      for (let j = 0; j < listFields.length; j++) {
        let col = {
          field: listFields[j].value,
          label: "",
        };
        cols.push(col);
      }
      let row = { cols };
      rows.push(row);
      return rows;
    },
  },
};
</script>
<style></style>
