import backendService from "@/services/backend-service";
import Vue from "vue"
const interactStore = {
    state: {
        headerSets:[],
        favoriteHeaderSet:{},
        currentHeaderSet:{},
        databaseToHeaderSets: {},
    },
    getters: {
        currentHeaderSet: (state) => {
            return state.currentHeaderSet;
        },
        databaseToHeaderSets: (state) => {
			return state.databaseToHeaderSets;
		},
        favoriteHeaderSet: (state) => {
            return state.favoriteHeaderSet;
        },
        headerSets:(state) => {
            return state.headerSets;
        },
        
    },
    mutations:{
        addHeaderSet(state, payload) {
			state.databaseToHeaderSets[payload.database].push(payload);
		},
        replaceHeadersInDatabaseToHeaders(state, payload) {
			let database = payload[0].database;
			state.databaseToHeaderSets[database] = payload;
		},
        setCurrentHeaderSet:(state,payload) => {
            state.currentHeaderSet = payload;
        },
        setDatabaseToHeaderSets(state, payload) {
			state.databaseToHeaderSets = payload;
		},
        setEmptyHeaderSets(state,payload) {
            Vue.set(state.databaseToHeaderSets,payload,[])
        },
        setFavoriteHeaderSet:(state,payload) => {
            state.favoriteHeaderSet = payload;
        },
        setHeaderSets(state, payload) {
			if (payload && payload.length > 0)
				Vue.set(
					state.databaseToHeaderSets,
					payload[0].database,
					payload
				);
		},
       
      
    },
    actions: {
        getDatabaseToHeaderSets(context) {
                    backendService.getDatabaseToHeaderSets().then((response) => {
                        context.commit("setDatabaseToHeaderSets", response.data);
                    });
                },
    }
}   
export {
    interactStore
}