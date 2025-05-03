<template>
  <div>
    <v-app-bar
      v-if="routeName == 'Home' && !isLoggedIn"
      style="position: absolute; z-index: 2; width: 100%"
      color="transparent"
      elevation="0"
      dark
    >
      <v-toolbar-title
        class="text-h4"
        @click="$router.push({ name: 'Home' }).catch(() => {})"
      >
        <span style="font-family: 'Dangrek', cursive">នូតតូក</span>
        -
        <span style="font-family: 'Sora', sans-serif">Noteto</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-app-bar
      v-if="isLoggedIn"
      style="position: relative; z-index: 3"
      color="primary	"
      elevation="0"
      dark
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="isLoggedIn"
      ></v-app-bar-nav-icon>
      <v-toolbar-title
        v-if="isLoggedIn"
        @click="
          $router
            .push({
              name: 'ListView',
              query: { database: currentDatabase.value },
            })
            .catch(() => {})
        "
      >
        <span style="font-family: 'Dangrek', cursive">នូតតូក</span>
        -
        <span style="font-family: 'Sora', sans-serif">Noteto</span>
        <span
          v-if="$route.name == 'NewEntry' || $route.name == 'ListView'"
          :size="50"
          color="amber"
          indeterminate
        >
          <span class="mx-2">|</span>
          <span>{{ currentDatabase.displayName }}</span>
        </span>
        <v-progress-circular
          v-if="
            ($route.name == 'NewEntry' || $route.name == 'ListView') &&
            !currentDatabase.displayName
          "
          :size="50"
          color="amber"
          indeterminate
        ></v-progress-circular>
      </v-toolbar-title>
      <v-toolbar-title
        v-else
        @click="$router.push({ name: 'Home' }).catch(() => {})"
      >
        <span style="font-family: 'Dangrek', cursive">នូតតូក</span>
        -
        <span style="font-family: 'Sora', sans-serif">Noteto</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-autocomplete
        v-if="!isMobile() && isLoggedIn"
        filled
        rounded
        outlined
        class="ma-auto mr-1"
        :items="databases"
        item-text="displayName"
        item-value="value"
        v-model="database"
        return-object
      ></v-autocomplete>
      <v-btn
        v-if="isLoggedIn"
        class="primary mr-1"
        depressed
        rounded
        outlined
        icon
        @click="
          $router
            .push({
              name: 'NewEntry',
              query: { database: currentDatabase.value },
            })
            .catch(() => {})
        "
      >
        <i class="fas fa-plus"></i>
      </v-btn>
      <v-btn
        v-if="isLoggedIn"
        class="primary mr-1"
        depressed
        rounded
        outlined
        icon
        @click="changeDatabase"
      >
        <i class="fas fa-list-ol"></i>
      </v-btn>
      <v-btn
        v-if="isLoggedIn"
        class="primary"
        depressed
        rounded
        outlined
        icon
        @click="generateCsv"
      >
        <i class="fas fa-file-download"></i>
      </v-btn>
      <v-spacer v-if="!isMobile()"></v-spacer>

      <v-btn
        v-if="!isLoggedIn"
        color="blue darken-1"
        dark
        elevation="0"
        @click="$router.push({ name: 'UserRegister' }).catch(() => {})"
      >
        <i class="fas fa-user-plus mr-1"></i>
        Sign Up
      </v-btn>
      <v-btn
        v-if="!isLoggedIn"
        color="blue darken-1"
        dark
        elevation="0"
        @click="$router.push({ name: 'Login' }).catch(() => {})"
      >
        <i class="fas fa-sign-in-alt mr-1"></i>
        Login
      </v-btn>
      <v-menu offset-y v-if="isLoggedIn">
        <template v-slot:activator="{ on, props }">
          <v-btn icon v-bind="props" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-btn
                plain
                @click="$router.push({ name: 'Logout' }).catch(() => {})"
              >
                <i class="fas fa-sign-out-alt mr-1"></i>
                Log Out
              </v-btn>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-if="isLoggedIn" v-model="drawer" absolute temporary>
      <v-list-item>
        <v-list-item-avatar>
          <i class="fas fa-user-circle fa-3x"></i>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ userFullName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="option in navigationOptions"
          :key="option.title"
          link
        >
          <v-list-item-icon
            v-if="!option.adminOnly || isAdmin == option.adminOnly"
          >
            <i :class="option.icon"></i>
          </v-list-item-icon>
          <v-list-item-content
            v-if="!option.adminOnly || isAdmin == option.adminOnly"
            @click="$router.push(option.path).catch(() => {})"
          >
            <v-list-item-title>
              {{ option.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append></template>
    </v-navigation-drawer>
    <v-container
      v-if="routeName == 'Home'"
      fluid
      class="tmp pa-0"
    ></v-container>
  </div>
</template>
<script>
import mixin from "@/js/mixin";
import eventBus from "@/js/event-bus.js";
export default {
  name: "MainNavbar",
  mounted: function () {},
  data() {
    return {
      drawer: false,
      database: null,
    };
  },
  mixins: [mixin],
  computed: {
    currentDatabase: {
      get() {
        return this.$store.getters["currentDatabase"];
      },
      set(database) {
        this.$store.commit("setCurrentDatabase", database);
      },
    },
    currentUser() {
      return this.$store.getters["currentUser"];
    },
    databases() {
      return this.$store.getters["availableDatabases"];
    },
    isAdmin() {
      return this.$store.getters["isAdmin"];
    },
    navigationOptions() {
      return this.$store.getters["navigationOptions"].filter(
        (e) => !e.adminOnly || this.isAdmin == e.adminOnly
      );
    },
    userFullName() {
      let user = this.$store.getters["currentUser"];
      if (user && user.first && user.last) return user.first + " " + user.last;
      return "";
    },
    routeName() {
      return this.$route.name;
    },
  },
  methods: {
    changeDatabase() {
      if (this.database && this.database.value) {
        let routeData = this.$router.resolve({
          name: "ListView",
          query: { database: this.database.value },
        });
        this.database = null;
        window.open(routeData.href, "_blank");
      }
      if (
        this.database == null &&
        this.currentDatabase &&
        this.currentDatabase.value
      ) {
        this.$router
          .push({
            name: "ListView",
            query: { database: this.currentDatabase.value },
          })
          .catch(() => {});
      }
    },
    clearSearch() {
      eventBus.$emit("clearSearch");
    },
    generateCsv() {
      eventBus.$emit("generateCsv");
    },
    isMobile() {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    },
    searchForEntries() {
      eventBus.$emit("searchForEntries");
    },
  },
};
</script>
<style>
@media only screen and (max-width: 999px) {
  .tmp {
    background-image: linear-gradient(
      to bottom,
      #0060f0,
      #009fff,
      #00cae4,
      #00eaa8,
      #dbff8c
    );
    height: 30%;
    z-index: 1 !important;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom-left-radius: 500px;
    border-bottom-right-radius: 500px;
  }
}
@media only screen and (min-width: 1000px) {
  .tmp {
    background-image: linear-gradient(
      to bottom,
      #0060f0,
      #009fff,
      #00cae4,
      #00eaa8,
      #dbff8c
    );
    height: 600px;
    z-index: 1 !important;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom-left-radius: 100%;
    border-bottom-right-radius: 100%;
  }
}
</style>
