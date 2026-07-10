<template>
  <v-container fluid class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <div class="overline primary--text">Dashboard</div>
        <h1>{{ currentDatabase.displayName || "Dashboard" }}</h1>
      </div>
    </div>
    <jaek-jay-dashboard></jaek-jay-dashboard>
  </v-container>
</template>

<script>
import JaekJayDashboard from "@/components/JaekJayDashboard.vue";

export default {
  name: "DashboardView",
  components: {
    "jaek-jay-dashboard": JaekJayDashboard,
  },
  computed: {
    currentDatabase() {
      return this.$store.getters["currentDatabase"] || {};
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  padding: 18px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.dashboard-header h1 {
  margin: 0;
  color: #1f2933;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
}

@media only screen and (max-width: 600px) {
  .dashboard-page {
    padding: 12px;
  }

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
