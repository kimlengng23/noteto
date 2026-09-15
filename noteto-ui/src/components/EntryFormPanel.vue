<template>
	<v-container fluid class="entry-form-panel white">
		<div class="text-center">
			<v-progress-circular
				indeterminate
				color="primary"
				v-if="setTimeoutLoading"></v-progress-circular>
		</div>
		<v-card
			elevation="0"
			min-width="350"
			width="100%"
			v-if="!setTimeoutLoading">
			<v-card-text class="entry-form-content">
				<div v-if="!embedded || !isNew" class="mb-3">
					<h2 v-if="isNew" class="primary--text">New Entry</h2>
					<template v-else>
						<h2 class="primary--text">
							Entry Number: {{ entry._data?.id }}
						</h2>
						<div class="entry-detail-meta">
							<span>
								<v-icon small>mdi-calendar</v-icon>
								{{ convertDateToReadable(entry._data?.dateCreated) }}
							</span>
							<span>
								<v-icon small>mdi-account</v-icon>
								{{ getFullName(entry._data?.createdBy) }}
							</span>
						</div>
					</template>
				</div>

				<template v-if="isNew">
					<div
						class="d-flex flex-wrap align-center justify-space-between mb-3">
						<div class="text--secondary">
							<span class="font-weight-bold">Today Date:</span>
							{{ getTodayDate() }}
						</div>
						<div class="d-flex flex-wrap justify-end ml-auto">
							<v-btn
								class="warning mr-2 mb-2"
								depressed
								@click="clearEntry">
								<v-icon left>mdi-eraser</v-icon>
								Clear
							</v-btn>
							<v-btn
								class="primary mb-2"
								depressed
								@click="addEntry"
								:loading="isLoading"
								:disabled="
									!isLoggedIn ||
									!isDirty ||
									!overallFormValid
								">
								<v-icon left>mdi-content-save</v-icon>
								Submit
							</v-btn>
						</div>
					</div>
					<form-component
						:p-rows="entryRows"
						:root="entry"
						:readonly="false"
						v-model="entry"></form-component>
				</template>
				<template v-else>
					<v-tabs v-model="activeTab" class="mb-4">
						<v-tab>Form</v-tab>
						<v-tab>History ({{ historyLst.length }})</v-tab>
						<v-tab>Comments ({{ comments.length }})</v-tab>
					</v-tabs>
					<v-tabs-items v-model="activeTab">
						<v-tab-item>
							<v-container fluid
								class="detail-form-toolbar d-flex justify-space-between mb-3 ">
								<v-container fluid
									class="d-flex pa-0 my-0">
									<v-container fluid
										class="pa-0 my-0 d-flex">
										<v-autocomplete
											dense
											outlined
											label="Assigned to"
											:items="users"
											:item-text="getFullName"
											return-object
											v-model="entry['assignedTo']"
											:readonly="
												!isNew && !isEditing
											"></v-autocomplete>
									</v-container>
								</v-container>
								<v-container fluid class="d-flex flex-wrap justify-end pa-0 my-0">
									<v-btn
										v-if="!isEditing"
										class="warning mr-2 mb-2"
										depressed
										@click="isEditing = !isEditing"
										:disabled="!isLoggedIn">
										<v-icon left>mdi-pencil</v-icon>
										Edit
									</v-btn>
									<v-btn
										v-else
										class="primary mr-2 mb-2"
										depressed
										@click="isEditing = !isEditing"
										:disabled="!isLoggedIn">
										<v-icon left>mdi-pencil</v-icon>
										Stop Editing
									</v-btn>
									<v-btn
										class="success mr-2 mb-2"
										depressed
										@click="updateEntry"
										:loading="isLoading"
										:disabled="
											!isLoggedIn ||
											!isDirty ||
											!overallFormValid
										">
										<v-icon left>mdi-content-save</v-icon>
										Update
									</v-btn>
									<v-btn
										class="error mb-2"
										depressed
										@click="deleteEntry"
										:loading="isDeleteLoading"
										:disabled="
											!isLoggedIn ||
											entry._data?.createdBy._id !=
												currentUser.userId
										">
										<v-icon left>mdi-delete</v-icon>
										Delete
									</v-btn>
									<!-- <v-btn
										v-for="(btn, idx) in autoButtons"
										:key="`auto-btn-${idx}`"
										class="primary mr-2 mb-2"
										depressed
										@click="
											setValue(
												btn.actField,
												btn.actValue,
											)
										">
										{{
											getActValue(
												btn.actField,
												btn.actValue,
											)
										}}
									</v-btn> -->
									<!-- <v-btn
										v-for="(btn, idx) in linkButtons"
										:key="`link-btn-${idx}`"
										class="primary mr-2 mb-2"
										depressed
										target="_blank"
										:href="processLink(btn.link)">
										{{ btn.btnName }}
									</v-btn> -->
								</v-container>
							</v-container>
							<form-component
								:p-rows="entryRows"
								:root="entry"
								:readonly="!isEditing"
								v-model="entry"></form-component>
						</v-tab-item>
						<v-tab-item>
							<history-section
								:history-lst="historyLst"
								:fieldToField="fieldToField"></history-section>
						</v-tab-item>
						<v-tab-item>
							<div class="comment-composer">
								<v-textarea
									outlined
									dense
									rows="2"
									auto-grow
									label="Add comment"
									v-model="commentValue"></v-textarea>
								<v-btn
									depressed
									color="success"
									@click="addComment"
									:disabled="!commentValue"
									:loading="isCommentLoading">
									<v-icon left>mdi-send</v-icon>
									Send
								</v-btn>
							</div>
							<div class="comment-tab-list">
								<comment-section
									:comments="comments"></comment-section>
							</div>
						</v-tab-item>
					</v-tabs-items>
				</template>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import mixin from "../js/mixin.js";
import FormComponent from "@/components/FormComponent.vue";
import HistorySection from "@/components/HistorySection.vue";
import CommentSection from "@/components/CommentSection.vue";
import { readonly } from "vue";

export default {
	name: "EntryFormPanel",
	mixins: [mixin],
	components: {
		"form-component": FormComponent,
		"history-section": HistorySection,
		"comment-section": CommentSection,
	},
	props: {
		embedded: {
			type: Boolean,
			default: false,
		},
		entryId: {
			type: String,
			default: "",
		},
		databaseValue: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			activeTab: 0,
			original: "{}",
			entry: {},
			datePicker: {},
			isNew: true,
			isEditing: false,
			isSubmitted: false,
			isLoading: false,
			isDeleteLoading: false,
			historyLst: [],
			commentValue: "",
			comments: [],
			isCommentLoading: false,
		};
	},
	mounted: function () {
		readonly;
		if (this.activeEntryId) {
			this.isNew = false;
			this.loadExistingEntry(this.activeEntryId, this.databaseValue);
			eventBus.$on("confirm-delete", this.confirmDeleteEntry);
		} else {
			this.loadNewEntry();
		}
	},
	computed: {
		activeEntryId() {
			return this.entryId || this.$route.params.id || "";
		},
		isDirty() {
			return this.original != JSON.stringify(this.entry);
		},
		formValid() {
			return this.$store.getters["formValid"];
		},
		overallFormValid() {
			let overallValue = true;
			let keys = Object.keys(this.formValid);
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				overallValue = this.formValid[key] && overallValue;
			}
			return overallValue;
		},
		databaseToFields() {
			return this.$store.getters["databaseToFields"] || {};
		},
		entryDatabaseValue() {
			return (
				this.entry?._data?.database ||
				this.databaseValue ||
				this.getDatabaseValue()
			);
		},
		entryFields() {
			const databaseValue = this.entryDatabaseValue;
			const fields =
				this.databaseToFields[databaseValue] ||
				this.fields ||
				Object.values(this.fieldToField || {});
			return (fields || []).filter((field) => {
				return field && field.value && field.isActive !== false;
			});
		},
		layoutRows() {
			const rows = this.rows || [];
			const databaseValue = this.entryDatabaseValue;
			if (!databaseValue || rows.length == 0) return rows;
			const hasDatabaseScopedRows = rows.some((row) => row.database);
			if (!hasDatabaseScopedRows) return rows;
			return rows.filter((row) => row.database == databaseValue);
		},
		entryRows() {
			if (this.layoutRows && this.layoutRows.length > 0) {
				return this.layoutRows;
			}
			return this.entryFields.map((field, idx) => {
				return {
					order: idx + 1,
					type: {
						displayName: "Row",
						value: "row",
					},
					cols: [
						{
							field: field.value,
							label: "",
						},
					],
				};
			});
		},
		testValue() {
			return eval("this.entry['saleType'].value");
		},
	},
	methods: {
		addComment() {
			let comment = {};
			comment.value = this.commentValue;
			comment.database = this.entry._data.database;
			comment.entryId = this.entry._id;
			this.isCommentLoading = true;
			backendService.addComment(comment).then((response) => {
				setTimeout(() => {
					eventBus.$emit(
						"setSnackbar",
						"Successfully added comment",
						"success",
					);
					this.comments.unshift(response.data);
					this.commentValue = "";
					this.isCommentLoading = false;
				}, 1000);
			});
		},
		ensureDatabaseContext(databaseValue) {
			const database = this.findDatabase(databaseValue);
			if (database && this.currentDatabase.value != database.value) {
				this.$store.commit("setCurrentDatabase", database);
			} else if (!this.currentDatabase.value && databaseValue) {
				this.$store.commit("setCurrentDatabase", {
					value: databaseValue,
					displayName: databaseValue,
				});
			}
			const value = databaseValue || this.currentDatabase.value;
			if (!value)
				return Promise.reject(new Error("No database selected"));
			return Promise.all([
				this.$store.dispatch("getFieldsByDatabase", value),
				this.$store.dispatch("getChoicesByDatabase", value),
				this.$store.dispatch("getLayoutByDatabase", value),
				this.$store.dispatch("getAutomationsByDatabase", value),
				this.$store.dispatch("getUsersByDatabase", value),
			]);
		},
		findDatabase(databaseValue) {
			if (!databaseValue) return null;
			const databases = (this.allDatabases || []).concat(
				this.$store.getters["availableDatabases"] || [],
			);
			return databases.find(
				(database) => database.value == databaseValue,
			);
		},
		getDatabaseValue() {
			let storedDatabase = {};
			try {
				storedDatabase = JSON.parse(
					localStorage.getItem("currentDatabase") || "{}",
				);
			} catch (error) {
				console.log(error);
			}
			return (
				this.$route.query.database ||
				this.currentDatabase.value ||
				storedDatabase.value
			);
		},
		loadNewEntry() {
			this.isNew = true;
			this.setTimeoutLoading = true;
			const databaseValue = this.getDatabaseValue();
			this.ensureDatabaseContext(databaseValue)
				.then(() => {
					return backendService.getEmptyEntryByDatabase(
						databaseValue,
					);
				})
				.then((response) => {
					this.$store.commit("setEmptyEntry", response.data);
					this.original = JSON.stringify(response.data);
					this.entry = JSON.parse(this.original);
					this.runSetAutomations();
					this.isSubmitted = false;
					this.setTimeoutLoading = false;
				})
				.catch((error) => {
					console.error(error);
					this.setTimeoutLoading = false;
					eventBus.$emit(
						"setSnackbar",
						"Could not load entry form",
						"error",
					);
				});
		},
		loadExistingEntry(entryId, databaseValue = "") {
			this.isNew = false;
			this.activeTab = 0;
			this.setTimeoutLoading = true;
			const value = databaseValue || this.getDatabaseValue();
			this.ensureDatabaseContext(value)
				.then(() => {
					this.getEntryById(entryId);
				})
				.catch((error) => {
					console.error(error);
					this.setTimeoutLoading = false;
					eventBus.$emit(
						"setSnackbar",
						"Could not load entry",
						"error",
					);
				});
		},
		addEntry() {
			let wrappedEntry = {};
			this.isLoading = true;
			wrappedEntry.newEntry = this.entry;
			wrappedEntry.oldEntry = this.emptyEntry;
			wrappedEntry.database = this.currentDatabase.value;
			backendService.addEntry(wrappedEntry).then((response) => {
				this.original = JSON.stringify(this.entry);
				this.$store.commit("addEntry", response.data);
				this.$emit("saved", response.data);
				setTimeout(() => {
					this.isLoading = false;
					this.isSubmitted = true;
					eventBus.$emit(
						"setSnackbar",
						"Successfully added a new entry",
						"success",
					);
				}, 1000);
			});
		},
		confirmDeleteEntry() {
			this.isDeleteLoading = true;
			backendService.deleteEntryById(this.entry._id).then(() => {
				setTimeout(() => {
					this.isDeleteLoading = false;
					this.$store.commit("deleteEntry", this.entry._id);
					this.$emit("deleted", this.entry);
					if (!this.embedded) this.$router.push({ name: "ListView" });
				}, 1000);
			});
		},
		deleteEntry() {
			eventBus.$emit(
				"setDialog",
				"Are you sure you want to delete this entry?",
				"confirm-delete",
			);
		},
		getActField(actField) {
			return this.getConField(actField);
		},
		getActValue(actField, actValue) {
			return this.getConValue(actField, actValue);
		},
		getConValue(conField, conValue) {
			if (
				!conField ||
				!conField?.displayName ||
				!conValue ||
				(!conValue && !conValue.value && !conValue.username)
			)
				return "";
			if (
				conField?.type == "singleSelect" ||
				conField?.type == "multipleSelect"
			)
				return conValue?.displayName;
			else if (
				conField?.type == "singleUser" ||
				conField?.type == "multipleUsers"
			)
				return conValue.username;
			else return conValue;
		},
		getConField(conField) {
			if (!conField || !conField?.displayName) return "";
			else if (conField && conField?.displayName) {
				return conField?.displayName;
			} else {
				return "";
			}
		},
		processLink(link) {
			let newLink = link;
			let regex = /\/:[\s\S]+/;
			let matches = newLink.match(regex);
			for (let i = 0; i < matches.length; i++) {
				let field = matches[i].substring(2);
				newLink = newLink.replace(`:${field}`, this.entry[field]);
			}
			return newLink;
		},
		updateEntry() {
			let wrappedEntry = {};
			wrappedEntry.oldEntry = JSON.parse(this.original);
			wrappedEntry.newEntry = this.entry;
			this.isLoading = true;
			backendService
				.updateEntryById(this.entry._id, wrappedEntry)
				.then(() => {
					setTimeout(() => {
						this.isLoading = false;
						this.original = JSON.stringify(this.entry);
						this.$store.commit("setEntry", this.entry);
						this.$emit("updated", this.entry);
						this.getHistoryByEntryId(this.entry._id);
						eventBus.$emit(
							"setSnackbar",
							"Successfully updated the entry",
							"success",
						);
						this.isEditing = false;
					}, 1000);
				})
				.catch(() => {
					setTimeout(() => {
						this.isLoading = false;
						eventBus.$emit(
							"setSnackbar",
							"Oops! Something is not right!",
							"error",
						);
					}, 1000);
				});
		},
	},
	watch: {
		entryId: function (newVal) {
			if (newVal) {
				this.loadExistingEntry(newVal, this.databaseValue);
			}
		},
		databaseValue: function (newVal) {
			if (this.activeEntryId && newVal) {
				this.loadExistingEntry(this.activeEntryId, newVal);
			}
		},
		"$route.name": function (newVal, oldVal) {
			oldVal;
			if (newVal == "NewEntry") {
				this.loadNewEntry();
			} else if (newVal == "DetailForm") {
				this.loadExistingEntry(this.activeEntryId, this.databaseValue);
			}
		},
		"$route.query.database": function () {
			if (this.$route.name == "NewEntry") {
				this.loadNewEntry();
			}
		},
	},
	beforeDestroy: function () {
		eventBus.$off("confirm-delete");
	},
};
</script>

<style scoped>
.entry-form-panel {
	container-type: inline-size;
	padding: 16px 24px 24px !important;
}

.entry-form-panel .v-card {
	min-width: 0 !important;
}

.entry-form-content {
	padding: 0 !important;
}

.entry-form-panel h2 {
	margin: 0;
	font-size: 1.2rem;
	line-height: 1.25;
}

.entry-detail-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 8px 16px;
	margin-top: 6px;
	color: rgba(0, 0, 0, 0.54);
	font-size: 0.82rem;
	line-height: 1.35;
}

.entry-detail-meta span {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.entry-detail-meta .v-icon {
	color: rgba(0, 0, 0, 0.46);
}

.entry-form-panel::v-deep .v-input {
	margin-top: 0;
}

.entry-form-panel::v-deep .container {
	padding-left: 0 !important;
	padding-right: 0 !important;
}

.entry-form-panel::v-deep .form-field-cell {
	padding-left: 0 !important;
	padding-right: 0 !important;
}

.entry-form-panel::v-deep .v-form > .container {
	gap: 12px;
}

.entry-form-panel::v-deep .v-card__title,
.entry-form-panel::v-deep .v-card__text {
	padding-left: 0 !important;
	padding-right: 0 !important;
}

.detail-form-toolbar {
	flex-wrap: wrap;
}

.comment-tab-list {
	clear: both;
	padding-top: 16px;
}

.comment-composer {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: stretch;
	gap: 10px;
}

.comment-composer .v-btn {
	height: 40px !important;
	margin-top: 0;
}

@container (min-width: 720px) {
	.detail-form-toolbar {
		flex-wrap: nowrap;
	}
}

@container (max-width: 520px) {
	.entry-form-panel {
		padding: 14px 16px 20px !important;
	}

	.comment-composer {
		grid-template-columns: 1fr;
	}

	.comment-composer .v-btn {
		width: 100%;
	}
}
</style>
