import _ from "lodash";
import backendService from "../services/backend-service.js";
import eventBus from "./event-bus.js";
export default {
	data() {
		return {
			setTimeoutLoading: false,
		};
	},
	computed: {
		allDatabases() {
			return this.$store.getters["allDatabases"];
		},
		allGroups() {
			return this.$store.getters["allGroups"];
		},
		allUsers() {
			return this.$store.getters["allUsers"];
		},
		autoButtons() {
			let autoButtons = [];
			for (let i = 0; i < this.automations.length; i++) {
				let automation = this.automations[i];
				if (automation.type == "buttonSet") {
					autoButtons.push(automation);
				}
			}
			return autoButtons;
		},
		automations() {
			return this.$store.getters["automations"];
		},
		conditionSets() {
			let conditionSets = {};
			for (let i = 0; i < this.automations.length; i++) {
				let automation = this.automations[i];
				if (automation.type == "conditionSet") {
					if (!conditionSets[automation.conField.value])
						conditionSets[automation.conField.value] = [];
					conditionSets[automation.conField.value].push(automation);
				}
			}
			return conditionSets;
		},
		currentUser() {
			return this.$store.getters["currentUser"];
		},
		currentDatabase() {
			return this.$store.getters["currentDatabase"];
		},
		fields() {
			return this.$store.getters["fields"];
		},
		fieldToChoices() {
			return this.$store.getters["fieldToChoices"];
		},
		fieldToField() {
			return this.$store.getters["fieldToField"];
		},
		isLoggedIn() {
			return this.$store.getters["isLoggedIn"];
		},
		linkButtons() {
			let linkButtons = [];
			for (let i = 0; i < this.automations.length; i++) {
				let automation = this.automations[i];
				if (automation.type == "link") {
					linkButtons.push(automation);
				}
			}
			return linkButtons;
		},
		rows() {
			return this.$store.getters["layout"];
		},
		emptyEntry() {
			return this.$store.getters["emptyEntry"];
		},
		users() {
			return this.$store.getters["users"];
		},
	},
	methods: {
		automate(field) {
			if (!this.conditionSets[field]) return;
			let actions = this.conditionSets[field];
			actions.forEach((action) => {
				let conField = action.conField;
				let conValue = action.conValue;
				let actField = action.actField;
				let actValue = action.actValue;
				if (
					(this.isSelectType(conField) &&
						this.entry[conField.value].value == conValue.value) ||
					(this.isUserType(conField) &&
						this.entry[conField.value]._id == conValue._id)
				) {
					if (
						this.isSelectType(actField) ||
						this.isUserType(actField)
					) {
						this.entry[actField.value] = actValue;
						this.automate(actField.value);
					} else {
						this.entry[actField.value] = actValue;
						this.automate(actField.value);
					}
				}
			});
		},
		addRowIntoList(field) {
			if (!this.entry[field]) {
				this.entry[field] = [];
			}

			this.entry[field].push({});
		},
		clearEntry() {
			this.isNew = true;
			this.setTimeoutLoading = true;
			this.cloneEmptyEntry();
		},
		cloneEmptyEntry() {
			if (Object.keys(this.emptyEntry).length > 0) {
				this.original = JSON.stringify(this.emptyEntry);
				this.entry = JSON.parse(JSON.stringify(this.emptyEntry));
				this.runSetAutomations();
				this.isSubmitted = false;
				this.setTimeoutLoading = false;
			} else {
				setTimeout(() => {
					this.cloneEmptyEntry();
				}, 1000);
			}
		},
		convertToDate(date) {
			if (!date) return null;
			if (date.includes("T")) date = date.split("T")[0];
			const [year, month, day] = date.split("-");
			return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
		},
		convertDateToReadable(date) {
			let castedDate = new Date(date);
			return castedDate.toLocaleDateString();
		},

		formatDate(date) {
			if (!date) return null;
			const [year, month, day] = date.split("-");
			return `${month}/${day}/${year}`;
		},
		getEntryById(id) {
			this.isNew = false;
			this.setTimeoutLoading = true;
			backendService
				.getEntryById(id)
				.then((response) => {
					this.original = JSON.stringify(response.data);
					this.entry = JSON.parse(this.original);
					backendService.getHistoryByEntryId(id).then((response) => {
						this.historyLst = response.data;
					});
					backendService.getCommentsByEntryId(id).then((response) => {
						this.comments = response.data;
					});

					this.$store.dispatch(
						"getLayoutByDatabase",
						this.entry._data.database
					);

					this.$store.dispatch(
						"getFieldsByDatabase",
						this.entry._data.database
					);

					this.$store.dispatch(
						"getChoicesByDatabase",
						this.entry._data.database
					);

					setTimeout(() => {
						this.setTimeoutLoading = false;
					}, 1000);
				})
				.catch((err) => {
					let code = err.response.status;
					setTimeout(() => {
						this.setTimeoutLoading = false;
						if (code == 404) {
							eventBus.$emit(
								"setSnackbar",
								"Entry not found!",
								"error"
							);
						} else if (code == 401) {
							eventBus.$emit(
								"setSnackbar",
								"No access to the entry!",
								"error"
							);
						}
					}, 1000);
				});
		},

		getFieldDisplayName(fieldValue) {
			let displayName = this.fields.find(
				(field) => field.value == fieldValue
			).displayName;
			return displayName;
		},
		getFullName(user) {
			if (user) return `${user.first} ${user.last}`;
			else return "";
		},
		getUserId(user) {
			if (user) return user._id;
			else return "";
		},
		getLinkFromButton(btn) {
			let stringQueryParams = [];
			if (btn.addDatabase) {
				stringQueryParams.push(`database=${this.database}`);
			}
			if (btn.addId) {
				stringQueryParams.push(`id=${this.entry._id}`);
			}
			if (stringQueryParams.length > 1) {
				return btn.link + "?" + stringQueryParams.join("&");
			}
			return btn.link;
		},
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
		getTodayDate() {
			let today = new Date();
			return today.toLocaleDateString();
		},
		isSelectType(field) {
			return (
				field &&
				(field.type == "singleSelect" || field.type == "multipleSelect")
			);
		},
		isUserType(field) {
			return (
				field &&
				(field.type == "singleUser" || field.type == "multipleUsers")
			);
		},
		removeFromList(idx, field) {
			this.entry[field].splice(idx, 1);
		},
		runSetAutomations() {
			let automations = this.automations;
			for (let i = 0; i < automations.length; i++) {
				if (automations[i].type == "set") {
					this.setValue(
						automations[i].actField,
						automations[i].actValue
					);
				}
			}
		},
		setValue(field, value) {
			this.entry[field.value] = value;
			this.automate(field);
		},
		timer(seconds) {
			let promise = new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, seconds);
			});
			return promise;
		},
	},
};
