<template>
	<v-container class="px-0">
		<div class="d-flex">
			<v-autocomplete
				rounded
				dense
				outlined
				label="Header Set"
				:items="headerSets"
				:item-text="getHeaderSetText"
				item-value="_id"
				v-model="headerSetId"></v-autocomplete>
			<v-btn
				rounded
				class="warning ml-2 mr-1"
				@click="setFavoriteHeaderSet"
				depressed
				:loading="isUpdateLoading"
				:disabled="!headerSetId">
				<i class="far fa-star mr-2"></i>
				Favorite
			</v-btn>
			<v-btn
				rounded
				icon
				dark
				class="warning mr-1"
				@click="addingHeader = !addingHeader">
				<i class="fas fa-cog"></i>
			</v-btn>
			<v-btn
				rounded
				icon
				dark
				class="primary"
				@click="addingHeader = !addingHeader">
				<i class="fas fa-plus"></i>
			</v-btn>
		</div>

		<v-expand-transition>
			<div v-if="addingHeader">
				<div class="d-flex">
					<v-text-field
						class="mr-2"
						dense
						rounded
						outlined
						label="Header Name"
						v-model="setName"></v-text-field>
					<v-autocomplete
						rounded
						outlined
						dense
						:items="[
							{ text: 'Yes', value: true },
							{ text: 'No', value: false },
						]"
						label="Public"
						v-model="isPublic"></v-autocomplete>
				</div>

				<div class="d-flex align-center">
					<v-autocomplete
						rounded
						outlined
						v-model="selectedFields"
						label="Headers"
						:items="fields"
						return-object
						item-text="displayName"
						chips
						hide-details
						deletable-chips
						multiple></v-autocomplete>
					<v-btn
						rounded
						class="warning ml-2"
						@click="addHeaderSet"
						depressed
						:loading="isAddLoading">
						<i class="fas fa-heading mr-2"></i>
						Confirm Header
					</v-btn>
				</div>
			</div>
		</v-expand-transition>
	</v-container>
</template>
<script>
import generalMixin from "@/js/general-mixin";
import backendService from "@/services/backend-service";
export default {
	name: "HeaderSection",
	mixins: [generalMixin],
	props: {
		database: {
			type: Object,
			default: () => {
				return {};
			},
		},
	},
	mounted: function () {
		// const favorite = this.headerSets.find((e) => e.isFavorite);
		// const def = this.headerSets.find((e) => e.isDefault);
		// if (favorite) {
		// 	this.headerSetId = favorite._id;
		// } else {
		// 	this.headerSetId = def._id;
		// }
	},
	data() {
		return {
			isUpdateLoading: false,
			isAddLoading: false,
			addingHeader: false,
			selectedFields: [],
			headerSetId: null,
			isPublic: false,
			setName: "",
		};
	},
	computed: {
		currentDatabase() {
			if (this.database && this.database.value) {
				return this.database;
			} else {
				let database = this.$store.getters["currentDatabase"];
				if (database && database.value) return database;
			}
			return {};
		},
		currentUser() {
			return this.$store.getters["currentUser"];
		},
		databaseToFields() {
			return this.$store.getters["databaseToFields"];
		},
		databaseToHeaderSets() {
			return this.$store.getters["databaseToHeaderSets"];
		},
		fields() {
			return this.databaseToFields[this.currentDatabase.value];
		},
		headerSets() {
			if (this.currentDatabase && this.currentDatabase.value) {
				const headerSets =
					this.databaseToHeaderSets[this.currentDatabase.value];
				if (headerSets && headerSets.length > 0)
					return headerSets.filter(
						(e) => e.createdBy._id == this.currentUser.userId
					);
			}
			return [];
		},
	},
	methods: {
		addHeaderSet() {
			let headerSet = {};
			for (let i = 0; i < this.selectedFields.length; i++) {
				let field = this.selectedFields[i];
				field.order = i + 1;
			}
			headerSet.fields = this.selectedFields;
			headerSet.setName = this.setName;
			headerSet.default = false;
			headerSet.isPublic = this.isPublic;
			headerSet.database = this.currentDatabase.value;
			this.isAddLoading = true;
			backendService.addHeaderSet(headerSet).then((response) => {
				this.timer(1000).then(() => {
					this.$store.commit("addHeaderSet", response.data);
					this.isAddLoading = false;
					this.selectedFields = [];
					this.setName = "";
					this.isPublic = false;
					this.successSnackbar("Successfully added new header set");
				});
			});
		},
		getHeaderSetText(headerSet) {
			let setName = headerSet.setName;
			if (headerSet.isFavorite) setName += " - Favorite";
			return setName;
		},
		setFavoriteHeaderSet() {
			this.isUpdateLoading = true;
			backendService
				.setFavoriteHeaderSetById(this.headerSetId)
				.then(() => {
					this.timer(1000).then(() => {
						this.headerSets.forEach((e) => (e.isFavorite = false));
						const headerSet = this.headerSets.find(
							(e) => e._id == this.headerSetId
						);
						headerSet.isFavorite = true;
						this.isUpdateLoading = false;
						this.$forceUpdate();
						this.successSnackbar(
							"Successfully set favorite header set"
						);
					});
				})
				.catch(() => {
					this.timer(1000).then(() => {
						this.isUpdateLoading = false;
						this.errorSnackbar("Ops! Something is not right");
					});
				});
		},
		updateHeaderSet() {},
	},
};
</script>
