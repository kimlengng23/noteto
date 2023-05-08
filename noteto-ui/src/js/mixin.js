import backendService from "../services/backend-service.js";
import eventBus from "./event-bus.js";
export default {
  data() {
    return {
      dollarOptions: {
        locale: "en-US",
        prefix: "$",
        suffix: "",
        length: 7,
        precision: 2,
      },
      kgOptions: {
        locale: "en-US",
        prefix: "",
        suffix: "Kg",
        length: 7,
        precision: 2,
      },
      lbOptions: {
        locale: "en-US",
        prefix: "",
        suffix: "Lbs",
        length: 7,
        precision: 2,
      },
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
    database() {
      return this.$store.getters["currentDatabase"];
    },

    fields() {
      return this.$store.getters["databaseToFields"][this.database.value];
    },
    fieldToChoices() {
      return this.$store.getters["databaseToChoices"][this.database.value];
    },
    fieldToField() {
      return this.$store.getters["fieldToField"];
    },
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"];
    },
    rows() {
      return this.$store.getters["databaseToLayoutMappings"][
        this.database.value
      ];
    },

    emptyEntry() {
      return this.$store.getters["emptyEntry"];
    },
    users() {
      return this.$store.getters["databaseUsers"];
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
          if (this.isSelectType(actField) || this.isUserType(actField)) {
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
      this.setTimeoutLoading = true;
      this.cloneEmptyEntry();
    },
    cloneEmptyEntry() {
      if (this.emptyEntry && this.emptyEntry.database) {
        this.entry = JSON.parse(JSON.stringify(this.emptyEntry));
        this.isSubmitted = false;
        this.setTimeoutLoading = false;
      } else {
        setTimeout(() => {
          this.cloneEmptyEntry();
        }, 1000);
      }
    },
    convertSecondsToDate(seconds) {
      let castedDate = new Date(seconds);
      return castedDate.toLocaleDateString();
    },

    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    getEntryById(id) {
      this.setTimeoutLoading = true;
      backendService.getEntryById(id).then((response) => {
        this.original = JSON.stringify(response.data);
        this.entry = JSON.parse(this.original);
        eventBus.$emit("getComments", this.entry);
        setTimeout(() => {
          this.setTimeoutLoading = false;
        }, 1000);
      });
    },
    getFieldType(fieldValue) {
      let type = this.fields.find((field) => field.value == fieldValue).type;
      return type;
    },
    getFieldDisplayName(fieldValue) {
      let displayName = this.fields.find(
        (field) => field.value == fieldValue
      ).displayName;
      return displayName;
    },
    getFullName(user) {
      if (user) return `${user.first} ${user.last} - ${user._id}`;
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
    getTodayDate() {
      let today = new Date();
      return today.toLocaleDateString();
    },
    // isNumber(val) {
    // 	return !_.isNaN(_.toNumber(val));
    // },
    isSelectType(field) {
      return (
        field &&
        (field.type == "singleSelect" || field.type == "multipleSelect")
      );
    },
    isUserType(field) {
      return (
        field && (field.type == "singleUser" || field.type == "multipleUsers")
      );
    },

    parseDate(date) {
      if (!date) return null;
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    removeFromList(idx, field) {
      this.entry[field].splice(idx, 1);
    },
    setValue(field, value) {
      this.entry[field.value] = value;
      this.automate(field);
    },
  },
};
