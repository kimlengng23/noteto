import Vue from "vue";
import VueRouter from "vue-router";
import CustomView from "../views/CustomView.vue";
import ListView from "../views/ListView.vue";
import EntryForm from "../views/EntryForm.vue";
import DashboardView from "../views/DashboardView.vue";
import DatabaseSetting from "../views/DatabaseSetting.vue";
import NewDatabase from "../views/NewDatabase.vue";
import LoginPage from "../views/LoginPage.vue";
import LogoutPage from "../views/LogoutPage.vue";
import HomePage from "../views/HomePage.vue";
import UserRegister from "../views/UserRegister.vue";
import EmailVerify from "../views/EmailVerify.vue";
import CustomViewList from "../views/CustomViewList.vue";
import AssignedListView from "../views/AssignedListView.vue";
import DemoRequestList from "../views/DemoRequestList.vue";
import DatabaseRequest from "@/views/DatabaseRequest.vue";
import JaekJayCargoReceipt from "../custom-views/JaekJayCargoReceipt.vue";
import JaekJayCustomOrderReceipt from "../custom-views/JaekJayCustomOrderReceipt.vue";
import JaekJayCustomOrder from "../custom-views/JaekJayCustomOrder.vue";
import JaekJayEstimatedValue from "../custom-views/JaekJayEstimatedValue.vue";
import JaekJayWholesale from "../custom-views/JaekJayWholesale.vue";
import JaekJayMainWholesale from "../custom-views/JaekJayMainWholesale.vue";
import JaekJayCustomerDashboard from "../custom-views/JaekJayCustomerDashboard.vue";
import MtlWholesale from "../custom-views/MtlWholesale.vue";
import store from "../stores/index.js";
import _ from "lodash";
Vue.use(VueRouter);
//const scrollSection = document.getElementById("SCROLL_SECTION_ID");
const routes = [
  {
    path: "/list",
    name: "ListView",
    component: ListView,
  },
  {
    path: "/new/entry",
    name: "NewEntry",
    component: EntryForm,
  },
  {
    path: "/detail/:id",
    name: "DetailForm",
    component: EntryForm,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
  },
  {
    path: "/database/setting",
    name: "DatabaseSetting",
    component: DatabaseSetting,
  },
  {
    path: "/database/new",
    name: "NewDatabase",
    component: NewDatabase,
  },

  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/logout",
    name: "Logout",
    component: LogoutPage,
  },

  {
    path: "/",
    name: "Home",
    component: HomePage,
  },

  {
    path: "/register/user",
    name: "UserRegister",
    component: UserRegister,
  },

  {
    path: "/verify/email/:sessionId",
    name: "EmailVerify",
    component: EmailVerify,
  },
  {
    path: "/assigned/list/view",
    name: "AssignedListView",
    component: AssignedListView,
  },
  {
    path: "/demo/request/list",
    name: "DemoRequestList",
    component: DemoRequestList,
  },
  {
    path: "/database/request",
    name: "DatabaseRequest",
    component: DatabaseRequest,
  },
  {
    path: "/custom/view",
    name: "CustomView",
    component: CustomView,
    children: [
      {
        path: "list",
        name: "CustomViewList",
        component: CustomViewList,
      },
      {
        path: "jaekjaycargoreceipt/:id",
        name: "JaekJayCargoReceipt",
        component: JaekJayCargoReceipt,
      },
      {
        path: "jaekjaycustomorderreceipt/:id",
        name: "JaekJayCustomOrderReceipt",
        component: JaekJayCustomOrderReceipt,
      },
      {
        path: "jaekjaycustomorder/:id",
        name: "JaekJayCustomOrder",
        component: JaekJayCustomOrder,
      },
      {
        path: "jaekjayestimatedvalue",
        name: "JaekJayEstimatedValue",
        component: JaekJayEstimatedValue,
      },
      {
        path: "jaekjaywholesale",
        name: "JaekJayWholesale",
        component: JaekJayWholesale,
      },
      {
        path: "jaekJayMainWholesale",
        name: "JaekJayMainWholesale",
        component: JaekJayMainWholesale,
      },
      {
        path: "jaekJayCustomerDashboard",
        name: "JaekJayCustomerDashboard",
        component: JaekJayCustomerDashboard,
      },
      {
        path: "mtlWholesale",
        name: "MtlWholesale",
        component: MtlWholesale,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});
router.beforeEach((to, from, next) => {
  document.title = "នូតតូក - Noteto";
  if (
    to.name == "CustomView" ||
    to.name == "CustomViewList" ||
    to.name == "JaekJayCargoReceipt" ||
    to.name == "JaekJayCustomOrderReceipt" ||
    to.name == "JaekJayCustomOrder" ||
    to.name == "JaekJayEstimatedValue" ||
    to.name == "JaekJayWholesale" ||
    to.name == "JaekJayMainWholesale" ||
    to.name == "MtlWholesale" ||
    to.name == "Login" ||
    to.name == "UserRegister" ||
    to.name == "Home" ||
    to.name == "EmailVerify"
  ) {
    next();
  } else if (store.getters.isLoggedIn || localStorage.getItem("token")) {
    if (
      to.name == "Layout" ||
      to.name == "DatabaseSetting" ||
      to.name == "NewDatabase" ||
      to.name == "GroupRegister" ||
      to.name == "Logout" ||
      to.name == "DatabaseAccess" ||
      to.name == "AssignedListView" ||
      to.name == "Dashboard" ||
      to.name == "DetailForm" ||
      to.name == "JaekJayCustomerDashboard" ||
      to.name == "DemoRequestList" ||
      to.name == "DatabaseRequest"
    ) {
      next();
    } else {
      let query = to.query;
      if (query.database) {
        let database = query.database ? query.database : "";
        if (database == "")
          database = JSON.parse(localStorage.getItem("currentDatabase")).value;
        document.title = `${document.title} | ${_.startCase(
          to.name
        )} | ${_.startCase(database)}`;
        next();
      } else {
        document.title += ` | ${to.name}`;
        next({ name: "Home" });
      }
    }
  } else {
    localStorage.setItem("nextRouteName", to.name);
    next({ name: "Login" });
  }
});
export default router;
