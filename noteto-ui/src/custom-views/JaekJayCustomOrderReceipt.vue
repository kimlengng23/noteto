<template>
	<v-container class="white mt-2 pa-0 pa-lg-2">
		<v-card elevation="0">
			<v-card-text>
				<v-row>
					<v-col class="text-lg-h4 text-md-h4 text-h6">
						<span style="font-family: 'Dangrek', cursive">
							ចែកចាយ
						</span>
						-
						<span style="font-family: 'Sora', sans-serif">
							Jaek Jay
						</span>
					</v-col>
					<v-col>
						<div class="text-lg-h4 text-md-h4 text-h6">
							Order Invoice
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<v-row>
							<v-col cols="8">
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 label">
									Invoice Number
								</div>
							</v-col>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
									{{ entry._data.id }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="red white--text"
							v-if="entry.paymentStatus == 'Pending'">
							<v-col cols="8">
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2">
									Payment Status
								</div>
							</v-col>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
									{{ entry.paymentStatus }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="green white--text"
							v-else-if="entry.paymentStatus == 'Paid'">
							<v-col cols="8">
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2">
									Payment Status
								</div>
							</v-col>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
									{{ entry.paymentStatus }}
								</div>
							</v-col>
						</v-row>
					</v-col>
					<v-col>
						<v-row>
							<v-col cols="8">
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 label">
									Tracking Number
								</div>
							</v-col>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
									{{ entry.mtlTracking }}
								</div>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 label">
									Date Created
								</div>
							</v-col>
							<v-col>
								<div
									class="text-lg-h6 text-md-h6 text-subtitle-2 float-right">
									{{ entry._data.dateCreated }}
								</div>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="8">
						<div
							class="text-lg-h6 text-md-h6 text-subtitle-2 label">
							Customer
						</div>
						<div class="text-lg-h6 text-md-h6 text-subtitle-2">
							{{ entry.customer }}
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="8">
						<div
							class="text-lg-h6 text-md-h6 text-subtitle-2 label">
							Collecting Fee
						</div>
						<div class="text-lg-h6 text-md-h6 text-subtitle-2">
							{{ entry.collectingFee }} %
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="8">
						<div
							class="text-lg-h6 text-md-h6 text-subtitle-2 label">
							Notes
						</div>
						<div class="text-lg-h6 text-md-h6 text-subtitle-2">
							{{ entry["notes"] }}
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<div
							class="ttext-lg-h6 text-md-h6 text-subtitle-2 label">
							Item List
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-simple-table class="pa-0">
							<thead>
								<tr>
									<th class="text-left">Item</th>
									<th class="text-right">Qty</th>
									<th class="text-right">Unit Price</th>
									<th class="text-right">Line Total</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, idx) in itemList" :key="idx">
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2"
										style="max-width: 800px">
										<div>{{ item.itemTitle }}</div>
									</td>
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2 text-right">
										{{ item.itemQty }}
									</td>
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2 text-right">
										$
										{{
											(
												item.itemUnitPrice *
													(1 + item.itemTax / 100.0) +
												0.00001
											).toFixed(2)
										}}
									</td>

									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2 text-right">
										$
										{{
											(
												item.itemQty *
													item.itemUnitPrice *
													(1 + item.itemTax / 100) +
												0.00001
											).toFixed(2)
										}}
									</td>
								</tr>
								<tr>
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2">
										<div>
											Fee {{ entry.collectingFee }} %
										</div>
									</td>
									<td></td>
									<td></td>

									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2 text-right">
										$ {{ collectingFee.toFixed(2) }}
									</td>
								</tr>
								<tr>
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2">
										<div>Total</div>
									</td>
									<td></td>
									<td></td>
									<td
										class="text-caption text-md-body-2 text-lg-subtitle-2 text-right">
										$ {{ totalDue.toFixed(2) }}
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import publicService from "@/services/public-backend-service";

export default {
	name: "JaekJayCustomOrderReceipt",
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
.label {
	color: #0091ea;
}

p,
div {
	white-space: pre-wrap;
}
</style>
