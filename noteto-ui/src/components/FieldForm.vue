<template>
  <v-container class="field-form-panel">
    <div class="field-form-grid">
      <div>
        <v-autocomplete
          dense
          outlined
          :hide-details="false"
          :rules="[(v) => !!v || '']"
          :items="fieldTypes"
          item-text="displayName"
          item-value="value"
          label="Field Type"
          v-model="field.type"
        ></v-autocomplete>
      </div>
      <div>
        <v-text-field
          dense
          outlined
          :hide-details="false"
          :rules="[(v) => !!v || '']"
          label="Display Name"
          v-model="field.displayName"
          @focus="rememberFieldDisplayName"
          @input="syncFieldValue"
        ></v-text-field>
      </div>
      <div v-if="showValue">
        <v-text-field
          dense
          outlined
          :hide-details="false"
          :rules="[(v) => !!v || '']"
          label="Field Value"
          v-model="field.value"
        ></v-text-field>
      </div>
    </div>
    <div
      class="choice-section"
      v-if="field.type == 'singleSelect' || field.type == 'multipleSelect'"
    >
      <div
        v-for="(choice, idx) in field.choices"
        :key="`choice-${idx}`"
        class="nested-choice-row"
      >
        <v-text-field
          dense
          outlined
          :hide-details="false"
          :rules="choiceDisplayNameRules(choice)"
          label="Choice Display Name"
          v-model="choice.displayName"
          @focus="rememberChoiceDisplayName(choice)"
          @input="syncChoiceValue(choice)"
        ></v-text-field>
        <v-text-field
          v-if="showValue"
          dense
          outlined
          :hide-details="false"
          :rules="choiceValueRules(choice)"
          label="Choice Value"
          v-model="choice.value"
        ></v-text-field>
        <v-btn
          color="error"
          depressed
          icon
          @click="field.choices.splice(idx, 1)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="d-flex justify-end">
        <v-btn
          depressed
          color="primary"
          @click="addChoice"
        >
          <v-icon left>mdi-plus</v-icon>
          Choice
        </v-btn>
      </div>
    </div>
    <div v-if="field.type == 'list'" class="subfield-section">
      <div class="text-h6 mb-2">Sub Fields</div>
      <div
        v-for="(listField, idx) in field.listFields"
        :key="`listField-${idx}`"
        class="subfield-row"
      >
        <div class="subfield-remove">
          <v-btn
            color="error"
            depressed
            icon
            @click="field.listFields.splice(idx, 1)"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
        <field-form
          v-model="field.listFields[idx]"
          :lvl="lvl + 1"
          :show-value="showValue"
        ></field-form>
      </div>

      <div class="d-flex justify-end">
        <v-btn
          color="primary"
          depressed
          @click="addListField"
        >
          <v-icon left>mdi-plus</v-icon>
          Sub Field
        </v-btn>
      </div>
    </div>
  </v-container>
</template>
<script>
import _ from "lodash";

export default {
  name: "FieldForm",
  components: { "field-form": () => import("@/components/FieldForm.vue") },
  data() {
    return {
      lastFieldDisplayName: "",
    };
  },
  props: {
    lvl: {
      type: Number,
      default: () => {
        return 0;
      },
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    showValue: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
  },
  computed: {
    field: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    fieldTypes() {
      if (this.lvl > 0) {
        return (this.$store.getters["dropdowns"]["fieldType"] || []).filter(
          (e) => e.value != "list"
        );
      } else {
        return this.$store.getters["dropdowns"]["fieldType"] || [];
      }
    },
  },
  methods: {
    addChoice() {
      if (!this.field.choices) this.$set(this.field, "choices", []);
      this.field.choices.push({});
    },
    addListField() {
      if (!this.field.listFields) this.$set(this.field, "listFields", []);
      this.field.listFields.push({ choices: [] });
    },
    choiceDisplayNameRules(choice) {
      return [
        (value) => this.hasText(value) || "Required",
        (value) =>
          !this.hasDuplicateChoiceProperty(choice, value, "displayName") ||
          "Duplicate display name",
      ];
    },
    choiceValueRules(choice) {
      return [
        (value) => this.hasText(value) || "Required",
        (value) =>
          !this.hasDuplicateChoiceProperty(choice, value, "value") ||
          "Duplicate value",
      ];
    },
    hasDuplicateChoiceProperty(choice, value, property) {
      if (!this.hasText(value)) return false;
      const normalizedValue = String(value).trim().toLowerCase();
      return (this.field.choices || []).some((item) => {
        return (
          item !== choice &&
          this.hasText(item[property]) &&
          String(item[property]).trim().toLowerCase() == normalizedValue
        );
      });
    },
    hasText(value) {
      return Boolean(value && String(value).trim());
    },
    rememberChoiceDisplayName(choice) {
      this.setLastChoiceDisplayName(choice, choice.displayName || "");
    },
    rememberFieldDisplayName() {
      this.lastFieldDisplayName = this.field.displayName || "";
    },
    setLastChoiceDisplayName(choice, displayName) {
      Object.defineProperty(choice, "_lastDisplayName", {
        value: displayName,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    },
    syncChoiceValue(choice) {
      const previousValue = _.camelCase(choice._lastDisplayName || "");
      if (
        (!this.hasText(choice.value) || choice.value == previousValue)
      ) {
        choice.value = _.camelCase(choice.displayName);
      }
      this.setLastChoiceDisplayName(choice, choice.displayName || "");
    },
    syncFieldValue(value) {
      if (!this.showValue) return;
      const previousValue = _.camelCase(this.lastFieldDisplayName || "");
      if (
        (!this.hasText(this.field.value) || this.field.value == previousValue)
      ) {
        this.field.value = _.camelCase(value);
      }
      this.lastFieldDisplayName = value || "";
    },
  },
  watch: {
    "field.displayName": function (newValue, oldValue) {
      if (!this.showValue) return;
      const previousValue = _.camelCase(oldValue || "");
      if (
        (!this.hasText(this.field.value) || this.field.value == previousValue)
      ) {
        this.field.value = _.camelCase(newValue);
      }
      this.lastFieldDisplayName = newValue || "";
    },
  },
};
</script>
<style scoped>
.field-form-panel {
  border: 1px solid rgba(31, 41, 51, 0.14);
  border-radius: 8px;
  padding: 12px;
  width: 100%;
}

.field-form-grid,
.nested-choice-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

.choice-section,
.subfield-section {
  margin-top: 12px;
}

.subfield-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  margin-bottom: 12px;
}

.subfield-remove {
  padding-top: 2px;
}

@media only screen and (max-width: 960px) {
  .field-form-grid,
  .nested-choice-row,
  .subfield-row {
    grid-template-columns: 1fr;
  }
}
</style>
