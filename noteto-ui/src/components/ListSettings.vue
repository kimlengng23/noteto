<template>
  <v-container
    fluid
    class="d-flex justify-space-between grey lighten-4 flex-wrap flex-md-nowrap flex-lg-nowrap"
    style="gap: 2px"
  >
    <header-section :database="database"></header-section>

    <list-filter></list-filter>
  </v-container>
</template>
<script>
import HeaderSection from "./HeaderSection.vue";
import ListFilter from "./ListFilter.vue";
export default {
  name: "ListSettings",
  components: { "header-section": HeaderSection, "list-filter": ListFilter },
  props: {
    database: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
</script>
