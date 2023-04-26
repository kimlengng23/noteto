import Vue from "vue";
import Vuex from "vuex";
import backendService from "../services/backend-service";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentUser: {},
    currentDatabase: {},
    isLoggedIn: false,
    navigationOptions: [],
    availableDatabases: [],
    allDatabases: [],
    databaseToFields: {},
    databaseToChoices: {},
    databaseToLayoutMappings: {},
    databaseToHeaders: {},
    fieldToField: {},
    allUsers: [],
    databaseUsers: [],
    dropdowns: {},
    layout: [],
    emptyEntry: {},
    entries: [],
    headers: [],
    search: {},
    customButtons: [],
    automations: {},
    selectedRow: -1,

    allGroups: [],
  },
  getters: {
    currentUser: (state) => {
      return state.currentUser;
    },
    currentDatabase: (state) => {
      return state.currentDatabase;
    },
    isLoggedIn: (state) => {
      return state.isLoggedIn;
    },
    navigationOptions: (state) => {
      return state.navigationOptions;
    },
    availableDatabases: (state) => {
      return state.availableDatabases;
    },
    allDatabases: (state) => {
      return state.allDatabases;
    },
    allUsers: (state) => {
      return state.allUsers;
    },
    search: (state) => {
      return state.search;
    },
    customButtons: (state) => {
      return state.customButtons;
    },
    automations: (state) => {
      return state.automations;
    },
    selectedRow: (state) => {
      return state.selectedRow;
    },
    allGroups: (state) => {
      return state.allGroups;
    },
    databaseToFields: (state) => {
      return state.databaseToFields;
    },
    databaseToChoices: (state) => {
      return state.databaseToChoices;
    },
    databaseToHeaders: (state) => {
      return state.databaseToHeaders;
    },
    databaseToLayoutMappings: (state) => {
      return state.databaseToLayoutMappings;
    },
    dropdowns: (state) => {
      return state.dropdowns;
    },
    fieldToField: (state) => {
      return state.fieldToField;
    },
    selectedHeaders: (state) => {
      return state.selectedHeaders;
    },
    layout: (state) => {
      return state.layout;
    },
    emptyEntry: (state) => {
      return state.emptyEntry;
    },
    entries: (state) => {
      return state.entries;
    },
    headers: (state) => {
      return state.headers;
    },
    databaseUsers: (state) => {
      return state.databaseUsers;
    },
  },
  mutations: {
    addNewGroupToList(state, payload) {
      state.allGroups.push(payload);
    },
    addNewDatabaseToList(state, payload) {
      state.allDatabases.push(payload);
    },
    addNewField(state, payload) {
      state.databaseToFields[payload.database].push(payload);
    },
    addChoices(state, payload) {
      let databaseToChoices = state.databaseToChoices;
      payload.forEach((choice) => {
        if (!databaseToChoices[choice.database])
          databaseToChoices[choice.database] = {};
        if (!databaseToChoices[choice.database][choice.field])
          databaseToChoices[choice.database][choice.field] = [];
        databaseToChoices[choice.database][choice.field].push(choice);
      });
    },
    addEntry(state, payload) {
      state.entries.unshift(payload);
    },
    setCurrentUser(state, payload) {
      state.currentUser = payload;
      if (Object.keys(payload).length !== 0) {
        state.isLoggedIn = true;
      } else {
        state.isLoggedIn = false;
      }
    },
    setCurrentDatabase(state, payload) {
      state.currentDatabase = payload;
      if (payload && !payload.value) return;
      let fields = state.databaseToFields[state.currentDatabase.value];
      if (fields) {
        fields.forEach((field) => {
          state.fieldToField[field.value] = field;
        });
      }
      backendService
        .getEmptyEntryByDatabase(state.currentDatabase.value)
        .then((response) => {
          state.emptyEntry = response.data;
        });
    },
    setNavigationOptions(state, payload) {
      state.navigationOptions = payload;
    },
    setAvailableDatabases(state, payload) {
      state.availableDatabases = payload;
    },
    setAllUsers(state, payload) {
      state.allUsers = payload;
    },

    setSearch(state, payload) {
      state.search = payload;
    },
    setCustomButtons(state, payload) {
      state.customButtons = payload;
    },
    setAutomations(state, payload) {
      state.automations = payload;
    },
    setSelectedRow(state, payload) {
      state.selectedRow = payload;
    },
    setAllGroups(state, payload) {
      state.allGroups = payload;
    },
    setGroup(state, payload) {
      state.allGroups.forEach((group, idx) => {
        if (group._id == payload._id) {
          state.allGroups[idx] = payload;
        }
      });
    },
    setDatabase(state, payload) {
      state.allDatabases.forEach((database, idx) => {
        if (database._id == payload._id) {
          state.allDatabases[idx] = payload;
        }
      });
    },
    setGroupsInDatabases(state, payload) {
      state.allDatabases.forEach((database) => {
        database.groups.forEach((group, idx) => {
          if (group._id == payload._id) {
            database.groups[idx] = payload;
          }
        });
      });
    },
    setAllDatabases(state, payload) {
      state.allDatabases = payload;
    },
    setDatabaseToFields(state, payload) {
      state.databaseToFields = payload;
    },
    setDatabaseToChoices(state, payload) {
      state.databaseToChoices = payload;
    },
    setDatabaseToHeaders(state, payload) {
      state.databaseToHeaders = payload;
    },
    setDatabaseToLayoutMappings(state, payload) {
      state.databaseToLayoutMappings = payload;
    },
    setDropdowns(state, payload) {
      state.dropdowns = payload;
    },
    setChoicesInDatabaseToChoices(state, payload) {
      let fieldValue = payload[0].field;
      let databaseValue = payload[0].database;
      state.databaseToChoices[databaseValue][fieldValue] = payload;
    },
    setLayout(state, payload) {
      state.layout = payload;
    },
    setEmptyEntry(state, payload) {
      state.emptyEntry = payload;
    },
    setEntries(state, payload) {
      state.entries = payload;
    },
    setHeaders(state, payload) {
      state.headers = payload;
    },
    setDatabaseUsers(state, payload) {
      state.databaseUsers = payload;
    },
    setEntry(state, payload) {
      state.entries.forEach((entry, idx) => {
        if (entry._id == payload._id) {
          state.entries[idx] = payload;
        }
      });
    },
  },
  actions: {
    getAutomations(context) {
      backendService
        .getAutoTypeToAutomationsByDatabase(context.state.currentDatabase.value)
        .then((response) => {
          context.commit("setAutomations", response.data);
        });
    },
    getAvailableDatabases(context) {
      backendService.getDatabasesByUserId(context.userId).then((response) => {
        context.commit("setAvailableDatabases", response.data);
      });
    },
    getNavigationOptions(context) {
      backendService.getNavigationOptions().then((response) => {
        context.commit("setNavigationOptions", response.data);
      });
    },
    getAllUsers(context) {
      backendService.getAllUsers().then((response) => {
        context.commit("setAllUsers", response.data);
      });
    },
    getDatabaseToFields(context) {
      backendService.getDatabaseToFields().then((response) => {
        context.commit("setDatabaseToFields", response.data);
      });
    },
    getDatabaseToChoices(context) {
      backendService.getDatabaseToChoices().then((response) => {
        context.commit("setDatabaseToChoices", response.data);
      });
    },
    getDatabaseToHeaders(context) {
      backendService.getDatabaseToHeaders().then((response) => {
        context.commit("setDatabaseToHeaders", response.data);
      });
    },
    getDatabaseToLayoutMappings(context) {
      backendService.getDatabaseToLayoutMappings().then((response) => {
        context.commit("setDatabaseToLayoutMappings", response.data);
      });
    },
    getAllCustomButtons(context) {
      backendService
        .getAllCustomButtonsByDatabase(context.getters.currentDatabase)
        .then((response) => {
          context.commit("setCustomButtons", response.data);
        });
    },

    getAllGroups(context) {
      backendService.getAllGroups().then((response) => {
        context.commit("setAllGroups", response.data);
      });
    },
    getDatabasesByUserId(context) {
      backendService
        .getDatabasesByUserId(context.state.currentUser.userId)
        .then((response) => {
          context.commit("setAvailableDatabases", response.data);
        });
    },
    getAllDatabases(context) {
      backendService.getAllDatabases().then((response) => {
        context.commit("setAllDatabases", response.data);
      });
    },
    getEntriesByDatabase(context) {
      backendService
        .getEntriesByDatabase(context.state.currentDatabase.value)
        .then((response) => {
          context.commit("setEntries", response.data);
        });
    },
    getDropdowns(context) {
      backendService.getDropdowns().then((response) => {
        context.commit("setDropdowns", response.data);
      });
    },
    getLayout(context) {
      backendService
        .getLayoutByDatabase(context.state.currentDatabase.value)
        .then((response) => {
          context.commit("setLayout", response.data);
        });
    },
    getHeaders(context) {
      backendService
        .getHeadersByDatabase(context.state.currentDatabase.value)
        .then((response) => {
          context.commit("setHeaders", response.data);
        });
    },
    getDatabaseUsers(context) {
      backendService
        .getUsersByDatabase(context.state.currentDatabase.value)
        .then((response) => {
          context.commit("setDatabaseUsers", response.data);
        });
    },
  },
  modules: {},
});
