<template>
	<v-container>
		<v-card elevation="0">
			<v-card-text>
				<v-row>
					<v-col>
						<div class="text-h4">Shipping Invoice</div>
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
									{{ entry["id"] }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="red white--text"
							v-if="entry.customerPaymentStatus == 'Pending'">
							<v-col>
								<div><h2>Payment Status</h2></div>
							</v-col>
							<v-col>
								<div class="text-h5 float-right">
									{{ entry.customerPaymentStatus }}
								</div>
							</v-col>
						</v-row>
						<v-row
							class="green white--text"
							v-else-if="entry.customerPaymentStatus == 'Paid'">
							<v-col>
								<div><h2>Payment Status</h2></div>
							</v-col>
							<v-col>
								<div class="text-h5 float-right">
									{{ entry.customerPaymentStatus }}
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
									{{ entry["mtlTracking#"] }}
								</div>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<div class="text-h6">Date Shipped</div>
							</v-col>
							<v-col>
								<div class="text-subtitle-1 float-right">
									{{ entry["dateShipped"] }}
								</div>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<div class="text-h6">Sender</div>
						<div class="text-subtitle-1">
							<span>
								{{ entry["customer"] }} -
								{{ entry["customerNumber"] }}
							</span>
						</div>
						<div class="text-subtitle-1">
							{{ entry["customerAddress"] }}
						</div>
					</v-col>
					<v-col>
						<div class="text-h6">Receiver</div>
						<div class="text-subtitle-1">
							<span>
								{{ entry["receiver"] }} -
								{{ entry["receiverNumber"] }}
							</span>
						</div>
						<div class="text-subtitle-1">
							{{ entry["receiverAddress"] }}
						</div>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<div class="text-h6">Number of Box</div>
						<div class="text-subtitle-1">
							{{ entry["numBoxes"] }}
						</div>
					</v-col>
					<v-col>
						<div class="text-h6">Total Weight</div>
						<div class="text-subtitle-1">
							{{ entry["totalWeight"] }} {{ "lbs" }}
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
					<v-col><div class="text-h6">Charge List</div></v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-simple-table>
							<thead>
								<tr>
									<th class="text-left">Item</th>
									<th class="text-left">Qty</th>
									<th class="text-left">Unit Price</th>
									<th class="text-left">Line Total</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="(item, idx) in chargeList"
									:key="idx">
									<td class="text-subtitle-1">
										{{ item.itemDescription }}
									</td>
									<td class="text-subtitle-1">
										{{ item.quantity }}
									</td>
									<td class="text-subtitle-1">
										{{ "$" }}
										{{ item.unitPrice.toFixed(2) }}
									</td>
									<td class="text-subtitle-1">
										{{ "$" }}
										{{
											(
												item.quantity * item.unitPrice +
												0.00001
											).toFixed(2)
										}}
									</td>
								</tr>
								<tr>
									<td class="text-subtitle-1">Total</td>
									<td></td>
									<td></td>
									<td class="text-subtitle-1">
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
	name: "JaekJayCargoReceipt",
	data() {
		return {
			entry: {},
		};
	},
	mounted: function () {
		publicService.getReceiptById(this.$route.params.id).then((response) => {
			this.entry = response.data;
		});
	},
	computed: {
		chargeList() {
			if (!this.entry.chargeList) return [];
			return this.entry.chargeList;
		},
		totalDue() {
			let total = 0;
			if (!this.entry.chargeList) return total;
			for (let i = 0; i < this.entry.chargeList.length; i++) {
				let item = this.entry.chargeList[i];
				total += item.unitPrice * item.quantity;
			}
			return total;
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
