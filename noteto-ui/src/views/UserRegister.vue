<template>
	<v-container>
		<v-container class="text-h4 text-center primary--text">
			<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
			-
			<span style="font-family: 'Sora', sans-serif">Noteto</span>
		</v-container>
		<v-container class="d-flex justify-center">
			<v-card class="" elevation="0" min-width="350" width="60%">
				<v-card-title>Register User</v-card-title>
				<v-card-text v-if="!isSuccessful">
					<v-form ref="form" v-model="isFormValid">
						<v-text-field
							class="mb-2"
							outlined
							dense
							hide-details
							:rules="nameRules"
							v-model="first"
							prepend-inner-icon="mdi-account-outline"
							label="First Name"></v-text-field>
						<v-text-field
							class="mb-2"
							outlined
							dense
							hide-details
							:rules="nameRules"
							v-model="last"
							prepend-inner-icon="mdi-account-outline"
							label="Last Name"></v-text-field>

						<v-text-field
							class="mb-2"
							outlined
							dense
							hide-details
							:rules="emailRules"
							v-model="email"
							prepend-inner-icon="mdi-email-outline"
							label="Email"></v-text-field>
						<v-text-field
							class="mb-2"
							outlined
							dense
							hide-details
							:rules="pwRules"
							type="password"
							v-model="password"
							prepend-inner-icon="mdi-lock-outline"
							label="Password"></v-text-field>
						<v-text-field
							class="mb-2"
							outlined
							dense
							hide-details
							:rules="confRules"
							type="password"
							v-model="confPassword"
							prepend-inner-icon="mdi-lock-check-outline"
							label="Confirm Password"></v-text-field>
					</v-form>
				</v-card-text>
				<v-card-text class="text-center" v-else>
					<h1 class="mb-5 blue--text">You are almost done</h1>

					<p>
						We have sent you an email with a verify link. Check the
						email to verify your email address.
					</p>
				</v-card-text>
				<v-card-text
					class="d-flex justify-space-between pt-0 align-center">
					<div>
						<a @click="$router.push({ name: 'Login' })">
							Already have an account?
						</a>
					</div>
					<div>
						<v-btn
							depressed
							color="warning"
							@click="clear"
							class="mr-1">
							<v-icon left>mdi-close</v-icon>
							Clear
						</v-btn>
						<v-btn
							depressed
							color="primary"
							@click="register"
							:disabled="!isFormValid"
							:loading="isLoading">
							<v-icon left>mdi-cash-register</v-icon>
							Register
						</v-btn>
					</div>
				</v-card-text>
			</v-card>
		</v-container>
	</v-container>
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
<style scoped></style>
