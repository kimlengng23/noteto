<template>
	<v-data-table
		:items-per-page="itemsPerPage"
		:headers="headers"
		:items="filteredEntries"
		@update:items-per-page="setItemsPerPage">
		<template v-slot:header>
			<tr>
				<th v-for="header in headers" :key="header._id">
					<v-text-field
						class="ma-2 filter"
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
					selected == item.id ? 'selected-row' : '',
				]"
				@click="highlightRow(item.id)"
				@dblclick="goToDetailForm(item._id)">
				<td v-for="header in headers" :key="header._id">
					<span v-if="header.value != 'id'">
						{{ getEntryText(header, item) }}
					</span>
					<span v-else class="d-flex justify-end">
						<a @click="goToDetailForm(item._id)">
							{{ getEntryText(header, item) }}
						</a>
					</span>
				</td>
			</tr>
		</template>
	</v-data-table>
</template>
<script>
//import backendService from "../services/backend-service.js";
import eventBus from "../js/event-bus.js";
export default {
	name: "ListView",
	data() {
		return {
			datePicker: {},
			filter: {},

			headersInDict: {},
		};
	},
	mounted: function () {
		eventBus.$on("searchForEntries", this.searchForEntries);
		eventBus.$on("clearSearch", this.clearSearch);
	},
	computed: {
		database() {
			return this.$store.getters["currentDatabase"];
		},
		entries() {
			return this.$store.getters["entries"];
		},
		filteredEntries() {
			let entries = this.entries;
			for (let key in this.search) {
				let searchStr = this.search[key].trim().toLowerCase();
				let header = this.headers.find((header) => header.value == key);
				if (searchStr && searchStr.length && header) {
					entries = entries.filter((e) => {
						let str = this.getEntryText(header, e);
						return str
							.toString()
							.trim()
							.toLowerCase()
							.includes(this.search[key]);
					});
				}
			}
			return entries;
		},
		headers() {
			let rawHeaders = this.$store.getters["headers"];
			let processedHeaders = [];
			if (!rawHeaders) return processedHeaders;
			for (let i = 0; i < rawHeaders.length; i++) {
				let processedHeader = { ...rawHeaders[i] };
				processedHeader.text = rawHeaders[i].displayName;
				processedHeader.align = "start";
				processedHeaders.push(processedHeader);
			}
			return processedHeaders;
		},
		// search: {
		//   get: function () {
		//     return this.$store.getters["search"];
		//   },
		//   set: function (val) {
		//     this.$store.commit("setSearch", val);
		//   },
		// },
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
	},
	methods: {
		clearSearch() {
			this.search = {};
			this.searchForEntries();
		},
		formatDate(date) {
			if (!date) return null;
			const [year, month, day] = date.split("-");
			return `${month}/${day}/${year}`;
		},
		getEntryText(header, entry) {
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
				let date = new Date(entry[header.value]);
				return `${
					date.getMonth() + 1
				}/${date.getDate()}/${date.getFullYear()}`;
			} else if (header.type == "number") {
				return entry[header.value];
			} else {
				return entry[header.value];
			}
		},
		goToDetailForm(id) {
			this.$router
				.push({ name: "DetailForm", params: { id: id } })
				.catch(() => {});
		},
		getTableHeaders() {
			// backendService.getAllHeadersByDatabase(this.database).then((response) => {
			//   this.headers = response.data;
			//   this.headers.forEach((header) => {
			//     this.headersInDict[header.value] = header;
			//   });
			// });
		},
		getTableRows() {
			this.getTableHeaders();
			this.searchForEntries();
		},
		getFullName(user) {
			return user.first + " " + user.last;
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
		searchForEntries() {
			// this.search.database = this.database;
			// backendService
			//   .searchForEntries({ database: this.database })
			//   .then((response) => {
			//     this.entries = response.data;
			//   });
		},
	},
	watch: {
		database: function () {
			this.getTableRows();
		},
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
