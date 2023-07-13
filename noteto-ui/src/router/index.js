import Vue from "vue";
import VueRouter from "vue-router";
import CustomView from "../views/CustomView.vue";
import ListView from "../views/ListView.vue";
import EntryForm from "../views/EntryForm.vue";
import DatabaseAccess from "../views/DatabaseAccess.vue";
import DetailForm from "../views/DetailForm.vue";
import FormSetting from "../views/FormSetting.vue";
import LayoutMapping from "@/views/LayoutMapping.vue";
import LoginPage from "../views/LoginPage.vue";
import LogoutPage from "../views/LogoutPage.vue";
import HomePage from "../views/HomePage.vue";
import NewDatabase from "../views/NewDatabase.vue";
import UserRegister from "../views/UserRegister.vue";
import GroupRegister from "../views/GroupRegister.vue";
import EmailVerify from "../views/EmailVerify.vue";
import JaekJayCargoReceipt from "../custom-views/JaekJayCargoReceipt.vue";
import JaekJayCustomOrderReceipt from "../custom-views/JaekJayCustomOrderReceipt.vue";
import JaekJayEstimatedValue from "../custom-views/JaekJayEstimatedValue.vue";
import JaekJayWholesale from "../custom-views/JaekJayWholesale.vue";
import JaekJayMainWholesale from "../custom-views/JaekJayMainWholesale.vue";
//import BillTrackerReceipt from "../components/BillTrackerReceipt.vue";
import store from "../stores/index.js";
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
		component: DetailForm,
	},
	{
		path: "/form/setting",
		name: "FormSetting",
		component: FormSetting,
	},
	{
		path: "/layout",
		name: "Layout",
		component: LayoutMapping,
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
		path: "/new/database",
		name: "NewDatabase",
		component: NewDatabase,
	},
	{
		path: "/database/access",
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
	{
		path: "/verify/email/:sessionId",
		name: "EmailVerify",
		component: EmailVerify,
	},
	{
		path: "/custom/view",
		name: "CustomView",
		component: CustomView,
		children: [
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
				name: "jaekJayMainWholesale",
				component: JaekJayMainWholesale,
			},
		],
	},
];

const router = new VueRouter({
	routes,
});
router.beforeEach((to, from, next) => {
	//scrollSection.style.overflow = "hidden";
	if (
		to.name == "CustomView" ||
		to.name == "JaekJayCargoReceipt" ||
		to.name == "JaekJayCustomOrderReceipt" ||
		to.name == "JaekJayEstimatedValue" ||
		to.name == "JaekJayWholesale" ||
		to.name == "jaekJayMainWholesale" ||
		to.name == "Login" ||
		to.name == "UserRegister" ||
		to.name == "Home" ||
		to.name == "EmailVerify"
	) {
		next();
	} else if (store.getters.isLoggedIn || localStorage.getItem("sessionId")) {
		if (
			to.name == "Layout" ||
			to.name == "FormSetting" ||
			to.name == "NewDatabase" ||
			to.name == "GroupRegister" ||
			to.name == "Logout" ||
			to.name == "DatabaseAccess"
		) {
			next();
		} else if (
			(store.getters.currentDatabase &&
				store.getters.currentDatabase.value) ||
			localStorage.getItem("currentDatabase")
		) {
			next();
		} else {
			next({ name: "Home" });
		}
	} else {
		next({ name: "Login" });
	}
});
export default router;
