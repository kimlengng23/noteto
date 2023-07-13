<template>
	<v-container>
		<h3 class="my-2">History</h3>
		<div v-for="history in historyLst" :key="history._id">
			<div>
				{{ history.createdBy.first }} {{ history.createdBy.last }} -
				<span class="font-italic">
					{{ new Date(history.dateCreated).toLocaleString() }}
				</span>
			</div>

			<v-container style="border-left: 1px solid lightblue" class="ml-2">
				<div
					v-for="(value, name, idx) in history.changes"
					:key="`${history._id}-${idx}`">
					{{ fieldToField[name].displayName }} - from
					<span class="blue--text text--lighten-2">
						{{ getEntryText(fieldToField[name], value.from) }}
					</span>
					to
					<span class="blue--text text--lighten-2">
						{{ getEntryText(fieldToField[name], value.to) }}
					</span>
				</div>
			</v-container>
			<v-divider class="my-2"></v-divider>
		</div>
	</v-container>
</template>
<script>
import _ from "lodash";
export default {
	name: "HistorySection",
	mixins: [],
	mounted: function () {},
	props: {
		historyLst: {
			type: Array,
			default() {
				return [];
			},
		},
		fieldToField: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	methods: {
		getEntryText(field, value) {
			if (_.isEmpty(value) && !_.isNumber(value)) {
				return "'EMPTY'";
			}
			if (field.type == "multipleSelect") {
				return value.map((e) => e.displayName).join(", ");
			} else if (field.type == "singleSelect") {
				return value.displayName;
			} else if (field.type == "singleUser") {
				return this.getFullName(value);
			} else if (field.type.includes("currency")) {
				return (
					field.options.prefix +
					" " +
					value.toFixed(field.options.precision)
				);
			} else if (field.type.includes("weight")) {
				return (
					value.toFixed(field.options.precision) +
					" " +
					field.options.suffix
				);
			} else if (field.type == "multipleUsers") {
				return value.map((e) => this.getFullName(e)).join(", ");
			} else if (field.type == "date") {
				let date = new Date(value);
				return `${
					date.getMonth() + 1
				}/${date.getDate()}/${date.getFullYear()}`;
			} else if (field.type == "number") {
				return value;
			} else {
				return value;
			}
		},
	},
};
</script>
