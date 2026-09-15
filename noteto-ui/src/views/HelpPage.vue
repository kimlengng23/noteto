<template>
  <div class="help-page montserrat">
    <v-container class="help-container">
      <section class="help-header">
        <div class="overline primary--text mb-3">Help</div>
        <h1>What Noteto does</h1>
        <p>
          Noteto turns MongoDB into a small internal database app. Teams can
          define databases, add custom fields, enter records, assign work, view
          dashboards, and keep comments and change history in one place.
        </p>
      </section>

      <section class="help-grid">
        <article
          v-for="item in helpItems"
          :key="item.title"
          class="help-panel">
          <v-icon color="primary">{{ item.icon }}</v-icon>
          <h2>{{ item.title }}</h2>
          <p>{{ item.text }}</p>
        </article>
      </section>

      <section class="setup-section">
        <div>
          <h2>Connection setup</h2>
          <p>
            The home page connects the API to one active MongoDB server. The
            frontend keeps recent presets in your browser for convenience.
            A SQLite-backed connection store would let Noteto save reusable
            server profiles on the API side.
          </p>
        </div>
        <v-btn color="primary" depressed :to="{ name: 'Home' }">
          <v-icon left>mdi-database-cog</v-icon>
          Connect MongoDB
        </v-btn>
      </section>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "HelpPage",
  data() {
    return {
      helpItems: [
        {
          icon: "mdi-table-cog",
          title: "Build databases",
          text: "Create custom database views with fields, choices, filters, layouts, and permissions.",
        },
        {
          icon: "mdi-format-list-numbered",
          title: "Track records",
          text: "Add entries, update details, export lists, and keep daily operations searchable.",
        },
        {
          icon: "mdi-account-check",
          title: "Coordinate teams",
          text: "Assign entries, manage users and groups, and keep ownership visible.",
        },
        {
          icon: "mdi-history",
          title: "Keep context",
          text: "Comments and history help each record tell the story of what changed and why.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.help-page {
  min-height: 100%;
  background: #f6f8fb;
  color: #1f2933;
}

.montserrat {
  font-family: "Montserrat", sans-serif !important;
  line-height: 1.5;
}

.help-container {
  padding-top: 112px;
  padding-bottom: 64px;
}

.help-header {
  max-width: 780px;
  margin-bottom: 34px;
}

.help-header h1 {
  color: #102a43;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: 18px;
}

.help-header p,
.setup-section p {
  color: #52616f;
  font-size: 1.08rem;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.help-panel {
  min-height: 220px;
  padding: 24px;
  border: 1px solid rgba(31, 41, 51, 0.1);
  border-radius: 8px;
  background: #ffffff;
}

.help-panel h2 {
  color: #243b53;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 18px 0 10px;
}

.help-panel p {
  color: #52616f;
  margin: 0;
}

.setup-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 18px;
  padding: 28px;
  border: 1px solid rgba(31, 41, 51, 0.1);
  border-radius: 8px;
  background: #ffffff;
}

.setup-section h2 {
  color: #243b53;
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.setup-section p {
  max-width: 760px;
  margin: 0;
}

@media only screen and (max-width: 960px) {
  .help-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .setup-section {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media only screen and (max-width: 600px) {
  .help-container {
    padding-top: 92px;
  }

  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style>
