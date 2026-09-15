import Vue from "vue";
import Vuex from "vuex";
import backendService from "../services/backend-service";
import { interactStore } from "./interact-store.js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    allDatabases: [],
    allGroups: [],
    allUsers: [],
    automations: {},
    availableDatabases: [],
    choices: [],
    currentUser: {},
    currentDatabase: {},
    customButtons: [],
    databaseToFields: {},
    databaseToChoices: {},
    databaseToLayoutMappings: {},
    dropdowns: {},
    emptyEntry: {},
    entries: [],
    fields: [],
    fieldToChoices: {},
    fieldToField: {},
    formValid: {},

    isAdmin: false,
    isLoggedIn: false,
    itemsPerPage: 15,
    layout: [],
    navigationOptions: [],
    search: {},
    selectedRow: -1,
    users: [],
  },
  getters: {
    allDatabases: (state) => {
      return state.allDatabases;
    },
    allUsers: (state) => {
      return state.allUsers;
    },
    automations: (state) => {
      return state.automations;
    },
    availableDatabases: (state) => {
      return state.availableDatabases;
    },
    currentUser: (state) => {
      return state.currentUser;
    },
    currentDatabase: (state) => {
      return state.currentDatabase;
    },
    customButtons: (state) => {
      return state.customButtons;
    },
    emptyEntry: (state) => {
      return state.emptyEntry;
    },
    entries: (state) => {
      return state.entries;
    },
    formValid: (state) => {
      return state.formValid;
    },
    fieldToChoices: (state) => {
      return state.fieldToChoices;
    },
    fields: (state) => {
      return state.fields;
    },
    isAdmin: (state) => {
      return state.isAdmin;
    },
    isLoggedIn: (state) => {
      return state.isLoggedIn;
    },
    itemsPerPage: (state) => {
      return state.itemsPerPage;
    },
    navigationOptions: (state) => {
      return state.navigationOptions;
    },
    search: (state) => {
      return state.search;
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

    databaseToLayoutMappings: (state) => {
      return state.databaseToLayoutMappings;
    },
    dropdowns: (state) => {
      return state.dropdowns;
    },
    fieldToField: (state) => {
      return state.fieldToField;
    },
    layout: (state) => {
      return state.layout;
    },
    selectedHeaders: (state) => {
      return state.selectedHeaders;
    },
    users: (state) => {
      return state.users;
    },
  },
  mutations: {
    addNewAutomation(state, payload) {
      state.automations.push(payload);
    },
    addNewGroupToList(state, payload) {
      state.allGroups.push(payload);
    },
    addNewDatabaseToList(state, payload) {
      if (!state.allDatabases.find((database) => database._id == payload._id)) {
        state.allDatabases.push(payload);
      }
      if (
        !state.availableDatabases.find(
          (database) => database._id == payload._id
        )
      ) {
        state.availableDatabases.push(payload);
      }
    },
    addNewChoices(state, payload) {
      if (!payload || payload.length == 0) return;
      const databaseValue = payload[0].database;
      const choices = state.databaseToChoices[databaseValue] || [];
      payload.forEach((choice) => {
        choices.push(choice);
      });
      Vue.set(state.databaseToChoices, databaseValue, choices);
      if (state.currentDatabase.value == databaseValue) {
        state.choices = choices;
        let fieldToChoices = {};
        for (let i = 0; i < choices.length; i++) {
          let choice = choices[i];
          if (!fieldToChoices[choice.field]) {
            fieldToChoices[choice.field] = [];
          }
          fieldToChoices[choice.field].push(choice);
        }
        state.fieldToChoices = fieldToChoices;
      }
    },
    addNewField(state, payload) {
      if (!state.databaseToFields[payload.database]) {
        Vue.set(state.databaseToFields, payload.database, []);
      }
      state.databaseToFields[payload.database].push(payload);
    },

    addEntry(state, payload) {
      state.entries.unshift(payload);
    },
    addChoicesToDict(state, payload) {
      if (payload && payload.length > 0) {
        let databaseValue = payload[0].database;
        Vue.set(state.databaseToChoices, databaseValue, payload);
      }
    },
    addFieldsToDict(state, payload) {
      if (payload && payload.length > 0) {
        let databaseValue = payload[0].database;
        state.databaseToFields[databaseValue] = payload;
      }
    },

    addLayoutToDict(state, payload) {
      if (payload && payload.length > 0) {
        let databaseValue = payload[0].database;
        state.databaseToLayoutMappings[databaseValue] = payload;
      }
    },

    deleteEntry(state, payload) {
      state.entries = state.entries.filter((e) => {
        return e._id != payload;
      });
    },
    removeDatabase(state, payload) {
      const databaseValue = payload.value || payload;
      state.allDatabases = state.allDatabases.filter((database) => {
        return database.value != databaseValue;
      });
      state.availableDatabases = state.availableDatabases.filter((database) => {
        return database.value != databaseValue;
      });
      Vue.delete(state.databaseToFields, databaseValue);
      Vue.delete(state.databaseToChoices, databaseValue);
      Vue.delete(state.databaseToLayoutMappings, databaseValue);
      if (state.currentDatabase.value == databaseValue) {
        state.currentDatabase = {};
        localStorage.removeItem("currentDatabase");
        state.entries = [];
        state.fields = [];
        state.choices = [];
        state.layout = [];
        state.fieldToField = {};
        state.fieldToChoices = {};
        state.emptyEntry = {};
        state.users = [];
        state.automations = [];
      }
    },
    removeField(state, payload) {
      const fields = state.databaseToFields[payload.database] || [];
      Vue.set(
        state.databaseToFields,
        payload.database,
        fields
          .filter((field) => field.value != payload.value)
          .map((field) => {
            if (Array.isArray(field.listFields)) {
              field.listFields = field.listFields.filter((listField) => {
                return listField.value != payload.value;
              });
            }
            return field;
          })
      );
      if (state.fields) {
        state.fields = state.fields
          .filter((field) => {
            return (
              field.database != payload.database || field.value != payload.value
            );
          })
          .map((field) => {
            if (Array.isArray(field.listFields)) {
              field.listFields = field.listFields.filter((listField) => {
                return listField.value != payload.value;
              });
            }
            return field;
          });
      }
      if (state.fieldToField) {
        Vue.delete(state.fieldToField, payload.value);
      }
    },
    replaceChoicesInDatabaseToChoices(state, payload) {
      if (!payload || payload.length == 0) return;
      let field = payload[0].field;
      let database = payload[0].database;
      let choices = state.databaseToChoices[database];
      if (!choices) choices = [];
      choices = choices.filter((choice) => choice.field != field);
      choices = choices.concat(payload);
      Vue.set(state.databaseToChoices, database, choices);
      if (state.currentDatabase.value == database) {
        state.choices = choices;
        let fieldToChoices = {};
        for (let i = 0; i < choices.length; i++) {
          let choice = choices[i];
          if (!fieldToChoices[choice.field]) {
            fieldToChoices[choice.field] = [];
          }
          fieldToChoices[choice.field].push(choice);
        }
        state.fieldToChoices = fieldToChoices;
      }
    },

    setAllDatabases(state, payload) {
      state.allDatabases = payload;
    },
    setAllGroups(state, payload) {
      state.allGroups = payload;
    },
    setAllUsers(state, payload) {
      state.allUsers = payload;
    },
    setAutomations(state, payload) {
      state.automations = payload;
    },
    setChoices(state, payload) {
      let fieldToChoices = {};
      state.choices = payload;
      for (let i = 0; i < payload.length; i++) {
        let choice = payload[i];
        if (!fieldToChoices[choice.field]) {
          fieldToChoices[choice.field] = [];
        }
        fieldToChoices[choice.field].push(choice);
      }
      state.fieldToChoices = fieldToChoices;
    },
    setCurrentUser(state, payload) {
      state.currentUser = payload;
      if (Object.keys(payload).length !== 0) {
        state.isLoggedIn = true;
      } else {
        state.isLoggedIn = false;
      }
      if (payload.options && payload.options.isAdmin) {
        state.isAdmin = true;
      } else {
        state.isAdmin = false;
      }
    },
    setCurrentDatabase(state, payload) {
      state.currentDatabase = payload || {};
      if (payload && payload.value) {
        localStorage.setItem("currentDatabase", JSON.stringify(payload));
      }
    },
    setItemsPerPage(state, payload) {
      state.itemsPerPage = payload;
    },
    setNavigationOptions(state, payload) {
      state.navigationOptions = payload;
    },
    setAvailableDatabases(state, payload) {
      state.availableDatabases = payload;
    },
    setSearch(state, payload) {
      state.search = payload;
    },
    setCustomButtons(state, payload) {
      state.customButtons = payload;
    },
    setSelectedRow(state, payload) {
      state.selectedRow = payload;
    },
    setDatabaseToFields(state, payload) {
      state.databaseToFields = payload;
    },
    setDatabaseToChoices(state, payload) {
      state.databaseToChoices = payload;
    },

    setDatabaseToLayoutMappings(state, payload) {
      state.databaseToLayoutMappings = payload;
    },
    setDropdowns(state, payload) {
      state.dropdowns = payload;
    },

    setDatabase(state, payload) {
      state.allDatabases.forEach((database, idx) => {
        if (database._id == payload._id) {
          state.allDatabases[idx] = payload;
        }
      });
    },
    setFields(state, payload) {
      let fieldToField = {};
      state.fields = payload;
      for (let i = 0; i < payload.length; i++) {
        let field = payload[i];
        fieldToField[field.value] = field;
      }
      state.fieldToField = fieldToField;
    },
    setFormValid(state, payload) {
      state.formValid = payload;
    },
    setGroup(state, payload) {
      state.allGroups.forEach((group, idx) => {
        if (group._id == payload._id) {
          state.allGroups[idx] = payload;
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
    setLayout(state, payload) {
      state.layout = payload;
    },

    setEmptyEntry(state, payload) {
      state.emptyEntry = payload;
    },
    setEntries(state, payload) {
      state.entries = payload;
    },

    setUsers(state, payload) {
      state.users = payload;
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
    getAutomationsByDatabase(context, payload) {
      const databaseValue = payload || context.state.currentDatabase.value;
      if (!databaseValue) return Promise.resolve();
      return backendService
        .getAutomationsByDatabase(databaseValue)
        .then((response) => {
          context.commit("setAutomations", response.data);
        });
    },
    getAvailableDatabases(context) {
      const userId = context.state.currentUser.userId || localStorage.getItem("userId");
      if (!userId) return Promise.resolve();
      return backendService.getDatabasesByUserId(userId).then((response) => {
        context.commit("setAvailableDatabases", response.data);
        if (context.state.allDatabases.length == 0) {
          context.commit("setAllDatabases", response.data);
        }
      });
    },
    getAllUsers(context) {
      backendService
        .getAllUsers()
        .then((response) => {
          context.commit("setAllUsers", response.data);
        })
        .catch(() => {});
    },

    getAllCustomButtons(context) {
      backendService
        .getAllCustomButtonsByDatabase(context.getters.currentDatabase)
        .then((response) => {
          context.commit("setCustomButtons", response.data);
        });
    },
    getAllGroups(context) {
      backendService
        .getAllGroups()
        .then((response) => {
          context.commit("setAllGroups", response.data);
        })
        .catch(() => {});
    },
    getAllDatabases(context) {
      backendService
        .getAllDatabases()
        .then((response) => {
          context.commit("setAllDatabases", response.data);
        })
        .catch(() => {});
    },
    getChoicesByDatabase(context, payload) {
      let databaseValue = payload;
      if (!databaseValue) {
        databaseValue = context.state.currentDatabase.value;
      }
      if (context.state.databaseToChoices[databaseValue]) {
        context.commit(
          "setChoices",
          context.state.databaseToChoices[databaseValue]
        );
        return Promise.resolve();
      } else {
        return backendService.getChoicesByDatabase(databaseValue).then((response) => {
          context.commit("addChoicesToDict", response.data);
          context.commit("setChoices", response.data);
        });
      }
    },
    getDatabaseToFields(context) {
      backendService
        .getDatabaseToFields()
        .then((response) => {
          context.commit("setDatabaseToFields", response.data);
        })
        .catch(() => {});
    },
    getDatabaseToChoices(context) {
      backendService
        .getDatabaseToChoices()
        .then((response) => {
          context.commit("setDatabaseToChoices", response.data);
        })
        .catch(() => {});
    },
    getDatabaseToLayoutMappings(context) {
      backendService.getDatabaseToLayoutMappings().then((response) => {
        context.commit("setDatabaseToLayoutMappings", response.data);
      });
    },
    getDatabasesByUserId(context) {
      const userId = context.state.currentUser.userId || localStorage.getItem("userId");
      if (!userId) return Promise.resolve();
      return backendService
        .getDatabasesByUserId(userId)
        .then((response) => {
          context.commit("setAvailableDatabases", response.data);
          if (context.state.allDatabases.length == 0) {
            context.commit("setAllDatabases", response.data);
          }
        });
    },
    getDropdowns(context) {
      backendService.getDropdowns().then((response) => {
        context.commit("setDropdowns", response.data);
      });
    },
    getEmptyEntryByDatabase(context, payload) {
      const databaseValue = payload || context.state.currentDatabase.value;
      if (!databaseValue) return Promise.resolve();
      return backendService
        .getEmptyEntryByDatabase(databaseValue)
        .then((response) => {
          context.commit("setEmptyEntry", response.data);
        });
    },
    getEntriesByDatabase(context, payload) {
      const databaseValue = payload || context.state.currentDatabase.value;
      if (!databaseValue) return Promise.resolve();
      let conditions = {};
      try {
        conditions = JSON.parse(context.getters.currentFilterSet.conditions);
      } catch (err) {
        conditions = {};
      }
      return backendService
        .getEntriesByDatabase(databaseValue, conditions)
        .then((response) => {
          context.commit("setEntries", response.data);
        });
    },
    getFieldsByDatabase(context, payload) {
      let databaseValue = payload;
      if (!databaseValue) {
        databaseValue = context.state.currentDatabase.value;
      }
      if (context.state.databaseToFields[databaseValue]) {
        context.commit(
          "setFields",
          context.state.databaseToFields[databaseValue]
        );
        return Promise.resolve();
      } else {
        return backendService.getFieldsByDatabase(databaseValue).then((response) => {
          context.commit("addFieldsToDict", response.data);
          context.commit("setFields", response.data);
        });
      }
    },
    getHeaderSetsByDatabase(context) {
      let databaseValue = context.state.currentDatabase.value;
      return backendService
        .getHeaderSetsByDatabase(databaseValue)
        .then((response) => {
          if (response.data.length > 0) {
            let favorite = response.data.find((e) => e.isFavorite);
            context.commit("setHeaderSets", response.data);
            if (favorite) {
              context.commit("setFavoriteHeaderSet", favorite);
              context.commit("setCurrentHeaderSet", favorite);
            } else {
              context.commit("setCurrentHeaderSet", response.data[0]);
            }
          } else {
            context.commit("setEmptyHeaderSets", databaseValue);
            context.commit("setCurrentHeaderSet", {});
          }
        });
    },
    getFilterSetsByDatabase(context) {
      let databaseValue = context.state.currentDatabase.value;
      return backendService
        .getFilterSetsByDatabase(databaseValue)
        .then((response) => {
          if (response.data.length > 0) {
            let favorite = response.data.find((e) => e.isFavorite);
            context.commit("setFilterSets", response.data);
            if (favorite) {
              context.commit("setFavoriteFilterSet", favorite);
              context.commit("setCurrentFilterSet", favorite);
            } else {
              context.commit("setCurrentFilterSet", response.data[0]);
            }
          } else {
            context.commit("setEmptyFilterSets", databaseValue);
            context.commit("setCurrentFilterSet", {});
          }
        });
    },
    getNavigationOptions(context) {
      backendService.getNavigationOptions().then((response) => {
        context.commit("setNavigationOptions", response.data);
      });
    },
    getUsersByDatabase(context, payload) {
      const databaseValue = payload || context.state.currentDatabase.value;
      if (!databaseValue) return Promise.resolve();
      return backendService
        .getUsersByDatabase(databaseValue)
        .then((response) => {
          context.commit("setUsers", response.data);
        });
    },
    getLayoutByDatabase(context, payload) {
      let databaseValue = payload;
      if (!databaseValue) {
        databaseValue = context.state.currentDatabase.value;
      }
      if (context.state.databaseToLayoutMappings[databaseValue]) {
        context.commit(
          "setLayout",
          context.state.databaseToLayoutMappings[databaseValue]
        );
        return Promise.resolve();
      } else {
        return backendService.getLayoutByDatabase(databaseValue).then((response) => {
          context.commit("addLayoutToDict", response.data);
          context.commit("setLayout", response.data);
        });
      }
    },
  },
  modules: { interactStore },
});
