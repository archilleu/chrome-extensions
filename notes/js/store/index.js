const store = new Vuex.Store({
    state: {
        //当前选中文件夹
        selectedFolder: null,

        //当前选中文件
        selectedNote: null,

        //editor内容变化
        editorChange: null,

        //便签保存操作
        saveNote: 0,

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
        editorChange: state => {
            return state.editorChange;
        },

        saveNote: state => {
            return state.saveNote;
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

        editorChange(state, data) {
            state.editorChange = data;
        },

        saveNote(state) {
            state.saveNote += 1;
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

        editorChange({
            commit
        }, editorChange) {
            commit("editorChange", editorChange);
        },

        saveNote({
            commit
        }) {
            commit("saveNote");
        },


        loadingChange({
            commit
        }, boolean) {
            commit("loadingChange", boolean);
        },
    },
});

export default store;