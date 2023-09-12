<template>
	<v-container>
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
			<v-card-text class="text-subtitle-1">
				<div class="d-flex justify-space-between">
					<div>
						<span class="font-weight-bold">Entry Number:</span>
						{{ entry._data?.id }}
					</div>
					<div class="text-right">
						<div>
							<span class="font-weight-bold">Created Date:</span>
							{{
								convertDateToReadable(entry._data?.dateCreated)
							}}
						</div>
						<div>
							<span class="font-weight-bold">Created By:</span>
							{{ getFullName(entry._data?.createdBy) }}
						</div>
					</div>
				</div>
			</v-card-text>
			<v-card-text class="d-flex flex-wrap justify-space-between py-0">
				<v-slide-group class="py-1">
					<v-slide-item>
						<div>
							<v-btn
								v-if="!isEditing"
								rounded
								class="warning mr-2"
								depressed
								@click="isEditing = !isEditing"
								:disabled="!isLoggedIn">
								<i class="fas fa-pencil-alt mr-2"></i>
								<span v-if="!isEditing">Edit</span>
								<span v-else>Stop Editing</span>
							</v-btn>
							<v-btn
								v-else
								rounded
								class="primary mr-2"
								depressed
								@click="isEditing = !isEditing"
								:disabled="!isLoggedIn">
								<i class="fas fa-pencil-alt mr-2"></i>
								Stop Editing
							</v-btn>
							<v-btn
								rounded
								class="success mr-2"
								depressed
								@click="updateEntry"
								:loading="isLoading"
								:disabled="!isLoggedIn || !isDirty">
								<i class="fa fa-save mr-2"></i>
								Update
							</v-btn>
						</div>
					</v-slide-item>
					<v-slide-item>
						<div>
							<v-btn
								rounded
								class="error"
								depressed
								@click="deleteEntry"
								:loading="isDeleteLoading"
								:disabled="
									!isLoggedIn ||
									entry._data?.createdBy._id !=
										currentUser.userId
								">
								<i class="fa fa-trash mr-2"></i>
								Delete
							</v-btn>
						</div>
					</v-slide-item>
				</v-slide-group>
				<v-slide-group
					class="py-1"
					v-if="autoButtons.length + linkButtons.length > 0">
					<v-slide-item
						v-for="(btn, idx) in autoButtons"
						:key="`auto-btn-${idx}`">
						<v-btn
							class="primary mr-2"
							depressed
							rounded
							@click="setValue(btn.actField, btn.actValue)">
							{{ getActValue(btn.actField, btn.actValue) }}
						</v-btn>
					</v-slide-item>
					<v-slide-item
						v-for="(btn, idx) in linkButtons"
						:key="`link-btn-${idx}`">
						<v-btn
							class="primary mr-2"
							depressed
							rounded
							target="_blank"
							:href="processLink(btn.link)">
							{{ btn.btnName }}
						</v-btn>
					</v-slide-item>
				</v-slide-group>
			</v-card-text>

			<v-card-text>
				<v-row>
					<v-col>
						<div class="card bg-light">
							<div
								class="card-header d-flex flex-row justify-content-between"></div>
							<div class="card-body text-primary bg-white">
								<v-row
									v-for="(row, idxI) in rows"
									:key="`row-${idxI}`">
									<p
										class="font-weight-bold headline black--text"
										v-show="row.label != ''">
										{{ row.label }}
									</p>
									<v-col
										v-for="(col, idxJ) in row.cols"
										:key="`col-${idxJ}`">
										<p
											class="font-weight-bold subtitle-1 black--text text-start"
											v-if="col.label != ''">
											{{ col.label }}
										</p>
										<v-text-field
											v-else-if="
												fieldToField[col.field]
													?.type === 'singleLine'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											:readonly="
												!isEditing
											"></v-text-field>
										<v-text-field
											v-else-if="
												fieldToField[col.field]
													?.type === 'number'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model.number="entry[col.field]"
											:readonly="
												!isEditing
											"></v-text-field>
										<vuetify-money
											v-else-if="
												fieldToField[col.field]
													?.type ===
												'currencyInDollar'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model.number="entry[col.field]"
											:options="
												fieldToField[col.field].options
											"
											:readonly="
												!isEditing
											"></vuetify-money>
										<vuetify-money
											v-else-if="
												fieldToField[col.field]
													?.type === 'weightInKg'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model.number="entry[col.field]"
											:options="
												fieldToField[col.field].options
											"
											:readonly="
												!isEditing
											"></vuetify-money>
										<vuetify-money
											v-else-if="
												fieldToField[col.field]
													?.type === 'weightInLb'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model.number="entry[col.field]"
											:options="
												fieldToField[col.field].options
											"
											:readonly="
												!isEditing
											"></vuetify-money>
										<v-textarea
											v-else-if="
												fieldToField[col.field]
													?.type === 'multipleLines'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											:readonly="!isEditing"></v-textarea>
										<v-autocomplete
											@change="automate(col.field)"
											v-else-if="
												fieldToField[col.field]
													?.type === 'singleSelect'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											:items="fieldToChoices[col.field]"
											item-text="displayName"
											:readonly="!isEditing"
											return-object
											small-chips
											deletable-chips></v-autocomplete>
										<v-autocomplete
											v-else-if="
												fieldToField[col.field]
													?.type === 'multipleSelect'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											return-object
											:items="fieldToChoices[col.field]"
											item-text="displayName"
											multiple
											small-chips
											deletable-chips
											:readonly="
												!isEditing
											"></v-autocomplete>
										<v-autocomplete
											@change="automate(col.field)"
											v-else-if="
												fieldToField[col.field]
													?.type === 'singleUser'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											return-object
											:items="users"
											:item-text="getFullName"
											:readonly="
												!isEditing
											"></v-autocomplete>
										<v-autocomplete
											v-else-if="
												fieldToField[col.field]
													?.type === 'multipleUsers'
											"
											:label="
												fieldToField[col.field]
													?.displayName
											"
											v-model="entry[col.field]"
											return-object
											:items="users"
											:item-text="getFullName"
											deletable-chipsoutlined
											multiple
											chips
											deletable-chips
											:readonly="
												!isEditing
											"></v-autocomplete>
										<v-menu
											class="pb-5"
											v-else-if="
												fieldToField[col.field]
													?.type === 'date'
											"
											v-model="datePicker[col.field]"
											:close-on-content-click="false"
											transition="scale-transition"
											offset-y
											max-width="290px"
											min-width="290px"
											:readonly="!isEditing">
											<template
												v-slot:activator="{
													on,
													attrs,
												}">
												<div
													class="d-flex justify-space-between">
													<v-text-field
														:value="
															formatDate(
																entry[col.field]
															)
														"
														:label="
															fieldToField[
																col.field
															]?.displayName
														"
														persistent-hint
														prepend-icon="mdi-calendar"
														v-bind="attrs"
														v-on="
															on
														"></v-text-field>
													<v-btn
														class="mt-3"
														color="primary"
														rounded
														depressed
														:disabled="!isEditing"
														@click="
															entry[col.field] =
																null;
															datePicker[
																col.field
															] = false;
														">
														<i
															class="fas fa-times"></i>
													</v-btn>
												</div>
											</template>

											<v-date-picker
												v-model="entry[col.field]"
												no-title
												@input="
													datePicker[
														col.field
													] = false
												"></v-date-picker>
										</v-menu>
										<div
											v-else-if="
												fieldToField[col.field]
													?.type === 'list'
											">
											<v-row>
												<v-col>
													<p
														class="font-weight-bold subtitle-1 black--text">
														{{
															fieldToField[
																col.field
															]?.displayName
														}}
													</p>
												</v-col>
											</v-row>
											<v-row
												v-for="(lRow, lIdxI) in entry[
													col.field
												]"
												:key="lIdxI">
												<v-col
													v-for="(
														field, lIdxJ
													) in fieldToField[col.field]
														.listFields"
													:key="lIdxJ">
													<v-text-field
														v-if="
															field?.type ===
															'singleLine'
														"
														:label="
															field?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:readonly="
															!isEditing
														"></v-text-field>
													<v-text-field
														v-else-if="
															field?.type ===
															'number'
														"
														:label="
															field?.displayName
														"
														v-model.number="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:readonly="
															!isEditing
														"></v-text-field>
													<vuetify-money
														v-else-if="
															field?.type ===
															'currencyInDollar'
														"
														:label="
															field?.displayName
														"
														v-model.number="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:options="field.options"
														:readonly="
															!isEditing
														"></vuetify-money>
													<vuetify-money
														v-else-if="
															field?.type ===
															'weightInKg'
														"
														:label="
															field?.displayName
														"
														v-model.number="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:options="field.options"
														:readonly="
															!isEditing
														"></vuetify-money>
													<vuetify-money
														v-else-if="
															field?.type ===
															'weightInLb'
														"
														:label="
															field?.displayName
														"
														v-model.number="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:options="field.options"
														:readonly="
															!isEditing
														"></vuetify-money>
													<v-textarea
														v-else-if="
															field?.type ===
															'multipleLines'
														"
														:label="
															field?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														:readonly="
															!isEditing
														"></v-textarea>
													<v-autocomplete
														@change="
															automate(col.field)
														"
														v-else-if="
															field?.type ===
															'singleSelect'
														"
														:label="
															field?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														item-text="displayName"
														:items="
															fieldToChoices[
																field.value
															]
														"
														:readonly="!isEditing"
														return-object
														small-chips
														deletable-chips></v-autocomplete>
													<v-autocomplete
														v-else-if="
															field?.type ===
															'multipleSelect'
														"
														:label="
															field?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														return-object
														item-text="displayName"
														:items="
															fieldToChoices[
																field.value
															]
														"
														multiple
														small-chips
														deletable-chips
														:readonly="
															!isEditing
														"></v-autocomplete>
													<v-autocomplete
														@change="
															automate(col.field)
														"
														v-else-if="
															fieldToField[
																col.field
															]?.type ===
															'singleUser'
														"
														:label="
															fieldToField[
																col.field
															]?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														return-object
														:items="users"
														:item-text="getFullName"
														:readonly="
															!isEditing
														"></v-autocomplete>
													<v-autocomplete
														v-else-if="
															fieldToField[
																col.field
															]?.type ===
															'multipleUsers'
														"
														:label="
															fieldToField[
																col.field
															]?.displayName
														"
														v-model="
															entry[col.field][
																lIdxI
															][field.value]
														"
														return-object
														:items="users"
														:item-text="getFullName"
														deletable-chipsoutlined
														multiple
														chips
														deletable-chips
														:readonly="
															!isEditing
														"></v-autocomplete>
													<v-menu
														class="pb-5"
														v-else-if="
															field?.type ===
															'date'
														"
														v-model="
															datePicker[
																`${field.value}-${lIdxI}`
															]
														"
														:close-on-content-click="
															false
														"
														transition="scale-transition"
														offset-y
														max-width="290px"
														min-width="290px">
														<template
															v-slot:activator="{
																on,
																attrs,
															}">
															<div
																class="d-flex justify-space-between">
																<v-text-field
																	:value="
																		formatDate(
																			entry[
																				col
																					.field
																			][
																				lIdxI
																			][
																				field
																					.value
																			]
																		)
																	"
																	:label="
																		field?.displayName
																	"
																	persistent-hint
																	prepend-icon="mdi-calendar"
																	v-bind="
																		attrs
																	"
																	v-on="on"
																	autocomplete="off"
																	:readonly="
																		!isEditing
																	"></v-text-field>
																<v-btn
																	class="float-right"
																	color="primary"
																	rounded
																	depressed
																	:disabled="
																		!isEditing
																	"
																	@click="
																		entry[
																			col.field
																		][
																			lIdxI
																		][
																			field.value
																		] = null;
																		datePicker[
																			`${field.value}-${lIdxI}`
																		] = false;
																	">
																	<i
																		class="fas fa-times"></i>
																</v-btn>
															</div>
														</template>
														<v-date-picker
															v-model="
																entry[
																	col.field
																][lIdxI][
																	field.value
																]
															"
															no-title
															@input="
																datePicker[
																	`${field.value}-${lIdxI}`
																] = false
															"></v-date-picker>
													</v-menu>
												</v-col>
												<v-col>
													<v-btn
														rounded
														color="error mt-2"
														depressed
														@click="
															removeFromList(
																lIdxI,
																col.field
															)
														"
														:disabled="!isEditing">
														<i
															class="fas fa-trash-alt"></i>
													</v-btn>
												</v-col>
											</v-row>
											<v-row>
												<v-col>
													<v-btn
														rounded
														color="primary ml-2"
														depressed
														@click="
															addRowIntoList(
																col.field
															)
														"
														:disabled="!isEditing">
														<i
															class="fas fa-plus mr-2"></i>
														Add
													</v-btn>
												</v-col>
											</v-row>
										</div>
									</v-col>
								</v-row>
							</div>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider class="my-2"></v-divider>
		<history-section
			v-if="!setTimeoutLoading"
			:history-lst="historyLst"
			:fieldToField="fieldToField"></history-section>
		<v-divider class="my-2"></v-divider>
		<v-card elevation="0" v-if="!setTimeoutLoading">
			<v-card-text>
				<v-textarea label="Comment" v-model="commentValue"></v-textarea>
				<v-btn
					class="float-right"
					depressed
					rounded
					color="success"
					@click="addComment"
					:loading="isCommentLoading">
					<i class="far fa-paper-plane mr-2"></i>
					Send
				</v-btn>
			</v-card-text>
		</v-card>
		<comment-section
			v-if="!setTimeoutLoading"
			:comments="comments"></comment-section>
	</v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import CommentSection from "../components/CommentSection.vue";
import HistorySection from "../components/HistorySection.vue";
import mixin from "../js/mixin.js";
export default {
	name: "DetailForm",
	components: {
		"comment-section": CommentSection,
		"history-section": HistorySection,
	},
	mixins: [mixin],
	data() {
		return {
			count: 0,
			original: "{}",
			entry: {},
			datePicker: {},
			historyLst: [],
			commentValue: "",
			comments: [],
			isNew: true,
			isEditing: false,
			isLoading: false,
			isCommentLoading: false,
			isDeleteLoading: false,
		};
	},
	computed: {
		isDirty() {
			return this.original != JSON.stringify(this.entry);
		},
	},
	created: function () {
		eventBus.$on("confirm-delete", this.confirmDeleteEntry);
	},
	mounted: function () {
		if (this.$route.params.id) {
			this.isNew = false;
			this.getEntryById(this.$route.params.id);
		}
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
						"success"
					);
					this.comments.unshift(response.data);
					this.commentValue = "";
					this.isCommentLoading = false;
				}, 1000);
			});
		},
		confirmDeleteEntry() {
			this.isDeleteLoading = true;
			backendService.deleteEntryById(this.entry._id).then(() => {
				setTimeout(() => {
					this.isDeleteLoading = false;
					this.$store.commit("deleteEntry", this.entry._id);
					this.$router.push({ name: "ListView" });
				}, 1000);
			});
		},
		deleteEntry() {
			eventBus.$emit(
				"setDialog",
				"Are you sure you want to delete this entry?",
				"confirm-delete"
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
		updateEntry() {
			let wrappedEntry = {};
			wrappedEntry.oldEntry = JSON.parse(this.original);
			wrappedEntry.newEntry = this.entry;
			this.isLoading = true;
			backendService
				.updateEntry(wrappedEntry)
				.then(() => {
					setTimeout(() => {
						this.isLoading = false;
						this.original = JSON.stringify(this.entry);
						this.$store.commit("setEntry", this.entry);
						eventBus.$emit(
							"setSnackbar",
							"Successfully updated the entry",
							"success"
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
							"success"
						);
					}, 1000);
				});
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
	},
	beforeDestroy: function () {
		eventBus.$off("confirm-delete");
	},
};
</script>
