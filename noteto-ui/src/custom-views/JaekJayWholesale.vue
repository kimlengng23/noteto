<template>
	<v-container>
		<v-card elevation="0">
			<v-card-title><h2>Item List</h2></v-card-title>
			<v-card-text>
				<v-container v-for="entry in entries" :key="entry._id">
					<v-card elevation="0" outlined class="rounded-xl">
						<v-card-title>{{ entry.item }}</v-card-title>
						<v-card-text class="d-flex justify-space-between">
							<h1>{{ entry.id }}</h1>
							<img class="image-preview" :src="entry.imageLink" />
						</v-card-text>
						<v-card-text class="padless">
							<h1>{{ findLatestExpiration(entry) }}</h1>
						</v-card-text>
						<v-card-text
							class="padless d-flex justify-space-between red--text">
							<h2>${{ entry.wholesalePrice.toFixed(2) }}</h2>
							<h2>
								{{ `Min: ${entry.minQty} ${entry.unitType}` }}
							</h2>
						</v-card-text>
					</v-card>
				</v-container>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
	name: "JaekJayWholesale",
	data() {
		return {
			entries: [],
		};
	},
	mounted: function () {
		publicService
			.getEntriesByDatabase("jaekJayWholesale")
			.then((response) => {
				this.entries = response.data;
			});
	},
	computed: {},
	methods: {
		findLatestExpiration(entry) {
			if (!entry.stockHistory) {
				return "Unknown";
			}
			let length = entry.stockHistory.length;
			return entry.stockHistory[length - 1].lineExpDate;
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
