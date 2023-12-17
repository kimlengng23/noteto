<template>
	<v-container>
		<v-card elevation="0">
			<v-card-title><h2>Item List</h2></v-card-title>
			<v-card-text>
				<div v-for="entry in entries" :key="entry._id">
					<v-card elevation="0" outlined class="rounded-xl">
						<div class="ma-2">
							<h4>{{ entry.title }}</h4>
						</div>
						<v-card-text class="d-flex justify-space-between">
							<h1 class="primary--text">{{ entry._data.id }}</h1>
							<img class="image-preview" :src="entry.imageLink" />
						</v-card-text>
						<v-card-text class="padless d-flex flex-column">
							<div class="d-flex justify-space-between">
								<h4>Original:</h4>
								<h4 class="red--text">
									{{ "$" }}
									{{ entry.originalValue.toFixed(2) }}
								</h4>
							</div>
							<div class="d-flex justify-space-between">
								<h4 class="float-right">Tax:</h4>
								<h4 class="red--text">
									{{ "$" }}
									{{ getTax(entry) }}
								</h4>
							</div>
							<div class="d-flex justify-space-between">
								<h4>Fee:</h4>
								<h4 class="red--text">
									{{ "$" }}
									{{ getGain(entry) }}
								</h4>
							</div>
							<div class="d-flex justify-space-between">
								<h4>Shipping:</h4>
								<h4 class="red--text">
									{{ "$" }}
									{{ entry.shippingFee }}
								</h4>
							</div>

							<div class="d-flex justify-space-between">
								<h2>Estimated:</h2>
								<h2 class="red--text">
									{{ "$" }}
									{{ getTotal(entry) }}
								</h2>
							</div>
						</v-card-text>
					</v-card>
				</div>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
	name: "JaekJayEstimatedValue",
	data() {
		return {
			entries: [],
		};
	},
	mounted: function () {
		document.title = "Jaek Jay Estimated Value - នូតតូក - Noteto";
		publicService
			.getEntriesByDatabase("jaekJayEstimatedValue")
			.then((response) => {
				this.entries = response.data;
				this.entries.sort(function (a, b) {
					if (a.order && b.order) {
						return a.order - b.order;
					} else if (!a.order && b.order) {
						return 1;
					} else if (a.order && !b.order) {
						return -1;
					} else {
						return 0;
					}
				});
			});
	},
	computed: {},
	methods: {
		getGain(entry) {
			return (
				(entry.originalValue * (1 + entry.tax / 100) * entry.gain) /
					100 +
				0.00001
			).toFixed(2);
		},
		getTax(entry) {
			return (
				(entry.originalValue * entry.tax) / 100.0 +
				0.00001
			).toFixed(2);
		},

		getTotal(entry) {
			return (
				entry.originalValue *
					(1 + entry.tax / 100) *
					(1 + entry.gain / 100) +
				entry.shippingFee +
				0.00001
			).toFixed(2);
		},
	},
};
</script>
<style scoped>
.image-preview {
	border-radius: 10px;
	border: 1px lightgray solid;
	object-fit: contain;
	image-rendering: smooth;
	padding: 2px 2px 2px 2px;
	width: 200px;
	height: 200px;
}
</style>
