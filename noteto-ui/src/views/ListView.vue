<template>
	<v-container fluid class="pa-0">
		<v-tabs v-model="tab">
			<v-tab>List View</v-tab>
			<v-tab
				:disabled="
					databaseName != 'jaekJayCargo' &&
					databaseName != 'jaekJayCustomOrder'
				">
				Dashboard
			</v-tab>
		</v-tabs>

		<v-tabs-items v-model="tab">
			<v-tab-item>
				<v-data-table
					:items-per-page="itemsPerPage"
					:headers="headers"
					:items="filteredEntries"
					@update:items-per-page="setItemsPerPage">
					<template v-slot:header>
						<tr>
							<th
								v-for="(header, idx) in headers"
								:key="`header-${idx}`">
								<v-text-field
									class="ma-2"
									rounded
									v-model="search[header.value]"
									placeholder="filter"
									solo-inverted
									hide-details
									flat></v-text-field>
							</th>
						</tr>
					</template>

					<template v-slot:item="{ item, index }">
						<tr
							:class="[
								index % 2 == 0 ? 'bg-grey entry' : 'entry',
								selected == item._data.id ? 'selected-row' : '',
							]"
							:key="`item-${index}`"
							@click="highlightRow(item._data.id)"
							@dblclick="goToDetailForm(item._id)">
							<td
								v-for="(header, idx) in headers"
								:key="`header-${index}-${idx}`">
								<span
									v-if="
										header.isDefault &&
										header.value == '_data.id'
									">
									<a @click="goToDetailForm(item._id)">
										{{ item._data.id }}
									</a>
								</span>
								<span v-else-if="header.isDefault">
									{{ getDataText(header, item) }}
								</span>
								<span v-else>
									{{ getEntryText(header, item) }}
								</span>
							</td>
						</tr>
					</template>
				</v-data-table>
			</v-tab-item>
			<v-tab-item>
				<jaek-jay-dashboard></jaek-jay-dashboard>
			</v-tab-item>
		</v-tabs-items>
	</v-container>
</template>
<script>
import JaekJayDashboard from "@/components/JaekJayDashboard.vue";
import eventBus from "@/js/event-bus";
//import backendService from "../services/backend-service.js";
export default {
	name: "ListView",
	components: { "jaek-jay-dashboard": JaekJayDashboard },
	data() {
		return {
			tab: 0,
			datePicker: {},
			filter: {},
			defaultHeaders: [
				{
					value: "_data.id",
					text: "Id",
					align: "start",
					isDefault: true,
				},
				{
					value: "_data.createdBy",
					text: "Created By",
					align: "start",
					isDefault: true,
				},
				{
					value: "_data.dateCreated",
					text: "Date Created",
					align: "start",
					isDefault: true,
				},
				{
					value: "_data.comment",
					text: "Comment",
					align: "start",
					isDefault: true,
				},
			],
		};
	},
	mounted: function () {
		eventBus.$on("generateCsv", this.generateCsv);
	},
	computed: {
		currentDatabase() {
			return this.$store.getters["currentDatabase"];
		},
		databaseName() {
			return this.currentDatabase.value;
		},
		entries() {
			return this.$store.getters["entries"];
		},
		filteredEntries() {
			let entries = this.entries;
			for (let key in this.search) {
				let searchStr = this.search[key].trim().toLowerCase();
				let header = this.headers.find((header) => header.value == key);
				if (searchStr && searchStr.length) {
					if (header && !header.isDefault) {
						entries = entries.filter((e) => {
							let str = this.getEntryText(header, e);
							return str
								.toString()
								.trim()
								.toLowerCase()
								.includes(this.search[key].toLowerCase());
						});
					} else if (header && header.isDefault) {
						entries = entries.filter((e) => {
							let str = this.getDataText(header, e);
							return str
								.toString()
								.trim()
								.toLowerCase()
								.includes(this.search[key].toLowerCase());
						});
					}
				}
			}
			return entries;
		},
		headers() {
			let rawHeaders = this.$store.getters["headers"];
			let processedHeaders = [...this.defaultHeaders];
			if (!rawHeaders) return processedHeaders;
			for (let i = 0; i < rawHeaders.length; i++) {
				let processedHeader = { ...rawHeaders[i] };
				processedHeader.text = rawHeaders[i].displayName;
				processedHeader.align = "start";
				processedHeaders.push(processedHeader);
			}
			return processedHeaders;
		},
		itemsPerPage() {
			return this.$store.getters["itemsPerPage"];
		},
		search: {
			get: function () {
				return this.$store.getters["search"];
			},
			set: function (val) {
				this.$store.commit("setSearch", val);
			},
		},
		selected: {
			get: function () {
				return this.$store.getters["selectedRow"];
			},
			set: function (val) {
				this.$store.commit("setSelectedRow", val);
			},
		},
		routeName() {
			return this.$route.name;
		},
	},
	methods: {
		formatDate(rawDate) {
			let date = new Date(rawDate);
			return `${
				date.getMonth() + 1
			}/${date.getDate()}/${date.getFullYear()}`;
		},
		generateCsv() {
			let filteredEntries = this.filteredEntries;
			let headerStr = this.headers.map((header) => header.text).join(";");

			let rows = [];
			for (let i = 0; i < filteredEntries.length; i++) {
				let row = [];
				let entry = filteredEntries[i];
				this.headers.forEach((header) => {
					let str = "";
					if (header && !header.isDefault) {
						str = this.getEntryText(header, entry);
					} else if (header && header.isDefault) {
						str = this.getDataText(header, entry);
					}
					row.push(str);
				});
				rows.push(row);
			}

			let csvContent = "data:text/csv;charset=utf-8,";
			csvContent += headerStr + "\r\n";
			for (let i = 0; i < rows.length; i++) {
				let row = rows[i];
				let rowStr = row.join(";");
				csvContent += rowStr + "\r\n";
			}
			var encodedUri = encodeURI(csvContent);
			window.open(encodedUri);
		},
		getDataText(header, entry) {
			if (header.value == "_data.id") {
				return entry._data.id;
			} else if (header.value == "_data.dateCreated") {
				return this.formatDate(entry._data.dateCreated);
			} else if (header.value == "_data.createdBy") {
				return this.getFullName(entry._data.createdBy);
			} else if (header.value == "_data.comment") {
				return entry._data.comment;
			} else {
				return "";
			}
		},
		getEntryText(header, entry) {
			if (!header.type) {
				return entry[header.value];
			}
			if (!entry[header.value]) {
				return "";
			}
			if (header.type == "multipleSelect") {
				return entry[header.value].map((e) => e.displayName).join(", ");
			} else if (header.type == "singleSelect") {
				return entry[header.value].displayName;
			} else if (header.type == "singleUser") {
				return this.getFullName(entry[header.value]);
			} else if (header.type.includes("currency")) {
				return (
					header.options.prefix +
					" " +
					entry[header.value].toFixed(header.options.precision)
				);
			} else if (header.type.includes("weight")) {
				return (
					entry[header.value].toFixed(header.options.precision) +
					" " +
					header.options.suffix
				);
			} else if (header.type == "multipleUsers") {
				return entry[header.value]
					.map((e) => this.getFullName(e))
					.join(", ");
			} else if (header.type == "date") {
				return this.formatDate(entry[header.value]);
			} else if (header.type == "number") {
				return entry[header.value];
			} else {
				return entry[header.value];
			}
		},
		goToDetailForm(id) {
			this.$router
				.push({
					name: "DetailForm",
					params: { id: id },
					query: { database: this.currentDatabase.value },
				})
				.catch(() => {});
		},

		getFullName(user) {
			if (user) return `${user.first} ${user.last}`;
			else return "";
		},
		highlightRow(idx) {
			this.selected = idx;
		},
		isNumber(header) {
			if (header.type.includes("currency")) {
				return true;
			} else if (header.type.includes("weight")) {
				return true;
			} else if (header.type.includes("number")) {
				return true;
			} else {
				return false;
			}
		},
		setItemsPerPage(val) {
			this.$store.commit("setItemsPerPage", val);
		},
	},
	watch: {
		currentDatabase: function () {},
	},
	destroyed: function () {
		eventBus.$off("generateCsv");
	},
};
</script>
<style scoped>
tbody tr.entry:hover {
	background-color: #ff8521 !important;
	color: white;
}
tbody tr.entry:hover a {
	background-color: #ff8521 !important;
	color: white;
}
.selected-row {
	background-color: #0275d8 !important;
	color: white;
}
.selected-row a {
	text-decoration: none;
	color: white;
}
.bg-grey {
	background-color: #e6e6e6;
}
.filter {
	border-radius: 15px !important;
	min-height: 10px;
}
</style>
