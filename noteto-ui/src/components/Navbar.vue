<template>
	<div>
		<v-app-bar
			v-if="routeName == 'Home' && !isLoggedIn"
			style="position: absolute; width: 100%"
			color="transparent"
			elevation="0">
			<v-toolbar-title
				class="text-h4"
				@click="$router.push({ name: 'Home' }).catch(() => {})">
				<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
				-
				<span style="font-family: 'Sora', sans-serif">Noteto</span>
			</v-toolbar-title>
		</v-app-bar>
		<v-app-bar
			v-if="isLoggedIn"
			style="position: relative"
			color="primary	"
			elevation="0"
			dark>
			<v-app-bar-nav-icon
				@click="drawer = !drawer"
				v-if="isLoggedIn"></v-app-bar-nav-icon>
			<v-toolbar-title v-if="isLoggedIn" @click="goToRecords">
				<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
				-
				<span style="font-family: 'Sora', sans-serif">Noteto</span>
				<span
					v-if="showDatabaseName"
					:size="50"
					color="amber"
					indeterminate>
					<span class="mx-2">|</span>
					<span>{{ activeDatabaseDisplayName }}</span>
				</span>
			</v-toolbar-title>
			<v-toolbar-title
				v-else
				@click="$router.push({ name: 'Home' }).catch(() => {})">
				<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
				-
				<span style="font-family: 'Sora', sans-serif">Noteto</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>

			<v-autocomplete
				v-if="!isMobile() && isLoggedIn"
				filled
				outlined
				class="ma-auto mr-1"
				:items="databases"
				item-text="displayName"
				item-value="value"
				:value="activeDatabaseValue"
				hide-details
				@change="changeDatabase"></v-autocomplete>
			<v-spacer v-if="!isMobile()"></v-spacer>

			<v-btn
				v-if="!isLoggedIn"
				color="blue darken-1"
				dark
				text
				@click="$router.push({ name: 'Help' }).catch(() => {})">
				<v-icon left>mdi-help-circle-outline</v-icon>
				Help
			</v-btn>
			<v-btn
				v-if="!isLoggedIn"
				color="blue darken-1"
				dark
				elevation="0"
				@click="$router.push({ name: 'UserRegister' }).catch(() => {})">
				<v-icon left>mdi-account-plus</v-icon>
				Sign Up
			</v-btn>
			<v-btn
				v-if="!isLoggedIn"
				color="blue darken-1"
				dark
				elevation="0"
				@click="$router.push({ name: 'Login' }).catch(() => {})">
				<v-icon left>mdi-login</v-icon>
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
								@click="
									$router
										.push({ name: 'Logout' })
										.catch(() => {})
								">
								<v-icon left>mdi-logout</v-icon>
								Log Out
							</v-btn>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-progress-linear
				v-if="isDatabaseLoading"
				absolute
				bottom
				color="amber"
				height="3"
				indeterminate></v-progress-linear>
		</v-app-bar>
		<v-navigation-drawer
			v-if="isLoggedIn"
			v-model="drawer"
			absolute
			temporary>
			<v-list-item>
				<v-list-item-avatar>
					<v-icon x-large>mdi-account-circle</v-icon>
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
					@click="navigateToOption(option)">
					<v-list-item-icon>
						<v-icon>{{ getMdiIcon(option.icon) }}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title>
							{{ option.title }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<template v-slot:append></template>
		</v-navigation-drawer>
	</div>
</template>
<script>
import mixin from "@/js/mixin";
import eventBus from "@/js/event-bus.js";
export default {
	name: "MainNavbar",
	mounted: function () {
		this.ensureDatabaseOptions();
	},
	data() {
		return {
			drawer: false,
			database: null,
		};
	},
	mixins: [mixin],
	computed: {
		activeDatabaseValue() {
			const database = this.getActiveDatabase();
			return database && database.value ? database.value : "";
		},
		activeDatabaseDisplayName() {
			const database = this.getActiveDatabase();
			return database && database.displayName ? database.displayName : "";
		},
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
			const databaseByValue = {};
			const availableDatabases =
				this.$store.getters["availableDatabases"] || [];
			const allDatabases = this.$store.getters["allDatabases"] || [];
			availableDatabases.concat(allDatabases).forEach((database) => {
				if (database && database.value)
					databaseByValue[database.value] = database;
			});
			return Object.values(databaseByValue).sort((a, b) => {
				return String(a.displayName || a.value).localeCompare(
					String(b.displayName || b.value),
				);
			});
		},
		isAdmin() {
			return this.$store.getters["isAdmin"];
		},
		navigationOptions() {
			const defaultOptions = [
				{
					title: "Records",
					icon: "mdi-table",
					routeName: "ListView",
				},
				{
					title: "Settings",
					icon: "mdi-cog",
					routeName: "DatabaseSetting",
				},
			];
			const savedOptions = this.$store.getters["navigationOptions"] || [];
			const optionByTitle = {};
			defaultOptions.concat(savedOptions).forEach((option) => {
				if (
					option.routeName == "Dashboard" ||
					option.title == "Dashboard"
				) {
					return;
				}
				optionByTitle[option.title] = option;
			});
			return Object.values(optionByTitle);
		},
		userFullName() {
			let user = this.$store.getters["currentUser"];
			if (user && user.first && user.last)
				return user.first + " " + user.last;
			return "";
		},
		routeName() {
			return this.$route.name;
		},
		isDatabaseLoading() {
			return (
				this.usesDatabaseContext &&
				!this.getActiveDatabase().displayName
			);
		},
		showDatabaseName() {
			return (
				this.usesDatabaseContext && this.getActiveDatabase().displayName
			);
		},
		usesDatabaseContext() {
			return [
				"Dashboard",
				"DatabaseSetting",
				"DetailForm",
				"ListView",
				"NewEntry",
			].includes(this.$route.name);
		},
	},
	methods: {
		ensureDatabaseOptions() {
			if (!this.isLoggedIn) return;
			if (this.databases.length == 0) {
				this.$store.dispatch("getDatabasesByUserId");
				this.$store.dispatch("getAllDatabases");
			}
		},
		activateDatabase(database) {
			if (!database || !database.value) return;
			this.$store.commit("setCurrentDatabase", database);
			this.$store.dispatch("getFieldsByDatabase", database.value);
			this.$store.dispatch("getChoicesByDatabase", database.value);
			this.$store.dispatch("getEmptyEntryByDatabase", database.value);
			this.$store.dispatch("getHeaderSetsByDatabase");
			this.$store.dispatch("getFilterSetsByDatabase");
			this.$store.dispatch("getAutomationsByDatabase", database.value);
			this.$store.dispatch("getUsersByDatabase", database.value);
			this.$store.dispatch("getLayoutByDatabase", database.value);
		},
		changeDatabase(databaseValue) {
			const database = this.findDatabase(databaseValue);
			if (!database) return;
			this.activateDatabase(database);
			this.$router
				.push({
					name: "ListView",
					query: { database: database.value },
				})
				.catch(() => {});
		},
		clearSearch() {
			eventBus.$emit("clearSearch");
		},
		findDatabase(databaseValue) {
			if (!databaseValue) return null;
			return this.databases.find(
				(database) => database.value == databaseValue,
			);
		},
		getActiveDatabase() {
			if (this.currentDatabase && this.currentDatabase.value) {
				return this.currentDatabase;
			}
			const queryDatabase = this.findDatabase(this.$route.query.database);
			if (queryDatabase) return queryDatabase;
			try {
				const storedDatabase = JSON.parse(
					localStorage.getItem("currentDatabase") || "{}",
				);
				if (storedDatabase && storedDatabase.value)
					return storedDatabase;
			} catch (error) {
				console.log(error);
			}
			return this.databases.length > 0 ? this.databases[0] : {};
		},
		getDatabaseQuery() {
			return this.activeDatabaseValue
				? { database: this.activeDatabaseValue }
				: {};
		},
		getMdiIcon(icon) {
			if (!icon) return "mdi-circle-small";
			if (icon.startsWith("mdi-")) return icon;
			if (icon.includes("table")) return "mdi-table";
			if (icon.includes("cog")) return "mdi-cog";
			if (icon.includes("user-check")) return "mdi-account-check";
			if (icon.includes("users")) return "mdi-account-group";
			if (icon.includes("user")) return "mdi-account";
			if (icon.includes("list-ol")) return "mdi-format-list-numbered";
			if (icon.includes("list")) return "mdi-format-list-bulleted";
			if (icon.includes("database")) return "mdi-database";
			return "mdi-circle";
		},
		getNavigationTarget(option) {
			if (option.routeName == "ListView" || option.title == "Records") {
				return {
					name: "ListView",
					query: this.getDatabaseQuery(),
				};
			}
			if (
				option.routeName == "DatabaseSetting" ||
				option.title == "Settings"
			) {
				return {
					name: "DatabaseSetting",
					query: this.getDatabaseQuery(),
				};
			}
			if (
				option.routeName == "Dashboard" ||
				option.title == "Dashboard"
			) {
				return {
					name: "Dashboard",
					query: this.getDatabaseQuery(),
				};
			}
			if (option.routeName) {
				return { name: option.routeName };
			}
			return option.path;
		},
		goToRecords() {
			const database = this.getActiveDatabase();
			if (database && database.value) this.activateDatabase(database);
			this.$router
				.push({
					name: "ListView",
					query: this.getDatabaseQuery(),
				})
				.catch(() => {});
		},
		navigateToOption(option) {
			const target = this.getNavigationTarget(option);
			if (target && target.query && target.query.database) {
				const database = this.findDatabase(target.query.database);
				if (database) this.activateDatabase(database);
			}
			this.drawer = false;
			this.$router.push(target).catch(() => {});
		},
		isMobile() {
			if (
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent,
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
	watch: {
		currentUser: function () {
			this.ensureDatabaseOptions();
		},
		isLoggedIn: function () {
			this.ensureDatabaseOptions();
		},
	},
};
</script>
<style></style>
