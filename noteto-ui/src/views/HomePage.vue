<template>
	<v-container fluid style="margin-top: 10%">
		<v-container
			class="text-center text-h3 font-weight-bold white--text montserrat">
			<span>Discover a Flexible Entry Tracking Application</span>
		</v-container>
		<v-container class="text-center text-h4 white--text">
			<span style="font-family: 'Dangrek', cursive">នូតតូក</span>
			-
			<span style="font-family: 'Sora', sans-serif">Noteto</span>
		</v-container>
		<v-container class="d-flex justify-center montserrat v-card-div">
			<v-card elevation="0" class="rounded-xl" outlined>
				<v-card-title class="d-flex justify-center">
					<div class="text-lg-h5 text-sm-h2">Meet the team</div>
				</v-card-title>
				<v-card-text>
					<div class="d-flex justify-center flex-wrap">
						<div style="height: 50%; width: 50%">
							<v-img
								style="
									image-rendering: auto;
									border-radius: 100%;
								"
								src="@/assets/team-1.jpg"></v-img>
						</div>
					</div>
					<div
						class="text-center text-lg-h4 text-sm-h2 font-weight-bold my-2">
						Tee K. Nguov
					</div>
					<div class="text-sm-h4 text-lg-subtitle-1">
						As the lead developer and founder of Noteto, Tee brings
						a passion for creating innovative and intuitive digital
						experiences. With more than 5 years of experience in
						software development, Tee is dedicated to pushing the
						boundaries of what's possible and turning creative ideas
						into functional, user-friendly tech solutions for
						businesses.
					</div>
				</v-card-text>
			</v-card>
		</v-container>
		<v-divider></v-divider>
		<v-container
			fluid
			class="d-flex my-2 align-center flex-wrap flex-lg-nowrap">
			<div class="image-div">
				<v-img
					style="image-rendering: auto"
					src="@/assets/show-case-1.jpg"></v-img>
			</div>
			<div>
				<!-- <p>
					An intuitive and versatile record-keeping app that allows
					users to easily track and manage their data
				</p> -->
				<p
					class="text-center text-h3 font-italic font-weight-bold montserrat">
					Empowering Your Team
				</p>
				<p class="text-h5 grey--text text--darken-1 montserrat">
					Whether tracking sales, inventory, or customer data, Noteto
					offers a simple and efficient way to organize and store
					important information. Users can easily search, view, and
					update their records at any time, making it easy to stay on
					top of changes and updates.
				</p>
				<!-- <p>
					With a user-friendly interface and flexible customization
					options, Noteto is the perfect solution for anyone looking
					to streamline their record-keeping process and stay
					organized in today's fast-paced world.
				</p> -->
			</div>
		</v-container>
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
<style scoped>
div > div {
	z-index: 3;
	position: relative;
}
.montserrat {
	font-family: "Montserrat", sans-serif !important;
}
@media only screen and (max-width: 999px) {
	.v-card-div {
		width: 100%;
	}
	.image-div {
		width: 100%;
	}
}
@media only screen and (min-width: 1000px) {
	.v-card-div {
		width: 30%;
	}
	.image-div {
		width: 50%;
	}
}
</style>
