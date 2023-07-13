<template>
	<v-container>
		<v-card elevation="0" min-width="350" width="100%">
			<v-card-title class="d-flex justify-space-between">
				<div class="text-left">
					<p v-show="isNew" class="text-primary">
						New Entry
						<v-progress-circular
							indeterminate
							color="primary"
							v-if="setTimeoutLoading"></v-progress-circular>
					</p>

					<p v-show="isNew" class="text-primary">
						<span class="text-muted">Today Date:</span>
						{{ getTodayDate() }}
					</p>
				</div>

				<div class="mt-3">
					<v-btn
						v-show="isNew"
						rounded
						class="warning ml-2"
						depressed
						@click="clearEntry">
						<i class="fas fa-eraser mr-2"></i>
						Clear
					</v-btn>
					<v-btn
						v-show="isNew"
						rounded
						class="primary ml-2"
						depressed
						@click="addEntry"
						:loading="isLoading"
						:disabled="!isLoggedIn || !isDirty">
						<i class="fas fa-save mr-2"></i>
						Submit
					</v-btn>
				</div>
			</v-card-title>
			<v-card-text>
				<v-row v-for="(row, idxI) in rows" :key="`row-${idxI}`">
					<p
						class="font-weight-bold headline black--text"
						v-show="row.label != ''">
						{{ row.label }}
					</p>
					<v-col v-for="(col, idxJ) in row.cols" :key="`col-${idxJ}`">
						<p
							class="font-weight-bold subtitle-1 black--text text-start"
							v-if="col.label != ''">
							{{ col.label }}
						</p>
						<v-text-field
							v-else-if="
								fieldToField[col.field].type === 'singleLine'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"></v-text-field>
						<vuetify-money
							v-else-if="
								fieldToField[col.field].type ===
								'currencyInDollar'
							"
							:label="fieldToField[col.field].displayName"
							v-model.number="entry[col.field]"
							:options="
								fieldToField[col.field].options
							"></vuetify-money>
						<vuetify-money
							v-else-if="
								fieldToField[col.field].type === 'weightInLb'
							"
							:label="fieldToField[col.field].displayName"
							v-model.number="entry[col.field]"
							:options="
								fieldToField[col.field].options
							"></vuetify-money>
						<vuetify-money
							v-else-if="
								fieldToField[col.field].type === 'weightInKg'
							"
							:label="fieldToField[col.field].displayName"
							v-model.number="entry[col.field]"
							:options="
								fieldToField[col.field].options
							"></vuetify-money>
						<v-text-field
							v-else-if="
								fieldToField[col.field].type === 'number'
							"
							:label="fieldToField[col.field].displayName"
							v-model.number="entry[col.field]"></v-text-field>
						<v-textarea
							v-else-if="
								fieldToField[col.field].type === 'multipleLines'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"></v-textarea>
						<v-autocomplete
							@change="automate(col.field)"
							v-else-if="
								fieldToField[col.field].type === 'singleSelect'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"
							return-object
							:items="fieldToChoices[col.field]"
							item-text="displayName"></v-autocomplete>
						<v-autocomplete
							v-else-if="
								fieldToField[col.field].type ===
								'multipleSelect'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"
							return-object
							:items="fieldToChoices[col.field]"
							item-text="displayName"
							deletable-chipsoutlined
							multiple
							chips
							deletable-chips></v-autocomplete>
						<v-autocomplete
							@change="automate(col.field)"
							v-else-if="
								fieldToField[col.field].type === 'singleUser'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"
							return-object
							:items="users"
							:item-text="getFullName"></v-autocomplete>
						<v-autocomplete
							v-else-if="
								fieldToField[col.field].type === 'multipleUsers'
							"
							:label="fieldToField[col.field].displayName"
							v-model="entry[col.field]"
							return-object
							:items="users"
							:item-text="getFullName"
							deletable-chipsoutlined
							multiple
							chips
							deletable-chips></v-autocomplete>
						<v-menu
							v-else-if="fieldToField[col.field].type === 'date'"
							v-model="datePicker[col.field]"
							:close-on-content-click="false"
							transition="scale-transition"
							offset-y
							max-width="290px"
							min-width="290px">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									:value="formatDate(entry[col.field])"
									:label="fieldToField[col.field].displayName"
									persistent-hint
									prepend-icon="mdi-calendar"
									v-bind="attrs"
									v-on="on"></v-text-field>
							</template>
							<v-date-picker
								v-model="entry[col.field]"
								no-title
								@input="
									datePicker[col.field] = false
								"></v-date-picker>
						</v-menu>
						<div
							v-else-if="fieldToField[col.field].type === 'list'">
							<v-row>
								<v-col>
									<p
										class="font-weight-bold subtitle-1 black--text">
										{{
											fieldToField[col.field].displayName
										}}
									</p>
								</v-col>
							</v-row>
							<v-row
								v-for="(lRow, lIdxI) in entry[col.field]"
								:key="`lRow-${lIdxI}`">
								<v-col
									v-for="(field, lIdxJ) in fieldToField[
										col.field
									].listFields"
									:key="`lCol-${lIdxJ}`">
									<v-text-field
										v-if="field.type === 'singleLine'"
										:label="field.displayName"
										v-model="
											entry[col.field][lIdxI][field.value]
										"></v-text-field>
									<vuetify-money
										v-else-if="
											field.type === 'currencyInDollar'
										"
										prefix="$"
										:label="field.displayName"
										v-model.number="
											entry[col.field][lIdxI][field.value]
										"
										:options="
											field.options
										"></vuetify-money>
									<v-text-field
										v-else-if="field.type === 'number'"
										:label="field.displayName"
										v-model.number="
											entry[col.field][lIdxI][field.value]
										"></v-text-field>
									<vuetify-money
										v-else-if="field.typee === 'weightInLb'"
										suffix="Lbs"
										:label="field.displayName"
										v-model.number="
											entry[col.field][lIdxI][field.value]
										"
										:options="
											field.options
										"></vuetify-money>
									<vuetify-money
										v-else-if="field.type === 'weightInKg'"
										suffix="Kg"
										:label="field.displayName"
										v-model.number="
											entry[col.field][lIdxI][field.value]
										"
										:options="
											field.options
										"></vuetify-money>
									<v-textarea
										v-else-if="
											field.type === 'multipleLines'
										"
										:label="field.displayName"
										v-model="
											entry[col.field][lIdxI][field.value]
										"></v-textarea>
									<v-autocomplete
										@change="automate(col.field)"
										v-else-if="
											field.type === 'singleSelect'
										"
										:label="field.displayName"
										v-model="
											entry[col.field][lIdxI][field.value]
										"
										return-object
										:items="fieldToChoices[field.value]"
										item-text="displayName"></v-autocomplete>
									<v-autocomplete
										v-else-if="
											field.type === 'multipleSelect'
										"
										:label="field.displayName"
										v-model="
											entry[col.field][lIdxI][field.value]
										"
										return-object
										:items="fieldToChoices[field.value]"
										item-text="displayName"
										deletable-chipsoutlined
										multiple
										chips
										deletable-chips></v-autocomplete>
									<v-autocomplete
										@change="automate(col.field)"
										v-else-if="
											fieldToField[col.field].type ===
											'singleUser'
										"
										:label="
											fieldToField[col.field].displayName
										"
										v-model="
											entry[col.field][lIdxI][field.value]
										"
										return-object
										:items="users"
										:item-text="
											getFullName
										"></v-autocomplete>
									<v-autocomplete
										v-else-if="
											fieldToField[col.field].type ===
											'multipleUsers'
										"
										:label="
											fieldToField[col.field].displayName
										"
										v-model="
											entry[col.field][lIdxI][field.value]
										"
										return-object
										:items="users"
										:item-text="getFullName"
										deletable-chipsoutlined
										multiple
										chips
										deletable-chips></v-autocomplete>
									<v-menu
										v-else-if="field.type === 'date'"
										v-model="
											datePicker[
												`${field.value}-${lIdxI}`
											]
										"
										:close-on-content-click="false"
										transition="scale-transition"
										offset-y
										max-width="290px"
										min-width="290px">
										<template
											v-slot:activator="{ on, attrs }">
											<v-text-field
												:value="
													formatDate(
														entry[col.field][lIdxI][
															field.value
														]
													)
												"
												:label="field.displayName"
												persistent-hint
												prepend-icon="mdi-calendar"
												v-bind="attrs"
												v-on="on"
												autocomplete="off"></v-text-field>
										</template>
										<v-date-picker
											v-model="
												entry[col.field][lIdxI][
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
											removeFromList(lIdxI, col.field)
										">
										<i class="fas fa-trash-alt"></i>
									</v-btn>
								</v-col>
							</v-row>
							<v-row>
								<v-col>
									<v-btn
										rounded
										color="primary ml-2"
										depressed
										@click="addRowIntoList(col.field)">
										<i class="fas fa-plus mr-2"></i>
										Add
									</v-btn>
								</v-col>
							</v-row>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
import eventBus from "../js/event-bus.js";
import backendService from "../services/backend-service.js";
import mixin from "../js/mixin.js";
export default {
	name: "EntryForm",

	mixins: [mixin],
	data() {
		return {
			original: {},
			entry: {},
			datePicker: {},
			isNew: true,
			isEditing: false,
			isSubmitted: false,
			isLoading: false,
		};
	},
	mounted: function () {
		this.clearEntry();
		if (this.$route.params.id) {
			this.isNew = false;
			this.getEntryById(this.$route.params.id);
		}
	},
	computed: {
		isDirty() {
			return this.original != JSON.stringify(this.entry);
		},
	},
	methods: {
		addEntry() {
			let wrappedEntry = {};
			this.isLoading = true;
			this.entry.database = this.database.value;
			wrappedEntry.newEntry = this.entry;
			wrappedEntry.oldEntry = this.emptyEntry;
			backendService.addEntry(wrappedEntry).then((response) => {
				this.original = JSON.stringify(this.entry);
				this.$store.commit("addEntry", response.data);
				setTimeout(() => {
					this.isLoading = false;
					this.isSubmitted = true;
					eventBus.$emit(
						"setSnackbar",
						"Successfully Added a New Entry",
						"success",
						true
					);
				}, 1000);
			});
		},
	},
};
</script>
