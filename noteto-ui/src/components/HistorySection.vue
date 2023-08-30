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
import mixin from "@/js/mixin.js";
export default {
	name: "HistorySection",
	mixins: [mixin],
	mounted: function () {},
	props: {
		historyLst: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	methods: {},
};
</script>
