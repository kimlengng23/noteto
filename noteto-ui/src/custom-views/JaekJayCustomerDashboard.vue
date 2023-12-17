<template>
	<div>
		<v-card elevation="0" outlined>
			<v-card-title>Welcome, {{ customerName }}!</v-card-title>
			<v-card-text>
				<v-row no-gutters>
					<v-col class="d-flex flex-column">
						<v-card
							class="mx-2"
							elevation="0"
							outlined
							height="100%">
							<v-card-title>Total Expenses</v-card-title>
							<v-card-text class="text-h3 d-flex align-center">
								<animated-number
									:value="totalExpenses"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
						</v-card>
						<v-card
							class="mx-2"
							elevation="0"
							outlined
							height="100%">
							<v-card-title>Total Amount Due</v-card-title>
							<v-card-text class="text-h3 d-flex align-center">
								<animated-number
									:value="totalDue"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col>
						<v-card
							class="mx-2"
							elevation="0"
							outlined
							height="100%">
							<v-card-title>
								Amounts by Payment Status
							</v-card-title>
							<v-card-text>
								<Doughnut
									:data="amountDueData"
									:options="chartOptions"></Doughnut>
							</v-card-text>
						</v-card>
					</v-col>
					<v-col>
						<v-card
							class="mx-2"
							elevation="0"
							outlined
							height="100%">
							<v-card-title>Expenses By Type</v-card-title>
							<v-card-text>
								<Doughnut
									ref="expenseChart"
									:data="expenseData"
									:options="chartOptions"></Doughnut>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<v-data-table
			v-if="!isMobile"
			:headers="headers"
			:items="items"
			:items-per-page="-1">
			<template v-slot:item="{ item, index }">
				<tr
					:class="[index % 2 == 0 ? 'bg-grey' : '']"
					:key="`item-${index}`">
					<td
						v-for="(header, idx) in headers"
						:key="`header-${index}-${idx}`">
						<span v-if="header.value == 'idx'">
							<a
								v-if="item.type == 'Shipment'"
								:href="`https://noteto.jaekjay.com/#/custom/view/jaekjaycargoreceipt/${item._id}`"
								target="_blank">
								{{ item.idx }}
							</a>
							<a
								v-else
								:href="`https://noteto.jaekjay.com/#/custom/view/jaekjaycustomorderreceipt/${item._id}`"
								target="_blank">
								{{ item.idx }}
							</a>
						</span>
						<span v-else-if="header.value == 'paymentStatus'">
							<span
								class="green--text font-weight-bold"
								v-if="item.paymentStatus == 'Paid'">
								{{ item.paymentStatus }}
							</span>
							<span class="red--text font-weight-bold" v-else>
								{{ item.paymentStatus }}
							</span>
						</span>
						<span v-else-if="header.value == 'dateCreated'">
							{{ formatDate(item.dateCreated) }}
						</span>
						<span v-else-if="header.value == 'amount'">
							{{ `$ ${item[header.value].toFixed(2)}` }}
						</span>
						<span v-else>
							{{ item[header.value] }}
						</span>
					</td>
				</tr>
			</template>
		</v-data-table>
		<v-data-table
			v-else
			:headers="headers"
			:items="items"
			:items-per-page="-1">
			<template v-slot:item="{ item, index }">
				<tr
					class="d-flex flex-column"
					style="border-bottom: gray solid 1px"
					:key="`item-${index}`">
					<td
						style="border: none"
						v-for="(header, idx) in headers"
						:key="`header-${index}-${idx}`">
						<v-container fluid class="d-flex justify-space-between">
							<span>
								{{ header.text }}
							</span>
							<span v-if="header.value == 'idx'">
								<a
									v-if="item.type == 'Shipment'"
									:href="`https://noteto.jaekjay.com/#/custom/view/jaekjaycargoreceipt/${item._id}`"
									target="_blank">
									{{ item.idx }}
								</a>
								<a
									v-else
									:href="`https://noteto.jaekjay.com/#/custom/view/jaekjaycustomorderreceipt/${item._id}`"
									target="_blank">
									{{ item.idx }}
								</a>
							</span>
							<span v-else-if="header.value == 'paymentStatus'">
								<span
									class="green--text font-weight-bold"
									v-if="item.paymentStatus == 'Paid'">
									{{ item.paymentStatus }}
								</span>
								<span class="red--text font-weight-bold" v-else>
									{{ item.paymentStatus }}
								</span>
							</span>
							<span v-else-if="header.value == 'dateCreated'">
								{{ formatDate(item.dateCreated) }}
							</span>
							<span v-else-if="header.value == 'amount'">
								{{ `$ ${item[header.value].toFixed(2)}` }}
							</span>
							<span v-else>
								{{ item[header.value] }}
							</span>
						</v-container>
					</td>
				</tr>
			</template>
		</v-data-table>
	</div>
</template>
<script>
import publicBackendService from "@/services/public-backend-service";
import AnimatedNumber from "animated-number-vue";
import { Doughnut } from "vue-chartjs";
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
	ArcElement,
} from "chart.js";
ChartJS.register(
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
	ArcElement
);

export default {
	name: "JaekJayCustomerDashboard",
	components: { Doughnut, AnimatedNumber },
	data() {
		return {
			totalDue: 0,
			totalExpenses: 0,
			chartOptions: {
				plugins: {
					legend: {
						position: "right",
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || "";

								if (label) {
									label += ": ";
								}
								if (context.parsed !== null) {
									label += new Intl.NumberFormat("en-US", {
										style: "currency",
										currency: "USD",
									}).format(context.parsed);
								}
								return label;
							},
						},
					},
				},
			},
			amountDueData: {
				labels: ["Red", "Blue", "Yellow"],
				datasets: [
					{
						label: "My First Dataset",
						data: [0, 0, 100],
						backgroundColor: [
							"rgb(255, 99, 132)",
							"rgb(54, 162, 235)",
							"rgb(255, 205, 86)",
							"rgb(129, 255, 162)",
						],
						hoverOffset: 4,
					},
				],
			},
			expenseData: {
				labels: ["Red", "Blue", "Yellow"],
				datasets: [
					{
						label: "My First Dataset",
						data: [0, 0, 100],
						backgroundColor: [
							"rgb(255, 99, 132)",
							"rgb(54, 162, 235)",
							"rgb(255, 205, 86)",
							"rgb(129, 255, 162)",
						],
						hoverOffset: 4,
					},
				],
			},
			items: [],
			headers: [
				{
					text: "#",
					align: "start",
					value: "idx",
				},
				{
					text: "Date Created",
					align: "start",
					value: "dateCreated",
				},
				{
					text: "Type",
					align: "start",
					value: "type",
				},
				{
					text: "Tracking",
					align: "start",
					value: "tracking",
				},
				{
					text: "Payment Status",
					align: "start",
					value: "paymentStatus",
				},
				{
					text: "Amount",
					align: "start",
					value: "amount",
				},
			],
		};
	},
	beforeMount: function () {
		this.getCustomerDashboard();
	},
	computed: {
		currentUser() {
			return this.$store.getters["currentUser"];
		},
		customerName() {
			return this.currentUser.first + " " + this.currentUser.last;
		},
		isMobile() {
			if (
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				)
			) {
				return true;
			} else {
				return false;
			}
		},
	},
	methods: {
		formatDate(rawDate) {
			let date = new Date(rawDate);
			return `${
				date.getMonth() + 1
			}/${date.getDate()}/${date.getFullYear()}`;
		},
		formatToPrice(value) {
			return `$ ${value.toFixed(2)}`;
		},
		getCustomerDashboard() {
			publicBackendService.getCustomerDashboard().then((response) => {
				this.items = response.data;
				this.renderChart();
			});
		},
		renderChart() {
			let expenseDict = {};
			let amountDueDict = {};
			for (let i = 0; i < this.items.length; i++) {
				let item = this.items[i];
				if (!expenseDict[item.type]) expenseDict[item.type] = 0;
				expenseDict[item.type] += item.amount;
				if (!amountDueDict[item.paymentStatus])
					amountDueDict[item.paymentStatus] = 0;
				amountDueDict[item.paymentStatus] += item.amount;
			}
			let data1 = [];
			let labels1 = [];
			let data2 = [];
			let labels2 = [];
			for (let key in expenseDict) {
				labels1.push(key);
				data1.push(expenseDict[key].toFixed(2));
			}
			for (let key in amountDueDict) {
				let value = amountDueDict[key];
				this.totalExpenses += value;
				if (key != "Paid") {
					this.totalDue += value;
				}
				labels2.push(key);
				data2.push(value.toFixed(2));
			}
			let expenseData = {
				labels: labels1,
				datasets: [
					{
						data: data1,
						backgroundColor: [
							"rgb(255, 99, 132)",
							"rgb(54, 162, 235)",
							"rgb(255, 205, 86)",
							"rgb(129, 255, 162)",
						],
						hoverOffset: 4,
					},
				],
			};
			let amountDueData = {
				labels: labels2,
				datasets: [
					{
						data: data2,
						backgroundColor: [
							"rgb(255, 99, 132)",
							"rgb(54, 162, 235)",
							"rgb(255, 205, 86)",
							"rgb(129, 255, 162)",
						],
						hoverOffset: 4,
					},
				],
			};
			this.expenseData = expenseData;
			this.amountDueData = amountDueData;
			//this.renderChart(this.chartData, this.options);
		},
	},
};
</script>
<style>
a {
	text-decoration: none;
}
.bg-grey {
	background-color: #e6e6e6;
}
</style>
