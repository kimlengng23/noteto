<template>
  <div>
    <v-app-bar color="blue darken-1" elevation="0" dark>
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="isLoggedIn"
      ></v-app-bar-nav-icon>
      <v-toolbar-title
        v-if="isLoggedIn"
        @click="$router.push({ name: 'ListView' }).catch(() => {})"
        >Noteto</v-toolbar-title
      >
      <v-toolbar-title
        v-else
        @click="$router.push({ name: 'Home' }).catch(() => {})"
        >Noteto</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-autocomplete
        v-if="!isMobile()"
        filled
        rounded
        outlined
        class="ma-auto"
        :items="databases"
        item-text="displayName"
        item-value="value"
        v-model="currentDatabase"
        return-object
        @change="changeDatabase"
      ></v-autocomplete>
      <v-spacer v-if="!isMobile()"></v-spacer>
      <v-btn
        v-if="!isLoggedIn"
        color="blue darken-1"
        dark
        elevation="0"
        @click="$router.push({ name: 'UserRegister' }).catch(() => {})"
        ><i class="fas fa-user-plus mr-2"></i>Sign Up</v-btn
      >
      <v-btn
        v-if="!isLoggedIn"
        color="blue darken-1"
        dark
        elevation="0"
        @click="$router.push({ name: 'Login' }).catch(() => {})"
      >
        <i class="fas fa-sign-in-alt mr-2"></i>Login
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
                ><i class="fas fa-sign-out-alt mr-2"></i>Log Out</v-btn
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute temporary>
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
            <v-list-item-title>{{ option.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append> </template>
    </v-navigation-drawer>
  </div>
</template>
<script>
import mixin from "@/js/mixin";
import eventBus from "../js/event-bus.js";
export default {
  name: "MainNavbar",
  mounted: function () {},
  data() {
    return {
      drawer: false,
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
      return this.$store.getters["navigationOptions"];
    },
    userFullName() {
      let user = this.$store.getters["currentUser"];
      if (user && user.first && user.last) return user.first + " " + user.last;
      return "";
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
    clearSearch() {
      eventBus.$emit("clearSearch");
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
<style></style>
