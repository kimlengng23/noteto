<template>
  <div>
    <v-tabs v-model="tab">
      <v-tab>General</v-tab>
      <v-tab>Automation</v-tab>
      <v-tab>New Database</v-tab>
      <v-tab>Layout</v-tab>
      <v-tab>Access</v-tab>
      <v-tab>User Group</v-tab>
      <v-tabs-items v-model="tab">
        <v-tab-item><field-section></field-section></v-tab-item>
        <v-tab-item>
          <automation-section></automation-section>
        </v-tab-item>
        <v-tab-item>
          <database-form></database-form>
        </v-tab-item>
        <v-tab-item><form-layout></form-layout></v-tab-item>
        <v-tab-item><database-access></database-access></v-tab-item>
        <v-tab-item><user-group></user-group></v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </div>
</template>
<script>
import AutomationSection from "@/components/AutomationSection.vue";
import FieldSection from "@/components/FieldSection.vue";
import DatabaseForm from "@/components/DatabaseForm.vue";
import DatabaseAccess from "@/components/DatabaseAccess.vue";
import UserGroup from "@/components/UserGroup.vue";
import FormLayout from "@/components/FormLayout.vue";
export default {
  name: "DatabaseSetting",

  data() {
    return {
      tab: null,
      ready: false,
    };
  },
  mixins: [],

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
    fieldTypes() {
      return this.$store.getters["dropdowns"]["fieldType"];
    },
  },
  methods: {},
  components: {
    "automation-section": AutomationSection,
    "field-section": FieldSection,
    "database-form": DatabaseForm,
    "database-access": DatabaseAccess,
    "user-group": UserGroup,
    "form-layout": FormLayout,
  },
};
</script>
<style scoped></style>
