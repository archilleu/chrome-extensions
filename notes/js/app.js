document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();

    document.myapp = new Vue({
        el: '#app',
        data: {
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
            selectedNoteName: null,
            note: {
                deleteName: "",
                list: [],
                selected: null,
                // $btnCreate: null, 创建便签不需要确认
                $btnDelete: null,
            }
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
                this.$refs.notes.saveNote({});
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

                this.$refs.loading.show();
                this.gnote.noteFolderCreate({
                    name: this.folders.newName,
                    success: (folder) => {
                        this.$refs.tips.tip(folder.name + "创建成功")
                        this.refresh();
                    },
                    error: (error) => {
                        this.$refs.tips.tip(error);
                    },
                    neterror: () => {
                        this.$refs.tips.neterror();
                    },
                    finaly: () => {
                        this.$refs.loading.hide();
                    }
                });
            },

            //删除文件夹
            folderDeleteDlg() {
                if (!this.$_myapp_canDeleteFolder()) {
                    this.$refs.tips.tip("不能删除默认便签文件夹");
                    return;
                }

                this.folders.$btnDelete.modal("show");
            },
            folderDelete() {
                this.folders.$btnDelete.modal("hide");

                this.$refs.loading.show();
                this.gnote.noteFolderDelete({
                    id: this.folders.selected.id,
                    success: () => {
                        this.$refs.tips.tip(this.folders.selected.name + "删除成功")
                        this.refresh();
                    },
                    error: (error) => {
                        this.$refs.tips.tip(error);
                    },
                    neterror: () => {
                        this.$refs.tips.neterror();
                    },
                    finaly: () => {
                        this.$refs.loading.hide();
                    }
                });
            },

            //创建便签
            noteCreate() {
                this.$refs.notes.noteCreate(this.folders.selected.id);
            },
            //删除便签
            noteDeleteDlg() {
                this.selectedNoteName = this.$refs.notes.selectedNoteName();
                if(null == this.selectedNoteName) {
                    this.$refs.tips.tip("请选择便签");
                    return;
                }

                this.note.$btnDelete.modal("show");
            },
            noteDelete() {
                this.note.$btnDelete.modal("hide");
                this.$refs.notes.noteDelete();
            },

            //选中文件夹事件
            onfolderchange: function (folder) {
                this.folders.selected = folder;

                //改变文件夹之后已经选中的便签赋值为空
                this.note.selected = null;

                //更新文件夹下面的便签列表
                this.$refs.notes.getFolderNotes(this.folders.selected.id);
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

                this.$_myapp_initAuth();
            },

            //初始化授权
            $_myapp_initAuth: function () {
                this.gauth.auth({
                    success: (token) => {
                        this.gnote.setToken(token);
                        this.$_myapp_initGNote();
                    },
                    error: (error) => {
                        this.$refs.tips.tip(error);
                    }
                });
            },

            //初始化GNode对象
            $_myapp_initGNote: function () {
                this.$refs.loading.show();

                this.gnote.init({
                    success: () => {
                        this.$_myapp_initNodeFolders();
                        this.$refs.loading.hide();
                    },
                    error: (error) => {
                        this.$refs.loading.hide();
                        this.$refs.tips.tip(error);
                    },
                    neterror: () => {
                        this.$refs.loading.hide();
                        this.$refs.tips.neterror();
                    }
                });
            },

            //获取便签文件夹列表
            $_myapp_initNodeFolders: function () {
                this.$refs.loading.show();

                this.gnote.noteFolders({
                    success: (folders) => {
                        this.folders.list = folders;
                    },
                    error: (error) => {
                        this.$refs.tips.tip(error);
                    },
                    neterror: () => {
                        this.$refs.tips.neterror();
                    },
                    finaly: () => {
                        this.$refs.loading.hide();
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


        },
        computed: {},
        filters: {},
        components: {
            "loading": {
                template: "#tpl-loading",
                data: function () {
                    return {
                        loadingCount: 0
                    }
                },
                methods: {
                    show() {
                        this.loadingCount++;
                    },
                    hide() {
                        this.loadingCount--;
                    }
                }
            },

            "tips": {
                template: "#tpl-tips",
                data: function () {
                    return {
                        show: false,
                        msg: ""
                    }
                },
                methods: {
                    tip(msg) {
                        this.msg = msg;
                        this.show = true;
                        setTimeout(() => {
                            this.msg = "";
                            this.show = false;
                        }, 3000);
                    },
                    neterror() {
                        this.tip("服务器未响应...");
                    }
                }
            },

            "folder-template": {
                template: "#tpl-folder",
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
            "note-template": {
                template: "#tpl-note",
                data() {
                    return {
                        editor: null,
                        selectedIndex: null,
                        noteList: [],
                        tips: null,
                        loading: null,
                        folderId: null
                    };
                },
                props: [
                    "dataNotes", "gnote"
                ],
                mounted() {
                    this.tips = this.$parent.$refs.tips;
                    this.loading = this.$parent.$refs.loading;
                    this.$_mynote_initEditor();
                },
                methods: {
                    //获取选中便签文件夹下面的便签列表
                    getFolderNotes: function (folderId) {
                        this.loading.show();

                        this.gnote.noteFolderNotes({
                            parent: folderId,
                            success: (notes) => {
                                this.folderId = folderId;

                                this.$_mynote_editorReset();

                                this.noteList = notes;

                                this.$_mynote_selecteFirstItem();

                            },
                            error: (error) => {
                                this.tips.tip(error);
                            },
                            neterror: () => {
                                this.tips.neterror();
                            },
                            finaly: () => {
                                this.loading.hide();
                            }
                        });
                    },

                    //保存便签内容
                    saveNote(option) {
                        if (null == this.selectedIndex) {
                            this.tips.tip("请选中便签");
                            return;
                        }

                        if (!this.editor.isChanged()) {
                            this.tips.tip("保存成功");
                            return;
                        }

                        this.loading.show();
                        const note = this.noteList[this.selectedIndex];
                        this.gnote.noteSave({
                            id: note.id,
                            name: note.name,
                            description: note.description,
                            data: this.editor.getText(),
                            success: (note) => {
                                this.editor.resetChanged();
                                option.success && option.success(note);
                                this.tips.tip(note.name + " 保存成功");
                            },
                            error: (error) => {
                                this.tips.tip(error);
                            },
                            neterror: () => {
                                this.tips.neterror();
                            },
                            finaly: () => {
                                this.loading.hide();
                            }
                        });
                    },

                    //获取选中便签的内容
                    getNoteData() {
                        if (null == this.selectedIndex)
                            return;

                        this.loading.show();

                        this.gnote.getNoteData({
                            id: this.noteList[this.selectedIndex].id,
                            success: (data) => {
                                //设置编辑器内容
                                this.editor.clear();
                                this.editor.setText(data);
                            },
                            error: (error) => {
                                this.tips.tip(error);
                            },
                            neterror: () => {
                                this.tips.neterror();
                            },
                            finaly: () => {
                                this.loading.hide();
                            }
                        });
                    },

                    //创建便签
                    noteCreate(folderId) {
                        this.loading.show();
                        this.gnote.noteCreate({
                            parent: folderId,
                            name: "新建便签",
                            description: "",
                            success: (note) => {
                                this.tips.tip("便签创建成功")
                                this.getFolderNotes(folderId);
                            },
                            error: (error) => {
                                this.tips.tip(error);
                            },
                            neterror: () => {
                                this.tips.neterror();
                            },
                            finaly: () => {
                                this.loading.hide();
                            }
                        });
                    },

                    //删除便签
                    noteDelete() {
                        if(null == this.selectedIndex) {
                            this.tips.tip("请选择便签");
                            return;
                        }

                        this.loading.show();
                        this.gnote.noteDelete({
                            id: this.noteList[this.selectedIndex].id,
                            success: () => {
                                this.tips.tip(this.noteList[this.selectedIndex].name + " 删除成功");

                                //刷新便签列表
                                this.getFolderNotes(this.folderId);
                            },
                            error: (error) => {
                                this.tips.tip(error);
                            },
                            neterror: () => {
                                this.tips.neterror();
                            },
                            finaly: () => {
                                this.loading.hide();
                            }
                        });
                    },

                    //获取当前选中便签的名字
                    selectedNoteName() {
                        if(null == this.selectedIndex) {
                            return null;
                        }

                        return this.noteList[this.selectedIndex].name;
                    },

                    //绑定便签容器的点击事件避免每一个便签都添加点击事件.
                    nodeItemClick: function (event) {
                        if (this.$_mynote_isNoteListDom(event))
                            return;

                        //点击便签下标
                        const index = this.$_mynote_getNoteIndex(event.target);
                        if (this.$_mynote_isSelectedNote(index))
                            return;

                        if (this.editor.isChanged()) {
                            //保存便签
                            this.saveNote({
                                success: (note) => {
                                    //更新当前选中的note
                                    this.$_mynote_changeSelectedNote(index);
                                },
                                error: (error) => {
                                    this.$parent.$tips.tip("便签自动保存失败，请稍后手动保存")
                                },
                                neterror: () => {
                                    this.$parent.$tips.neterror();
                                }
                            });
                        } else {
                            //更新当前选中的note
                            this.$_mynote_changeSelectedNote(index);
                        }
                    },

                    /**
                     * 私有方法
                     */

                    //初始化文本编辑器
                    $_mynote_initEditor() {
                        this.editor = new EditorView({
                            el: "#codemirror-editor",
                            changes: (data) => {
                                if (null == this.selectedIndex) return;
                                if (!data) return;

                                //取编辑器数据的前20个字符为标题
                                const summary = data.substr(0, 20);
                                this.noteList[this.selectedIndex].name = summary;
                                this.noteList[this.selectedIndex].description = summary;
                            }
                        });
                    },

                    $_mynote_selecteFirstItem() {
                        //默认是-1表示没有选中
                        this.selectedIndex = null;

                        if (0 == this.noteList.length)
                            return;

                        this.noteList[0].on = true;
                        this.selectedIndex = 0;

                        //获取数据
                        this.getNoteData();
                    },

                    $_mynote_editorReset() {
                        this.editor.clear();
                    },

                    //便签容器点击事件不响应
                    $_mynote_isNoteListDom(event) {
                        if (event.target == event.currentTarget) {
                            return true;
                        }

                        return false;
                    },

                    $_mynote_getNoteIndex(target) {
                        //确定点击事件便签dom
                        for (var dom = target; !dom.classList.contains("note-item"); dom = dom.parentNode) {};

                        return parseInt(dom.dataset.index);
                    },

                    //检测是否是当前选中便签
                    $_mynote_isSelectedNote(index) {
                        return index == this.selectedIndex;
                    },

                    //更新当前选中的便签
                    $_mynote_changeSelectedNote(index) {
                        let old = this.noteList[this.selectedIndex];
                        old.on = false;
                        this.$set(this.noteList, this.selectedIndex, old);

                        let _new = this.noteList[index];
                        _new.on = true;
                        this.$set(this.noteList, index, _new);
                        this.selectedIndex = index;

                        //获取数据
                        this.getNoteData();
                    },
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