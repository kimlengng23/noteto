<template>
	<v-container>
		<v-card elevation="0">
			<v-card-title><h2>Item List</h2></v-card-title>
			<v-card-text>
				<div v-for="entry in entries" :key="entry._id">
					<v-container v-if="entry.inStock == 'Yes'">
						<v-card elevation="0" outlined class="">
							<v-card-title>{{ entry.item }}</v-card-title>
							<v-card-text class="d-flex justify-space-between">
								<h1 class="primary--text">
									{{ entry._data.id }}
								</h1>
								<img
									class="image-preview"
									:src="entry.imageLink" />
							</v-card-text>
							<v-card-text class="padless">
								<h1>Exp: {{ findLatestExpiration(entry) }}</h1>
							</v-card-text>
							<v-card-text
								class="padless d-flex justify-space-between red--text">
								<h2>
									{{ entry.wholesalePrice.toUpperCase() }}
									{{ "đ" }}
								</h2>
								<h2>
									{{
										`Min: ${entry.minQty} ${entry.unitType}`
									}}
								</h2>
							</v-card-text>
						</v-card>
					</v-container>
				</div>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
	name: "MtlWholesale",
	data() {
		return {
			entries: [],
		};
	},
	mounted: function () {
		document.title = "MTL Wholesale - នូតតូក - Noteto";
		publicService.getEntriesByDatabase("mtlWholesale").then((response) => {
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
