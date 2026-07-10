<template>
	<v-container class="white mt-2">
		<v-card elevation="0">
			<v-card-text>
				<v-row>
					<v-col class="text-h4">
						<span style="font-family: 'Dangrek', cursive">
							ចែកចាយ
						</span>
						-
						<span style="font-family: 'Sora', sans-serif">
							Jaek Jay
						</span>
					</v-col>
					<v-col>
						<div class="text-h4">Order Detail</div>
					</v-col>
				</v-row>

				<v-row>
					<v-col>
						<div class="text-h6">Customer</div>
						<div class="text-subtitle-1">
							<span>{{ entry.customer }}</span>
						</div>
					</v-col>
				</v-row>

				<v-row>
					<v-col>
						<div class="text-h6">Notes</div>
						<p>{{ entry["notes"] }}</p>
					</v-col>
				</v-row>
				<v-row>
					<v-col><div class="text-h6">Item List</div></v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-card
							elevation="0"
							outlined
							class=""
							v-for="(item, idx) in itemList"
							:key="idx">
							<v-card-title>{{ item.itemTitle }}</v-card-title>
							<v-card-text class="d-flex justify-space-between">
								<h1 class="primary--text">
									{{ idx }}
								</h1>
								<img
									class="image-preview"
									:src="item.imageLink" />
							</v-card-text>
							<v-card-text
								class="padless d-flex justify-space-between red--text">
								<h2>
									{{ "$" }}
									{{
										(
											item.itemUnitPrice *
												(1 + item.itemTax / 100) +
											0.00001
										).toFixed(2)
									}}
								</h2>
								<h2>
									{{ "QTY" }}
									{{ item.itemQty }}
								</h2>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
	name: "JaekJayCustomOrder",
	data() {
		return {
			entry: {},
		};
	},
	created() {},
	mounted: function () {
		publicService.getReceiptById(this.$route.params.id).then((response) => {
			this.entry = response.data;
			document.title = `${this.entry._data.id}|${this.entry.mtlTracking}|Shopping|នូតតូក - Noteto`;
		});
	},
	computed: {
		itemList() {
			if (!this.entry.itemList) return [];
			return this.entry.itemList;
		},
		collectingFee() {
			if (!this.entry.collectingFee) return 0;
			return (this.entry.collectingFee / 100) * this.subtotal;
		},
		subtotal() {
			let total = 0;
			if (!this.entry.itemList) return total;
			for (let i = 0; i < this.entry.itemList.length; i++) {
				let item = this.entry.itemList[i];
				total +=
					item.itemUnitPrice *
					item.itemQty *
					(1 + item.itemTax / 100);
			}
			return total;
		},
		totalDue() {
			return this.subtotal + this.collectingFee;
		},
	},
};
</script>
<style scoped>
div.text-h6 {
	color: #0091ea;
}

p,
div {
	white-space: pre-wrap;
}
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
