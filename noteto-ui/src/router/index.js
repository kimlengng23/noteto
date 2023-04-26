import Vue from "vue";
import VueRouter from "vue-router";
import ListView from "../views/ListView.vue";
import EntryForm from "../views/EntryForm.vue";
import DetailForm from "../views/DetailForm.vue";
import FormSetting from "../views/FormSetting.vue";
import LayoutMapping from "@/views/LayoutMapping.vue";
import LoginPage from "../views/LoginPage.vue";
import LogoutPage from "../views/LogoutPage.vue";
import HomePage from "../views/HomePage.vue";
import NewDatabase from "../views/NewDatabase.vue";
import DatabaseAccess from "../views/DatabaseAccess.vue";
import UserList from "../components/UserList.vue";
import UserRegister from "../views/UserRegister.vue";
import GroupRegister from "../views/GroupRegister.vue";
//import BillTrackerReceipt from "../components/BillTrackerReceipt.vue";
import store from "../stores/index.js";
Vue.use(VueRouter);

const routes = [
  {
    path: "/List",
    name: "ListView",
    component: ListView,
  },
  {
    path: "/userlist",
    name: "UserList",
    component: UserList,
  },
  {
    path: "/newentry",
    name: "NewEntry",
    component: EntryForm,
  },
  {
    path: "/detail/:id",
    name: "DetailForm",
    component: DetailForm,
  },
  {
    path: "/form/setting",
    name: "FormSetting",
    component: FormSetting,
  },
  {
    path: "/layout/",
    name: "Layout",
    component: LayoutMapping,
  },
  {
    path: "/login/",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/logout/",
    name: "Logout",
    component: LogoutPage,
  },

  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/add/database",
    name: "NewDatabase",
    component: NewDatabase,
  },
  {
    path: "/add/database/access",
    name: "DatabaseAccess",
    component: DatabaseAccess,
  },
  {
    path: "/register/user",
    name: "UserRegister",
    component: UserRegister,
  },
  {
    path: "/register/group",
    name: "GroupRegister",
    component: GroupRegister,
  },
];

const router = new VueRouter({
  routes,
});
// router.beforeRouteEnter((to, from, next) => {
//   if (to.name == from.name) {
//     return;
//   } else {
//     next();
//   }
// });
router.beforeEach((to, from, next) => {
  if (store.getters.isLoggedIn || localStorage.getItem("sessionId")) {
    if (
      to.name == "Layout" ||
      to.name == "FormSetting" ||
      to.name == "NewDatabase" ||
      to.name == "GroupRegister" ||
      to.name == "Logout" ||
      to.name == "Home"
    ) {
      next();
    } else if (
      (store.getters.currentDatabase && store.getters.currentDatabase.value) ||
      localStorage.getItem("currentDatabase")
    ) {
      next();
    } else {
      next({ name: "Home" });
    }
  } else {
    if (to.name == "Login" || to.name == "UserRegister") {
      next();
    } else {
      next({ name: "Login" });
    }
  }
});
export default router;
