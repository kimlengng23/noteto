<template>
	<v-container fluid class="pa-0">
		<v-card elevation="0" class="rounded-lg" outlined>
			<v-card-title class="layout-header">
				<div>Add Layout</div>
				<div class="layout-actions">
					<v-btn
						depressed
						color="primary"
						class="ml-2"
						@click="addRow"
						:disabled="!databaseValue">
						<v-icon left>mdi-arrow-expand-vertical</v-icon>
						Add Row
					</v-btn>
					<v-btn
						depressed
						color="success"
						class="ml-2"
						@click="saveLayout"
						:loading="isLoading"
						:disabled="!databaseValue">
						<v-icon left>mdi-content-save</v-icon>
						Save
					</v-btn>
				</div>
			</v-card-title>
			<v-card-text>
				<v-row v-for="(row, idxI) in rows" :key="idxI" class="mx-2">
					<v-col md="2">
						<v-autocomplete
							outlined
							dense
							label="Type"
							:items="rowTypes"
							item-text="displayName"
							item-value="value"
							return-object
							v-model="selectedRowTypes[idxI]"></v-autocomplete>
					</v-col>
					<v-col v-for="(col, idxJ) in row" :key="idxJ">
						<v-autocomplete
							outlined
							dense
							v-if="selectedRowTypes[idxI].value == 'row'"
							:label="`Item (${idxI + 1},${idxJ + 1})`"
							:items="fields"
							item-text="displayName"
							item-value="value"
							v-model="col.field"></v-autocomplete>
						<v-text-field
							outlined
							dense
							v-else-if="selectedRowTypes[idxI].value == 'label'"
							:label="`Label (${idxI + 1},${idxJ + 1})`"
							v-model="col.label"></v-text-field>
					</v-col>
					<v-col class="d-flex justify-content-end">
						<v-btn
							icon
							class="primary ml-2 mt-1"
							@click="addColumn(idxI)"
							depressed
							dark>
							<v-icon>mdi-arrow-expand-horizontal</v-icon>
						</v-btn>
						<v-btn
							icon
							class="red ml-2 mt-1"
							@click="removeColumn(idxI)"
							depressed
							dark>
							<v-icon>mdi-minus</v-icon>
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import eventBus from "@/js/event-bus.js";
import backendService from "@/services/backend-service.js";
import formMixin from "@/js/form-mixin";
export default {
	name: "FormLayout",
	mixins: [formMixin],

	computed: {
		rowTypes() {
			return this.$store.getters["dropdowns"]["rowType"];
		},
		fields() {
			return (
				this.$store.getters["databaseToFields"][this.databaseValue] ||
				[]
			);
		},
		currentDatabase() {
			return this.$store.getters["currentDatabase"] || {};
		},
		databaseValue() {
			return this.currentDatabase.value || "";
		},
		databaseToLayoutMappings() {
			return this.$store.getters["databaseToLayoutMappings"] || {};
		},
	},
	data() {
		return {
			types: [
				{ name: "Row", id: 1 },
				{ name: "Label", id: 2 },
			],
			rows: [],
			selectedRowTypes: [],
		};
	},
	mounted: function () {
		if (this.databaseValue) this.getLayoutByDatabase();
	},
	methods: {
		addRow() {
			this.rows.push([]);
			this.selectedRowTypes.push(
				this.rowTypes.find((type) => type.value == "row"),
			);
		},
		addColumn(rowNum) {
			let cols = this.rows[rowNum];
			if (cols.length < 4) cols.push({ label: "", field: "" });
		},
		removeColumn(rowNum) {
			let cols = this.rows[rowNum];
			if (cols.length > 0) {
				cols.pop();
			} else {
				this.rows.splice(rowNum, 1);
				this.selectedRowTypes.splice(rowNum, 1);
			}
		},
		returnWhole(item) {
			return item;
		},
		getLayoutByDatabase() {
			let layout = [];
			this.rows = [];
			this.selectedRowTypes = [];
			if (this.databaseToLayoutMappings[this.databaseValue]) {
				layout = this.databaseToLayoutMappings[this.databaseValue];
			}
			layout.forEach((row) => {
				this.rows.push(row.cols);
				this.selectedRowTypes.push(row.type);
			});
		},
		saveLayout() {
			let layout = [];
			this.rows.forEach((row, idx) => {
				layout.push({
					order: idx + 1,
					cols: row,
					database: this.databaseValue,
					type: this.selectedRowTypes[idx],
				});
			});
			this.isLoading = true;
			backendService
				.removeLayoutByDatabase(this.databaseValue)
				.then(() => {
					backendService.addLayout(layout).then(() => {
						this.$store.commit("setLayout", layout);
						setTimeout(() => {
							this.isLoading = false;
							eventBus.$emit(
								"setSnackbar",
								"Successfully updated the layout",
								"success",
							);
						}, 1000);
					});
				});
		},
	},
};
</script>

<style scoped>
.layout-header {
	display: grid;
	grid-template-columns: max-content minmax(0, 1fr);
	gap: 12px;
	align-items: center;
}

.layout-actions {
	display: flex;
	justify-content: flex-end;
}

@media only screen and (max-width: 960px) {
	.layout-header {
		grid-template-columns: 1fr;
	}

	.layout-actions {
		justify-content: flex-start;
		flex-wrap: wrap;
	}
}
</style>
