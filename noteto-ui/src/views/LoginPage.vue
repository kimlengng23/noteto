<template>
	<div class="auth-page">
		<section class="auth-shell">
			<div class="auth-brand">
				<span>Noteto</span>
			</div>
			<v-card class="auth-card" outlined elevation="0">
				<v-card-title class="auth-title">
					<div>
						<h1>Welcome back</h1>
						<p>Sign in to continue to your workspace.</p>
					</div>
				</v-card-title>
				<v-card-text class="auth-body">
					<v-form v-model="isFormValid" ref="form">
						<v-text-field
							class="mb-3"
							dense
							outlined
							:rules="emailRules"
							label="Email"
							prepend-inner-icon="mdi-email-outline"
							v-model="email"
							v-on:keyup.enter="login()"></v-text-field>
						<v-text-field
							dense
							outlined
							:rules="pwRules"
							type="password"
							label="Password"
							prepend-inner-icon="mdi-lock-outline"
							v-model="password"
							v-on:keyup.enter="login()"></v-text-field>
					</v-form>
				</v-card-text>
				<v-card-actions class="auth-actions">
					<a class="auth-link" @click="$router.push({ name: 'UserRegister' })">
						Don't have an account?
					</a>
					<v-btn
						color="primary"
						depressed
						@click="login"
						:disabled="!isFormValid"
						:loading="isLoading">
						<v-icon left>mdi-login</v-icon>
						Login
					</v-btn>
				</v-card-actions>
			</v-card>
		</section>
	</div>
</template>
<script>
import backendService from "../services/backend-service.js";
import FormMixin from "../js/form-mixin.js";
import generalMixin from "@/js/general-mixin.js";
export default {
	name: "LoginPage",

	mixins: [FormMixin, generalMixin],
	data() {
		return {};
	},
	computed: {
		currentUser() {
			return this.$store.getters["currentUser"];
		},
		isAdmin() {
			return this.$store.getters["isAdmin"];
		},
	},
	methods: {
		login() {
			if (!this.$refs.form.validate()) {
				return;
			}
			let login = {};
			login.email = this.email;
			login.password = this.password;
			this.isLoading = true;
			backendService
				.login(login)
				.then((response) => {
					localStorage.setItem(
						"session",
						JSON.stringify(response.data),
					);
					localStorage.setItem("userId", response.data.userId);
					localStorage.setItem("token", response.data.token);
					localStorage.setItem("username", response.data.username);
					localStorage.setItem(
						"fullname",
						response.data.first + " " + response.data.last,
					);
					localStorage.setItem(
						"options",
						JSON.stringify(response.data.options),
					);
					localStorage.removeItem("currentDatabase");
					this.$store.commit("setCurrentUser", response.data);
					this.$store.commit("setCurrentDatabase", {});
					this.$store.dispatch("getDatabasesByUserId");
					this.$store.dispatch("getDropdowns");
					this.$store.dispatch("getNavigationOptions");
					this.$store.dispatch("getAllDatabases");
					this.$store.dispatch("getAllGroups");
					this.$store.dispatch("getAllUsers");
					this.$store.dispatch("getDatabaseToFields");
					this.$store.dispatch("getDatabaseToHeaderSets");
					this.$store.dispatch("getDatabaseToFilterSets");
					this.$store.dispatch("getDatabaseToLayoutMappings");
					this.$store.dispatch("getDatabaseToChoices");
					setTimeout(() => {
						let nextRouteName = "NewDatabase";
						if (localStorage.getItem("nextRouteName")) {
							nextRouteName =
								localStorage.getItem("nextRouteName");
							localStorage.removeItem("nextRouteName");
						}
						if (nextRouteName == "Home" || nextRouteName == "Login") {
							nextRouteName = "NewDatabase";
						}
						this.$router.push({ name: nextRouteName });
						this.isLoading = false;
					}, 1000);
				})
				.catch(() => {
					this.timer(1000).then(() => {
						this.errorSnackbar("Incorrect username or password");
						this.isLoading = false;
					});
				});
		},
	},
};
</script>
<style scoped>
.auth-page {
	min-height: calc(100vh - 64px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48px 16px;
	background:
		linear-gradient(135deg, rgba(21, 101, 192, 0.08), transparent 42%),
		linear-gradient(315deg, rgba(0, 150, 136, 0.08), transparent 38%),
		#f8fafc;
}

.auth-shell {
	width: 100%;
	max-width: 440px;
}

.auth-brand {
	color: #1565c0;
	font-family: "Sora", sans-serif;
	font-size: 2rem;
	font-weight: 800;
	margin-bottom: 18px;
	text-align: center;
}

.auth-card {
	border: 1px solid rgba(31, 41, 51, 0.1);
	border-radius: 8px;
	box-shadow: 0 22px 60px rgba(31, 41, 51, 0.1) !important;
}

.auth-title {
	padding: 28px 28px 8px;
}

.auth-title h1 {
	color: #102a43;
	font-size: 1.6rem;
	font-weight: 800;
	margin: 0 0 6px;
}

.auth-title p {
	color: #52616f;
	font-size: 0.95rem;
	margin: 0;
}

.auth-body {
	padding: 16px 28px 0;
}

.auth-actions {
	align-items: center;
	gap: 14px;
	justify-content: space-between;
	padding: 6px 28px 28px;
}

.auth-link {
	color: #1565c0;
	cursor: pointer;
	font-weight: 700;
	text-decoration: none;
}

@media only screen and (max-width: 600px) {
	.auth-page {
		align-items: flex-start;
		min-height: calc(100vh - 56px);
		padding-top: 36px;
	}

	.auth-actions {
		align-items: stretch;
		flex-direction: column-reverse;
	}

	.auth-actions .v-btn {
		width: 100%;
	}
}
</style>
