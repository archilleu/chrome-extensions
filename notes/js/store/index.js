const store = new Vuex.Store({
    state: {
        //当前选中文件夹
        selectedFolder: null,

        //当前选中文件
        selectedNote: null,

        //网络加载状态
        loading: 0,
    },
    getters: {
        selectedFolder: state => {
            return state.selectedFolder;
        },

        selectedNote: state => {
            return state.selectedNote;
        },

        loading: state => {
            return state.loading;
        },
    },
    mutations: {
        folderChange(state, folder) {
            state.selectedFolder = folder;
        },

        noteChange(state, note) {
            state.selectedNote = note;
        },

        loadingChange(state, boolean) {
            boolean ? state.loading++ : state.loading--;
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
        },
        loadingChange({
            commit
        }, boolean) {
            commit("loadingChange", boolean);
        },
    },
});

export default store;