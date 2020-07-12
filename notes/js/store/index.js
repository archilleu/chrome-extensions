const store = new Vuex.Store({
    state: {
        selectedFolder: null
    },
    getters: {
        selectedFolder: state => {
            return state.selectedFolder;
        },
    },
    mutations: {
        folderChange(state, folder) {
            state.selectedFolder = folder;
        }
    },
    actions: {
        folderChange({
            commit
        }, folder) {
            commit("folderChange", folder);
        }
    },
});

export default store;