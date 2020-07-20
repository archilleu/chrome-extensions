const store = new Vuex.Store({
    state: {
        selectedFolder: null,
        selectedNote: null
    },
    getters: {
        selectedFolder: state => {
            return state.selectedFolder;
        },

        selectedNote: state => {
            return state.selectedNote;
        },
    },
    mutations: {
        folderChange(state, folder) {
            state.selectedFolder = folder;
        },

        noteChange(state, note) {
            state.selectedNote = note;
        }
    },
    actions: {
        folderChange({
            commit
        }, folder) {
            commit("folderChange", folder);
        },
        noteChange({
            commit
        }, note) {
            commit("noteChange", note);
        }
    },
});

export default store;