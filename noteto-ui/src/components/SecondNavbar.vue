<template>
  <div>
    <v-app-bar color="blue darken-1" elevation="0" dark>
      <v-autocomplete
        filled
        rounded
        outlined
        dense
        class="mt-6"
        :items="databases"
        item-text="displayName"
        item-value="value"
        v-model="currentDatabase"
        return-object
        @change="changeDatabase"
      ></v-autocomplete>
    </v-app-bar>
  </div>
</template>
<script>
import mixin from "@/js/mixin";
export default {
  name: "SecondNavbar",
  mounted: function () {},
  data() {
    return {
      drawer: false,
    };
  },
  mixins: [mixin],
  computed: {
    databases() {
      return this.$store.getters["availableDatabases"];
    },

    currentDatabase: {
      get() {
        return this.$store.getters["currentDatabase"];
      },
      set(database) {
        this.$store.commit("setCurrentDatabase", database);
      },
    },
  },
  methods: {
    changeDatabase(database) {
      localStorage.setItem("currentDatabase", JSON.stringify(database));
      this.$store.commit("setCurrentDatabase", database);
      this.$store.dispatch("getFieldsByDatabase");
      this.$store.dispatch("getChoicesByDatabase");
      this.$store.dispatch("getAutomationsByDatabase");
      this.$store.dispatch("getUsersByDatabase");
      this.$store.dispatch("getEntriesByDatabase");
      this.$store.dispatch("getHeadersByDatabase");
      this.$store.dispatch("getEmptyEntryByDatabase");
      this.$store.dispatch("getLayoutByDatabase");
      this.$router.push({ name: "ListView" }).catch(() => {});
    },
  },
};
</script>
<style></style>
