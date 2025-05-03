import backendService from "@/services/backend-service";
import Vue from "vue";
const interactStore = {
  state: {
    headerSets: [],
    favoriteHeaderSet: {},
    currentHeaderSet: {},
    currentFilterSet: {},
    databaseToHeaderSets: {},
    databaseToFilterSets: {},
  },
  getters: {
    currentFilterSet: (state) => {
      return state.currentFilterSet;
    },
    currentHeaderSet: (state) => {
      return state.currentHeaderSet;
    },
    databaseToHeaderSets: (state) => {
      return state.databaseToHeaderSets;
    },
    databaseToFilterSets: (state) => {
      return state.databaseToFilterSets;
    },
    favoriteHeaderSet: (state) => {
      return state.favoriteHeaderSet;
    },
    favoriteFilterSet: (state) => {
      return state.favoriteFilterSet;
    },
    headerSets: (state) => {
      return state.headerSets;
    },
    filterSets: (state) => {
      return state.headerSets;
    },
  },
  mutations: {
    addFilterSet(state, payload) {
      state.databaseToFilterSets[payload.database].push(payload);
    },
    addHeaderSet(state, payload) {
      state.databaseToHeaderSets[payload.database].push(payload);
    },
    replaceHeadersInDatabaseToHeaders(state, payload) {
      let database = payload[0].database;
      state.databaseToHeaderSets[database] = payload;
    },
    setCurrentHeaderSet: (state, payload) => {
      state.currentHeaderSet = payload;
    },
    setCurrentFilterSet(state, payload) {
      state.currentFilterSet = payload;
    },
    setDatabaseToHeaderSets(state, payload) {
      state.databaseToHeaderSets = payload;
    },
    setDatabaseToFilterSets(state, payload) {
      state.databaseToFilterSets = payload;
    },
    setEmptyHeaderSets(state, payload) {
      Vue.set(state.databaseToHeaderSets, payload, []);
    },
    setFavoriteFilterSet: (state, payload) => {
      state.favoriteFilterSet = payload;
    },
    setFavoriteHeaderSet: (state, payload) => {
      state.favoriteHeaderSet = payload;
    },
    setHeaderSets(state, payload) {
      if (payload && payload.length > 0)
        Vue.set(state.databaseToHeaderSets, payload[0].database, payload);
    },
    setFilterSets(state, payload) {
      if (payload && payload.length > 0)
        Vue.set(state.databaseToFilterSets, payload[0].database, payload);
    },
  },
  actions: {
    getDatabaseToFilterSets(context) {
      backendService.getDatabaseToFilterSets().then((response) => {
        context.commit("setDatabaseToFilterSets", response.data);
      });
    },
    getDatabaseToHeaderSets(context) {
      backendService.getDatabaseToHeaderSets().then((response) => {
        context.commit("setDatabaseToHeaderSets", response.data);
      });
    },
  },
};
export { interactStore };
