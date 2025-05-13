<template>
  <v-container class="outlined rounded-xl">
    <v-container class="d-flex justify-space-around pa-0 mb-2" style="gap: 2px">
      <v-container class="pa-0">
        <v-autocomplete
          rounded
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || '']"
          :items="fieldTypes"
          item-text="displayName"
          item-value="value"
          label="Field Type"
          v-model="field.type"
        ></v-autocomplete>
      </v-container>
      <v-container class="pa-0">
        <v-text-field
          rounded
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || '']"
          label="Display Name"
          v-model="field.displayName"
        ></v-text-field>
      </v-container>
      <v-container v-if="showValue" class="pa-0">
        <v-text-field
          rounded
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || '']"
          label="Field Value"
          v-model="field.value"
        ></v-text-field>
      </v-container>
    </v-container>
    <v-container
      class="pa-0"
      v-if="field.type == 'singleSelect' || field.type == 'multipleSelect'"
    >
      <div
        v-for="(choice, idx) in field.choices"
        :key="`choice-${idx}`"
        class="d-flex"
        style="gap: 2px"
      >
        <v-text-field
          class="mb-1"
          rounded
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || '']"
          label="Choice"
          v-model="choice.displayName"
        ></v-text-field>
        <v-text-field
          v-if="showValue"
          class="mb-1"
          rounded
          dense
          outlined
          hide-details
          :rules="[(v) => !!v || '']"
          label="Choice"
          v-model="choice.value"
        ></v-text-field>
        <v-btn
          color="error"
          rounded
          depressed
          icon
          @click="field.choices.splice(idx, 1)"
        >
          <i class="fas fa-times"></i>
        </v-btn>
      </div>
      <div class="d-flex justify-end">
        <v-btn
          rounded
          depressed
          color="primary"
          @click="field.choices.push({})"
        >
          <i class="fas fa-plus mr-1"></i>
          Choice
        </v-btn>
      </div>
    </v-container>
    <v-container v-if="field.type == 'list'">
      <v-container class="text-h6 pa-0">Sub Fields</v-container>
      <div
        v-for="(listField, idx) in field.listFields"
        :key="`listField-${idx}`"
        class="d-flex align-center mb-2"
      >
        <div class="px-1">
          <v-btn
            color="error"
            rounded
            depressed
            dense
            @click="field.listFields.splice(idx, 1)"
          >
            <i class="fas fa-minus mr-1"></i>
            Field
          </v-btn>
        </div>
        <field-form
          v-model="field.listFields[idx]"
          :lvl="lvl + 1"
          :show-value="showValue"
        ></field-form>
      </div>

      <v-container class="d-flex justify-end">
        <v-btn
          color="primary"
          rounded
          depressed
          @click="field.listFields.push({ choices: [] })"
        >
          <i class="fas fa-plus mr-1"></i>
          List Field
        </v-btn>
      </v-container>
    </v-container>
  </v-container>
</template>
<script>
export default {
  name: "FieldForm",
  components: { "field-form": () => import("@/components/FieldForm.vue") },
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
        return this.$store.getters["dropdowns"]["fieldType"].filter(
          (e) => e.value != "list"
        );
      } else {
        return this.$store.getters["dropdowns"]["fieldType"];
      }
    },
  },
};
</script>
<style>
.outlined {
  border: solid grey 1px;
}
</style>
