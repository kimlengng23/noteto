<template>
	<v-container style="width: 70%">
		<div style="font-size: 100px" class="text-center">
			<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
			-
			<span style="font-family: 'Sora', sans-serif">Noteto</span>
		</div>

		<div style="font-family: 'Noto Sans', serif">
			<p>
				An intuitive and versatile record-keeping app that allows users
				to easily track and manage their data
			</p>
			<p>
				Whether tracking sales, inventory, or customer data, Noteto
				offers a simple and efficient way to organize and store
				important information. Users can easily search, view, and update
				their records at any time, making it easy to stay on top of
				changes and updates.
			</p>
			<p>
				With a user-friendly interface and flexible customization
				options, Noteto is the perfect solution for anyone looking to
				streamline their record-keeping process and stay organized in
				today's fast-paced world.
			</p>
		</div>
		<v-container class="d-flex justify-center">
			<v-btn
				color="primary"
				rounded
				depressed
				@click="expand = true"
				:disabled="isSubmitted">
				<i class="fas fa-laptop-code mr-2"></i>
				Request Demo
			</v-btn>
		</v-container>
		<v-container>
			<v-expand-transition>
				<v-card
					v-show="expand && !isSubmitted"
					class="mx-auto rounded-xl"
					elevation="0">
					<v-card-text>
						<v-form ref="form" v-model="formValid">
							<v-text-field
								:rules="nameRules"
								dense
								rounded
								outlined
								label="Full Name"
								v-model="demoRequest.fullName"
								required></v-text-field>
							<v-text-field
								:rules="emailRules"
								dense
								rounded
								outlined
								label="Email"
								v-model="demoRequest.email"></v-text-field>
							<v-textarea
								:rules="textRules"
								dense
								rounded
								outlined
								label="Message"
								v-model="demoRequest.message"></v-textarea>
							<v-btn
								style="width: 100%"
								depressed
								rounded
								color="primary"
								:disabled="!formValid || isSubmitted"
								:loading="isLoading"
								@click="submitDemoRequest">
								<i class="far fa-paper-plane mr-2"></i>
								Submit
							</v-btn>
						</v-form>
					</v-card-text>
				</v-card>
			</v-expand-transition>
			<v-card v-if="isSubmitted" elevation="0" class="rounded-xl">
				<v-card-text class="text-center">
					<p class="text-h6">
						We have received your information. Our team will contact
						you.
					</p>
				</v-card-text>
			</v-card>
		</v-container>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";
import eventBus from "@/js/event-bus.js";
export default {
	name: "HomePage",
	data() {
		return {
			expand: false,
			formValid: false,
			isSubmitted: false,
			isLoading: false,
			demoRequest: {},
			textRules: [
				(v) => !!v || "Message is required",
				(v) =>
					(v && v.length >= 5) ||
					"Message must be at least 5 characters",
			],
			nameRules: [
				(v) => !!v || "Name is required",
				(v) =>
					(v && v.length >= 2) ||
					"Name must be at least 2 characters",
			],
			emailRules: [
				(v) => !!v || "E-mail is required",
				(v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
			],
		};
	},
	methods: {
		submitDemoRequest() {
			if (!this.$refs.form.validate()) return;
			this.isLoading = true;
			publicService
				.addDemoRequest(this.demoRequest)
				.then(() => {
					setTimeout(() => {
						eventBus.$emit(
							"setSnackbar",
							"Your request has been successfully submitted",
							"success"
						);
						this.isLoading = false;
						this.isSubmitted = true;
					}, 1000);
				})
				.catch(() => {
					this.isLoading = false;
				});
		},
	},
};
</script>
