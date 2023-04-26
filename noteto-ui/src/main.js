import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./stores";
import router from "./router";
import VuetifyMoney from "./plugins/vuetify-money";

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  router,
  VuetifyMoney,
  render: (h) => h(App),
}).$mount("#app");
