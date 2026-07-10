<template>
	<div>
		<v-card class="grey lighten-3" elevation="0">
			<v-card-text class="py-2 px-0">
				<v-row no-gutters>
					<v-col class="d-flex flex-column" cols="4">
						<v-card
							class="mx-2"
							elevation="0"
							outlined
							height="100%">
							<v-card-text>
								<h3>Total Expense</h3>
								<animated-number
									:value="totalExpense"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
							<v-card-text>
								<h3>Amount Pending</h3>
								<animated-number
									:value="totalDue"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
							<v-card-text>
								<h3>Total Profit</h3>
								<animated-number
									:value="totalProfit"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
							<v-card-text>
								<h3>Total Revenue</h3>
								<animated-number
									:value="totalRevenue"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
							<v-card-text>
								<h3>Total Paid - Total Expense</h3>
								<animated-number
									:value="totalPaid - totalExpense"
									:formatValue="
										formatToPrice
									"></animated-number>
							</v-card-text>
						</v-card>
					</v-col>
					<v-col>
						<v-row>
							<v-col>
								<v-card class="mx-2" elevation="0" outlined>
									<v-card-title>
										Amounts by Payment Status
									</v-card-title>
									<v-card-text>
										<Doughnut
											style="height: 100%"
											ref="amountDueData"
											:data="amountDueData"
											:options="chartOptions"></Doughnut>
									</v-card-text>
								</v-card>
							</v-col>
							<v-col>
								<v-card class="mx-2" elevation="0" outlined>
									<v-card-title>
										Expenses By Type
									</v-card-title>
									<v-card-text>
										<Doughnut
											style="height: 100%"
											ref="expenseChart"
											:data="expenseData"
											:options="chartOptions"></Doughnut>
									</v-card-text>
								</v-card>
							</v-col>
						</v-row>
						<v-row>
							<v-col>
								<v-card class="mx-2" elevation="0" outlined>
									<v-card-title>Revenue by Type</v-card-title>
									<v-card-text>
										<Doughnut
											style="height: 100%"
											ref="revenueData"
											:data="revenueData"
											:options="chartOptions"></Doughnut>
									</v-card-text>
								</v-card>
							</v-col>
							<v-col>
								<v-card class="mx-2" elevation="0" outlined>
									<v-card-title>Profit by Type</v-card-title>
									<v-card-text>
										<Doughnut
											style="height: 100%"
											ref="profitData"
											:data="profitData"
											:options="chartOptions"></Doughnut>
									</v-card-text>
								</v-card>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<v-data-table
			v-if="!isMobile"
			:headers="headerSets"
			:items="items"
			:items-per-page="-1">
			<template v-slot:item="{ item, index }">
				<tr
					:class="[index % 2 == 0 ? 'bg-grey' : '']"
					:key="`item-${index}`">
					<td
						class="text-right"
						v-for="(header, idx) in headerSets"
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
							{{ `${formatToPrice(item[header.value])}` }}
						</span>
						<span v-else-if="header.value == 'profit'">
							{{ `${formatToPrice(item[header.value])}` }}
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
			:headerSets="headerSets"
			:items="items"
			:items-per-page="-1">
			<template v-slot:item="{ item, index }">
				<tr
					class="d-flex flex-column"
					style="border-bottom: gray solid 1px"
					:key="`item-${index}`">
					<td
						style="border: none"
						v-for="(header, idx) in headerSets"
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
								{{ `${formatToPrice(item[header.value])}` }}
							</span>
							<span v-else-if="header.value == 'profit'">
								{{ `${formatToPrice(item[header.value])}` }}
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
import backendService from "@/services/backend-service";
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
	ArcElement,
);

export default {
	name: "JaekJayDashboard",
	components: { Doughnut, AnimatedNumber },
	data() {
		return {
			totalDue: 0,
			totalExpense: 0,
			totalProfit: 0,
			totalRevenue: 0,
			totalPaid: 0,
			chartOptions: {
				maintainAspectRatio: false,
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
			revenueData: {
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
			profitData: {
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
			headerSets: [
				{
					text: "#",
					align: "end",
					value: "idx",
				},
				{
					text: "Date Created",
					align: "end",
					value: "dateCreated",
				},
				{
					text: "Type",
					align: "end",
					value: "type",
				},
				{
					text: "Tracking",
					align: "end",
					value: "tracking",
				},
				{
					text: "Payment Status",
					align: "end",
					value: "paymentStatus",
				},
				{
					text: "Amount",
					align: "end",
					value: "amount",
				},
				{
					text: "Profit",
					align: "end",
					value: "profit",
				},
			],
		};
	},
	mounted: function () {
		this.getDashboardData();
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
					navigator.userAgent,
				)
			) {
				return true;
			} else {
				return false;
			}
		},
		formatter() {
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			});
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
			if (value) return `${this.formatter.format(value)}`;
			else return "$0.00";
		},
		getDashboardData() {
			backendService.getDashboardData().then((response) => {
				this.items = response.data;
				this.renderChart();
			});
		},
		renderChart() {
			let expenseDict = {};
			let amountDueDict = {};
			let revenueDict = {};
			let profitDict = {};
			for (let i = 0; i < this.items.length; i++) {
				let item = this.items[i];
				if (isNaN(item.amount) || isNaN(item.profit)) {
					console.log(item);
				}
				this.totalProfit += item.profit;
				this.totalExpense += item.amount;
				if (!expenseDict[item.type]) expenseDict[item.type] = 0;
				expenseDict[item.type] += item.amount;
				if (!amountDueDict[item.paymentStatus])
					amountDueDict[item.paymentStatus] = 0;
				amountDueDict[item.paymentStatus] += item.amount + item.profit;
				if (!revenueDict[item.type]) revenueDict[item.type] = 0;
				revenueDict[item.type] += item.amount + item.profit;
				if (!profitDict[item.type]) profitDict[item.type] = 0;
				profitDict[item.type] += item.profit;
			}

			this.totalRevenue = this.totalExpense + this.totalProfit;
			let data1 = [];
			let labels1 = [];
			let data2 = [];
			let labels2 = [];
			let data3 = [];
			let labels3 = [];
			let data4 = [];
			let labels4 = [];
			for (let key in expenseDict) {
				labels1.push(key);
				data1.push(expenseDict[key].toFixed(2));
			}
			for (let key in revenueDict) {
				labels3.push(key);
				data3.push(revenueDict[key].toFixed(2));
			}
			for (let key in profitDict) {
				labels4.push(key);
				data4.push(profitDict[key].toFixed(2));
			}
			for (let key in amountDueDict) {
				let value = amountDueDict[key];
				if (key != "Paid") {
					this.totalDue += value;
				} else {
					this.totalPaid += value;
				}
				labels2.push(key);
				data2.push(value.toFixed(2));
			}
			console.log(expenseDict, profitDict, amountDueDict, revenueDict);
			let expenseData = {
				labels: labels1,
				datasets: [
					{
						data: data1,
						backgroundColor: [
							"rgb(255, 102, 102)",
							"rgb(255, 153, 51)",
							"rgb(51, 255, 51)",
							"rgb(51, 255, 255)",
							"rgb(51, 51, 255)",
							"rgb(255, 51, 255)",
							"rgb(160, 160, 160)",
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
							"rgb(255, 102, 102)",
							"rgb(255, 153, 51)",
							"rgb(51, 255, 51)",
							"rgb(51, 255, 255)",
							"rgb(51, 51, 255)",
							"rgb(255, 51, 255)",
							"rgb(160, 160, 160)",
						],
						hoverOffset: 4,
					},
				],
			};
			let revenueData = {
				labels: labels3,
				datasets: [
					{
						data: data3,
						backgroundColor: [
							"rgb(255, 102, 102)",
							"rgb(255, 153, 51)",
							"rgb(51, 255, 51)",
							"rgb(51, 255, 255)",
							"rgb(51, 51, 255)",
							"rgb(255, 51, 255)",
							"rgb(160, 160, 160)",
						],
						hoverOffset: 4,
					},
				],
			};
			let profitData = {
				labels: labels4,
				datasets: [
					{
						data: data4,
						backgroundColor: [
							"rgb(255, 102, 102)",
							"rgb(255, 153, 51)",
							"rgb(51, 255, 51)",
							"rgb(51, 255, 255)",
							"rgb(51, 51, 255)",
							"rgb(255, 51, 255)",
							"rgb(160, 160, 160)",
						],
						hoverOffset: 4,
					},
				],
			};
			this.expenseData = expenseData;
			this.amountDueData = amountDueData;
			this.revenueData = revenueData;
			this.profitData = profitData;
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
