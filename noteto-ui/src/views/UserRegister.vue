<template>
	<div class="auth-page">
		<section class="auth-shell">
			<div class="auth-brand">
				<span>Noteto</span>
			</div>
			<v-card class="auth-card" outlined elevation="0">
				<v-card-title class="auth-title">
					<div>
						<h1>Create your account</h1>
						<p>Set up a user before building your database.</p>
					</div>
				</v-card-title>
				<v-card-text v-if="!isSuccessful" class="auth-body">
					<v-form ref="form" v-model="isFormValid">
						<div class="name-grid">
							<v-text-field
								outlined
								dense
								:rules="nameRules"
								v-model="first"
								prepend-inner-icon="mdi-account-outline"
								label="First Name"></v-text-field>
							<v-text-field
								outlined
								dense
								:rules="nameRules"
								v-model="last"
								prepend-inner-icon="mdi-account-outline"
								label="Last Name"></v-text-field>
						</div>

						<v-text-field
							class="mb-3"
							outlined
							dense
							:rules="emailRules"
							v-model="email"
							prepend-inner-icon="mdi-email-outline"
							label="Email"></v-text-field>
						<v-text-field
							class="mb-3"
							outlined
							dense
							:rules="pwRules"
							type="password"
							v-model="password"
							prepend-inner-icon="mdi-lock-outline"
							label="Password"></v-text-field>
						<v-text-field
							outlined
							dense
							:rules="confRules"
							type="password"
							v-model="confPassword"
							prepend-inner-icon="mdi-lock-check-outline"
							label="Confirm Password"></v-text-field>
					</v-form>
				</v-card-text>
				<v-card-text class="success-state" v-else>
					<v-icon color="success" size="48">mdi-email-check-outline</v-icon>
					<h2>You are almost done</h2>
					<p>
						We have sent you an email with a verify link. Check the
						email to verify your email address.
					</p>
				</v-card-text>
				<v-card-actions class="auth-actions">
					<a class="auth-link" @click="$router.push({ name: 'Login' })">
						Already have an account?
					</a>
					<div class="action-group">
						<v-btn depressed text color="secondary" @click="clear">
							<v-icon left>mdi-close</v-icon>
							Clear
						</v-btn>
						<v-btn
							depressed
							color="primary"
							@click="register"
							:disabled="!isFormValid"
							:loading="isLoading">
							<v-icon left>mdi-account-plus-outline</v-icon>
							Register
						</v-btn>
					</div>
				</v-card-actions>
			</v-card>
		</section>
	</div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import FormMixin from "../js/form-mixin.js";
import backendService from "../services/backend-service.js";
export default {
	name: "RegisterUser",
	mixins: [FormMixin],

	data() {
		return {
			isFormValid: false,
		};
	},
	computed: {
		currentUser() {
			return this.$store.getters["currentUser"];
		},
	},
	mounted: () => {},
	methods: {
		clear() {
			this.clearVariables();
			this.$refs.form.resetValidation();
		},
		register() {
			if (!this.$refs.form.validate()) {
				return;
			}
			let account = {};
			account.first = this.first;
			account.last = this.last;
			account.email = this.email;
			account.username = this.email;
			account.password = this.password;
			this.isLoading = true;
			backendService
				.registerUser(account)
				.then(() => {
					setTimeout(() => {
						eventBus.$emit(
							"setSnackbar",
							"Successfully registered user",
							"success",
						);
						this.clear();
						this.isLoading = false;
						this.isSuccessful = true;
					}, 1000);
				})
				.catch(() => {
					setTimeout(() => {
						eventBus.$emit(
							"setSnackbar",
							"Oops! Something is not right!",
							"red",
						);
						this.isLoading = false;
					}, 1000);
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
	max-width: 520px;
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

.auth-title p,
.success-state p {
	color: #52616f;
	font-size: 0.95rem;
	margin: 0;
}

.auth-body {
	padding: 16px 28px 0;
}

.name-grid {
	display: grid;
	gap: 12px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.success-state {
	padding: 22px 28px 10px;
	text-align: center;
}

.success-state h2 {
	color: #102a43;
	font-size: 1.4rem;
	font-weight: 800;
	margin: 12px 0 8px;
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

.action-group {
	display: flex;
	gap: 8px;
}

@media only screen and (max-width: 600px) {
	.auth-page {
		align-items: flex-start;
		min-height: calc(100vh - 56px);
		padding-top: 36px;
	}

	.name-grid {
		gap: 0;
		grid-template-columns: 1fr;
	}

	.auth-actions,
	.action-group {
		align-items: stretch;
		flex-direction: column-reverse;
		width: 100%;
	}

	.auth-actions .v-btn {
		width: 100%;
	}
}
</style>
