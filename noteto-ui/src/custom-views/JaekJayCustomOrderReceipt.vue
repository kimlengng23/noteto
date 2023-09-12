<template>
	<v-container>
		<v-card elevation="0">
			<v-card-text>
				<v-row>
					<v-col>
						<div class="text-h4">Order Invoice</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<v-row>
							<v-col>
								<div class="text-h6">Invoice Number</div>
							</v-col>
							<v-col>
								<div class="text-subtitle-1 float-right">
									{{ entry._data.id }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="red white--text"
							v-if="entry.paymentStatus == 'Pending'">
							<v-col>
								<div><h2>Payment Status</h2></div>
							</v-col>
							<v-col>
								<div class="text-h5 float-right">
									{{ entry.paymentStatus }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="green white--text"
							v-else-if="entry.paymentStatus == 'Paid'">
							<v-col>
								<div><h2>Payment Status</h2></div>
							</v-col>
							<v-col>
								<div class="text-h5 float-right">
									{{ entry.paymentStatus }}
								</div>
							</v-col>
						</v-row>
					</v-col>
					<v-col>
						<v-row>
							<v-col>
								<div class="text-h6">Tracking Number</div>
							</v-col>
							<v-col>
								<div class="text-subtitle-1 float-right">
									{{ entry.mtlTracking }}
								</div>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<div class="text-h6">Date Created</div>
							</v-col>
							<v-col>
								<div class="text-subtitle-1 float-right">
									{{ entry._data.dateCreated }}
								</div>
							</v-col>
						</v-row>
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
						<div class="text-h6">Collecting Fee</div>
						<div class="text-subtitle-1">
							<span>{{ entry.collectingFee }} %</span>
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
						<v-simple-table>
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
										class="text-subtitle-1"
										style="max-width: 800px">
										<div>{{ item.itemTitle }}</div>
									</td>
									<td class="text-subtitle-1 text-right">
										{{ item.itemQty }}
									</td>
									<td class="text-subtitle-1 text-right">
										$
										{{
											(
												item.itemUnitPrice *
													(1 + item.itemTax / 100.0) +
												0.00001
											).toFixed(2)
										}}
									</td>

									<td class="text-subtitle-1 text-right">
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
									<td class="text-subtitle-1">
										<div>
											Fee {{ entry.collectingFee }} %
										</div>
									</td>
									<td></td>
									<td></td>

									<td class="text-subtitle-1 text-right">
										$ {{ collectingFee.toFixed(2) }}
									</td>
								</tr>
								<tr>
									<td class="text-subtitle-1">
										<div>Total</div>
									</td>
									<td></td>
									<td></td>
									<td class="text-subtitle-1 text-right">
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
			//document.title = `${this.entry["id"] - this.entry["mtlTracking#"]}`;
			this.entry = response.data;
			document.title = `Order #${this.entry._data.id} - ${this.entry.mtlTracking} - នូតតូក - Noteto`;
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
.row {
	border: 1px solid;
}
</style>
