document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();

    document.myapp = new Vue({
        el: '#app',
        data: {
            editor: null,
            gnote: new GNote(),
            gauth: new GAuth(),

            //便签文件夹列表
            folders: {
                newName: "",
                delName: "",
                list: [],
                selected: null,
                $btnCreate: null,
                $btnDelete: null,
            },

            //便签列表
            note: {
                deleteName: "",
                list: [],
                selected: null,
                // $btnCreate: null, 创建便签不需要确认
                $btnDelete: null,
            },

            //提示
            tipsMsg: "",
            showTips: false,

            //loading...
            showLoading: 0,
        },
        mounted() {
            //默认网络超时15s
            axios.defaults.timeout = 15000;

            this.$_myapp_init();
        },
        watch: {},
        methods: {
            //保存便签
            saveNote() {
                if (!this.note.selected) {
                    this.$_myapp_tips("请选中便签");
                    return;
                }

                //编辑框内容是否改变
                if (!this.editor.isChanged()) {
                    this.$_myapp_tips("保存成功");
                    return;
                }

                this.$_myapp_loadingShow();
                this.gnote.noteUpdateMetadata({
                    id: this.note.selected.id,
                    name: this.note.selected.name,
                    description: this.note.selected.description,
                    success: (file) => {
                        //获取编辑框内容
                        this.$_myapp_loadingShow();
                        const data = this.editor.getText();
                        this.gnote.uploadNoteData({
                            id: this.note.selected.id,
                            data: data,
                            success: (file) => {
                                this.$_myapp_tips(this.note.selected.name + " 保存成功")
                            },
                            error: (error) => {
                                this.$_myapp_tips(error);
                            },
                            neterror: () => {
                                this.$_myapp_tipsNeterror();
                            },
                            finaly: () => {
                                this.$_myapp_loadingHide();
                            }

                        });
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }

                });
            },

            //刷新
            refresh() {
                this.$_myapp_initNodeFolders();
            },

            //插入创建的新便签
            refreshNotes(note) {
                //TODO:细化刷新操作
                this.refresh();
            },

            //创建文件夹
            folderCreateDlg() {
                this.folders.newName = "";
                this.folders.$btnCreate.modal("show");
            },
            folderCreate() {
                if (this.folders.newName == "")
                    return;
                this.folders.$btnCreate.modal("hide");

                this.$_myapp_loadingShow();
                this.gnote.noteFolderCreate({
                    name: this.folders.newName,
                    success: (folder) => {
                        this.$_myapp_tips(folder.name + "创建成功")
                        this.refresh();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            //删除文件夹
            folderDeleteDlg() {
                if (!this.$_myapp_canDeleteFolder()) {
                    this.$_myapp_tips("不能删除默认便签文件夹");
                    return;
                }

                this.folders.$btnDelete.modal("show");
            },
            folderDelete() {
                this.folders.$btnDelete.modal("hide");

                this.$_myapp_loadingShow();
                this.gnote.noteFolderDelete({
                    id: this.folders.selected.id,
                    success: () => {
                        this.$_myapp_tips(this.folders.selected.name + "删除成功")
                        this.refresh();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            //创建便签
            noteCreate() {
                this.$_myapp_loadingShow();
                this.gnote.noteCreate({
                    parent: this.folders.selected.id,
                    name: "新建便签",
                    description: "",
                    success: (note) => {
                        this.$_myapp_tips("便签创建成功")
                        this.$_myapp_initNotes();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },
            //删除便签
            noteDeleteDlg() {
                this.note.$btnDelete.modal("show");
            },
            noteDelete() {
                this.note.$btnDelete.modal("hide");

                this.$_myapp_loadingShow();
                this.gnote.noteDelete({
                    id: this.note.selected.id,
                    success: () => {
                        this.$_myapp_tips(this.note.selected.name + " 删除成功")
                        this.refresh();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            //选中文件夹事件
            onfolderchange: function (folder) {
                this.folders.selected = folder;

                //改变文件夹之后已经选中的便签赋值为空
                this.note.selected = null;

                //获取该文件夹下面的便签
                this.$_myapp_initNotes();
            },

            //选中便签事件
            onnotechange: function (note) {

                /*TODO 考虑失败
                //判断是否需要保存之前便签的内容
                if(this.editor.isChanged()) {
                    //当前note.selected还未改变
                    this.saveNote();
                }
                */

                this.note.selected = note;
                //获取该便签内容
                this.$_myapp_initNoteData();
            },

            /**
             * 私有方法
             */

            //初始化
            $_myapp_init() {

                //初始化模态窗口对象
                this.folders.$btnCreate = $("#create-folder");
                this.folders.$btnDelete = $("#delete-folder");
                this.note.$btnDelete = $("#delete-note");

                this.$_myapp_initEditor()
                this.$_myapp_initAuth();
            },

            //初始化文本编辑器
            $_myapp_initEditor: function () {
                this.editor = new EditorView({
                    el: "#codemirror-editor",
                    changes: (data) => {
                        //更新选中的便签
                        if (!this.note.selected) return;
                        if (!data) return;

                        //去内容的前20个子为标题
                        const summary = data.substr(0, 20);
                        this.note.selected.name = summary;
                        this.note.selected.description = summary;
                    }
                });
            },

            //初始化授权
            $_myapp_initAuth: function () {
                this.gauth.auth({
                    success: (token) => {
                        this.gnote.setToken(token);
                        this.$_myapp_initGNote();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    }
                });
            },

            //初始化GNode对象
            $_myapp_initGNote: function () {
                this.$_myapp_loadingShow();

                this.gnote.init({
                    success: () => {
                        this.$_myapp_initNodeFolders();
                        this.$_myapp_loadingHide();
                    },
                    error: (error) => {
                        this.$_myapp_loadingHide();
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_loadingHide();
                        this.$_myapp_tipsNeterror();
                    }
                });
            },

            //获取便签文件夹列表
            $_myapp_initNodeFolders: function () {
                this.$_myapp_loadingShow();

                this.gnote.noteFolders({
                    success: (folders) => {
                        this.folders.list = folders;

                        //编辑器清空
                        this.editor.clear();

                        if (this.folders.selected)
                            this.$_myapp_initNotes();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            //获取选中便签文件夹下面的便签列表
            $_myapp_initNotes: function () {
                this.$_myapp_loadingShow();

                this.gnote.noteFolderNotes({
                    parent: this.folders.selected.id,
                    success: (files) => {
                        this.note.list = files;

                        //编辑器清空
                        this.editor.clear();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            //获取选中便签的内容
            $_myapp_initNoteData(note) {
                this.$_myapp_loadingShow();

                this.gnote.getNoteData({
                    id: this.note.selected.id,
                    success: (data) => {
                        //设置编辑器内容
                        this.editor.clear();
                        this.editor.setText(data);
                    },
                    error: (error) => {
                        this.$_myapp_tips(error);
                    },
                    neterror: () => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            $_myapp_canDeleteFolder() {
                //没有选中，不能触发删除
                if (!this.folders.selected)
                    return false;

                //默认文件夹不能删除
                if (this.folders.selected.name === this.gnote.DEFAULT_FOLDER_MYNOTES)
                    return false;

                return true;
            },

            //提示窗口
            $_myapp_tips: function (tips) {
                this.tipsMsg = tips;
                this.showTips = true;
                setTimeout(() => {
                    this.tipsMsg = "";
                    this.showTips = false;
                }, 3000)
            },
            //提示网络不通
            $_myapp_tipsNeterror() {
                this.$_myapp_tips("服务器未响应...");
            },

            //loading状态
            $_myapp_loadingShow: function () {
                this.showLoading++;
            },
            $_myapp_loadingHide: function () {
                this.showLoading--;
            }
        },
        computed: {},
        filters: {},
        components: {
            'folder-template': {
                template: "#folder-template",
                data: function () {
                    return {
                        selectedIndex: 0,

                        noteFolders: [],
                    };
                },
                props: [
                    "dataFolders"
                ],
                methods: {
                    //绑定文件夹容器的点击事件避免每一个文件夹都添加点击事件.
                    nodeFolderItemClick: function (event) {
                        //绑定文件夹容器点击事件不响应
                        if (event.target == event.currentTarget) {
                            return;
                        }

                        //点击的文件夹下标
                        const index = this.$_myfolder_getFolderIndex(event.target);
                        const folder = this.noteFolders[index];

                        if (this.$_myfolder_isSelectedFolder(index))
                            return;

                        this.$_myfolder_updateFolderStatus(index);

                        this.$_myfolder_updateSelectedFolder(folder);
                    },


                    /**
                     * 私有方法
                     */

                    //确定点击的笔记本文件夹项下标
                    $_myfolder_getFolderIndex(target) {
                        //确定点击事件文件夹dom
                        for (var dom = target; !dom.classList.contains("folder-item"); dom = dom.parentNode) {};

                        return parseInt(dom.dataset.index);
                    },

                    //检测是否是当前选中文件夹
                    $_myfolder_isSelectedFolder(index) {
                        return index == this.selectedIndex;
                    },

                    //更新当前文件夹状态
                    $_myfolder_updateFolderStatus(index) {
                        let old = this.noteFolders[this.selectedIndex];
                        old.on = false;
                        this.$set(this.noteFolders, this.selectedIndex, old)

                        let _new = this.noteFolders[index];
                        _new.on = true;
                        this.$set(this.noteFolders, index, _new);
                        this.selectedIndex = index;
                    },

                    //通知父组件更新数据
                    $_myfolder_updateSelectedFolder(folder) {
                        //通知父组件更新当前选中的folder
                        this.$emit("onfolderchange", folder);
                    },
                },
                computed: {},
                watch: {
                    dataFolders: function (val) {
                        /**
                         * 1.拷贝一份副本，不然该watch会因为是同一份副本改变不停的触发
                         * 2.因为Vue对数组值改变不能通过赋值监测，所以需要调用方法来触发刷新
                         * https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
                         */
                        Object.assign(this.noteFolders, val);
                        this.noteFolders.splice(val.length);
                        this.noteFolders.forEach((folder, index) => {
                            if (index == 0) {
                                this.selectedIndex = 0;
                                folder.on = true;
                            } else {
                                folder.on = false;
                            }

                            folder.info = "128"
                        });

                        //选中第一项
                        if (this.noteFolders.length > 0) {
                            this.$_myfolder_updateSelectedFolder(this.noteFolders[0]);
                        }
                    }
                }
            },
            'note-template': {
                template: "#note-template",
                data() {
                    return {
                        selectedIndex: 0,
                        noteList: []
                    };
                },
                props: [
                    "dataNotes"
                ],
                methods: {
                    //绑定便签容器的点击事件避免每一个便签都添加点击事件.
                    nodeItemClick: function (event) {
                        //绑定便签容器点击事件不响应
                        if (event.target == event.currentTarget) {
                            return;
                        }

                        //点击的文件夹下标
                        const index = this.$_mynote_getNoteIndex(event.target);
                        const note = this.noteList[index];

                        if (this.$_mynote_isSelectedNote(index))
                            return;

                        //当前选中的note
                        this.$_mynote_updateNoteStatus(index);

                        //增加额外的下标
                        note.selectedIndex = index;
                        this.$_mynote_updateSelectedNote(note);
                    },

                    /**
                     * 私有方法
                     */
                    $_mynote_getNoteIndex(target) {
                        //确定点击事件便签dom
                        for (var dom = target; !dom.classList.contains("note-item"); dom = dom.parentNode) {};

                        return parseInt(dom.dataset.index);
                    },

                    //检测是否是当前选中便签
                    $_mynote_isSelectedNote(index) {
                        return index == this.selectedIndex;
                    },

                    //更新当前便签状态
                    $_mynote_updateNoteStatus(index) {
                        let old = this.noteList[this.selectedIndex];
                        old.on = false;
                        this.$set(this.noteList, this.selectedIndex, old)

                        let _new = this.noteList[index];
                        _new.on = true;
                        this.$set(this.noteList, index, _new);
                        this.selectedIndex = index;
                    },

                    //通知父组件更新数据
                    $_mynote_updateSelectedNote(note) {
                        //通知父组件更新当前选中的folder
                        this.$emit("onnotechange", note);
                    },
                },
                watch: {
                    dataNotes: function (val) {
                        /**
                         * 1.拷贝一份副本，不然该watch会因为是同一份副本改变不停的触发
                         * 2.因为Vue对数组值改变不能通过赋值监测，所以需要调用方法来触发刷新
                         * https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
                         */
                        Object.assign(this.noteList, val);
                        this.noteList.splice(val.length);
                        this.noteList.forEach((node, index) => {
                            if (index == 0) {
                                this.selectedIndex = 0;
                                node.on = true;
                            } else {
                                node.on = false;
                            }
                        });

                        //选中第一项
                        if (this.noteList.length > 0) {
                            this.$_mynote_updateSelectedNote(this.noteList[0]);
                        }
                    }
                },
                filters: {
                    formatTime(date) {
                        let dateTime = new Date(date);
                        let y = dateTime.getFullYear();
                        let m = dateTime.getMonth() + 1;
                        let d = dateTime.getDate();
                        let h = dateTime.getHours() >= 10 ? dateTime.getHours() : '0' + dateTime.getHours();
                        let min = dateTime.getMinutes() >= 10 ? dateTime.getMinutes() : '0' + dateTime.getMinutes();
                        return `${y}-${m}-${d} ${h}:${min}`;
                    }
                }
            }
        }
    });
});