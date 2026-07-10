<template>
	<v-container>
		<div class="text-h6">Demo Requests</div>
		<v-container v-if="isLoading" class="text-center">
			<v-progress-circular
				indeterminate
				color="primary"></v-progress-circular>
		</v-container>
		<v-container class="d-flex flex-wrap">
			<v-card
				v-if="demoRequests.length == 0 && !isLoading"
				elevation="0"
				class=""
				width="100%">
				<v-card-text class="text-center text-h4">
					<div>There are not demo requests yet</div>
					<v-icon>mdi-emoticon-sad-outline</v-icon>
				</v-card-text>
			</v-card>
			<v-card
				v-for="request in demoRequests"
				:key="request._id"
				class="mx-lg-2"
				elevation="0"
				width="20%">
				<v-card-title class="d-flex justify-space-between py-0">
					<div>
						{{ request.fullName }}
					</div>
					<v-btn
						icon
						color="red"
						@click="deleteDemoRequestById(request._id)">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-text class="bg-grey lighten-2">
					<div class="text-caption">
						<span class="mr-1">
							<v-icon>mdi-email-outline</v-icon>
						</span>
						<span>{{ request.email }}</span>
					</div>
					<v-divider></v-divider>
					<p class="text-caption">{{ request.message }}</p>
				</v-card-text>
			</v-card>
		</v-container>
	</v-container>
</template>
<script>
import backendService from "@/services/backend-service";
import mixin from "@/js/mixin";
export default {
	name: "DemoRequestList",
	mixins: [mixin],
	mounted: function () {
		this.getDemoRequests();
	},
	data() {
		return {
			demoRequests: [],
			selectedRequest: "",
			isLoading: false,
		};
	},
	methods: {
		getDemoRequests() {
			this.isLoading = true;
			backendService.getDemoRequests().then((response) => {
				this.timer(1000).then(() => {
					this.demoRequests = response.data;
					this.isLoading = false;
				});
			});
		},
		deleteDemoRequestById(id) {
			this.selectedRequest = id;
			backendService.deleteDemoRequestById(id).then(() => {
				setTimeout(() => {
					this.demoRequests = this.demoRequests.filter(
						(e) => e._id != id,
					);
					this.selectedRequest = "";
				}, 1000);
			});
		},
	},
};
</script>
