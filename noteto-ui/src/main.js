import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./stores";
import router from "./router";
import VuetifyMoney from "./plugins/vuetify-money";
import FormComponent from "./components/FormComponent.vue";

Vue.config.productionTip = false;
Vue.component("form-component",FormComponent)
new Vue({
  vuetify,
  store,
  router,
  VuetifyMoney,
  render: (h) => h(App),
}).$mount("#app");
