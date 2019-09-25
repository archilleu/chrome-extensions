document.addEventListener('DOMContentLoaded', () => {

    document.myapp = new Vue({
        el: '#app',
        data: {
            gnote: new GNote(),
            gauth: new GAuth(),

            timeNow: new Date().toLocaleString(),
            textCount: 0,

            //便签文件夹列表
            folders: {
                newName: null,
                selected: null,
                $btnCreate: null,
                $btnDelete: null,
            },

            //便签列表
            notes: {
                selected: null,
                $btnDelete: null,
            }
        },
        mounted() {
            this.$_myapp_init();
        },
        methods: {
            //保存便签
            saveNote() {
                this.$refs.notes.saveNote({});
            },

            //刷新
            refresh() {
                this.$refs.folders.noteFolders();
            },

            //创建文件夹
            folderCreateDlg() {
                this.folders.newName = "";
                this.folders.$btnCreate.modal("show");
            },
            folderCreate() {
                this.folders.$btnCreate.modal("hide");
                if (this.folders.newName == "")
                    return;

                this.$refs.folders.folderCreate(this.folders.newName);
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
                if (null == this.folders.selected) {
                    this.$refs.tips.tip("请选中文件夹");
                    return;
                }

                this.$refs.folders.folderDelete();
            },

            //创建便签
            noteCreate() {
                this.$refs.notes.noteCreate(this.folders.selected.id);
            },
            //删除便签
            noteDeleteDlg() {
                if (null == this.notes.selected) {
                    this.$refs.tips.tip("请选择便签");
                    return;
                }

                this.notes.$btnDelete.modal("show");
            },
            noteDelete() {
                this.notes.$btnDelete.modal("hide");
                this.$refs.notes.noteDelete();
            },

            //登出
            logout() {
                this.$refs.loading.show();
                this.gauth.revokeAuth({
                    success: () => {
                        this.$refs.loading.hide();
                        this.$refs.tips.tip("登出成功");

                        //为了让提示停留，所以延迟跳转
                        setTimeout(() => {
                            window.location.href = chrome.extension.getURL('login.html');
                        }, 1000);
                    },
                    error: () => {
                        this.$refs.loading.hide();
                        this.$refs.tips.tip("服务器忙，登出失败");
                    }
                });
            },

            /**
             * 私有方法
             */

            //初始化
            $_myapp_init() {
                //模态窗口对象
                this.folders.$btnCreate = $("#create-folder");
                this.folders.$btnDelete = $("#delete-folder");
                this.notes.$btnDelete = $("#delete-note");

                //默认网络超时15s
                axios.defaults.timeout = 15000;

                //授权
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
                        this.$refs.folders.noteFolders();
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

            $_myapp_canDeleteFolder() {
                //没有选中，不能删除
                if (!this.folders.selected)
                    return false;

                //默认文件夹不能删除
                if (this.folders.selected.name === this.gnote.DEFAULT_FOLDER_MYNOTES)
                    return false;

                return true;
            },

            //子模块通知选中文件夹改变
            onselectedfolderchange(folder) {
                this.folders.selected = folder;

                //更新便签列表
                this.$refs.notes.getFolderNotes(folder.id);
            },

            //子模块通知选中便签改变
            onselectednotechange(note) {
                this.notes.selected = note;

                //更新编辑器内容
                this.$refs.notes.getNoteData();

                //更新时间
                this.timeNow = new Date().toLocaleString();
            },

            //子模块通知字数统计变化
            ontextcountchange(textCount) {
                this.textCount = textCount;
            }
        },
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
                        selectedIndex: null,
                        folderList: [],
                        tips: null,
                        loading: null
                    };
                },
                props: [
                    "gnote"
                ],
                mounted() {
                    this.tips = this.$parent.$refs.tips;
                    this.loading = this.$parent.$refs.loading;
                },
                methods: {
                    //获取便签文件夹列表
                    noteFolders: function () {
                        this.loading.show();

                        this.gnote.noteFolders({
                            success: (folders) => {
                                this.folderList = folders;

                                if (0 == folders.length) {
                                    this.selectedIndex = null;
                                    this.$_myfolder_notifyUpdateSelected(null);
                                } else {
                                    this.$_myfolder_selectFirstItem();
                                    this.$_myfolder_notifyUpdateSelected(folders[0]);
                                }
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

                    folderCreate(folderName) {
                        this.loading.show();
                        this.gnote.noteFolderCreate({
                            name: folderName,
                            success: (folder) => {
                                this.tips.tip(folder.name + "创建成功")

                                //更新文件夹列表
                                this.noteFolders();
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

                    folderDelete() {
                        this.loading.show();
                        this.gnote.noteFolderDelete({
                            id: this.folderList[this.selectedIndex].id,
                            success: () => {
                                this.tips.tip(this.folderList[this.selectedIndex].name + "删除成功")

                                //更新文件夹列表
                                this.noteFolders();
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

                    //绑定文件夹容器的点击事件避免每一个文件夹都添加点击事件.
                    nodeFolderItemClick: function (event) {
                        if (this.$_myfolder_isFolderListDom(event))
                            return;

                        //点击文件夹下标
                        const index = this.$_myfolder_getFolderIndex(event.target);
                        if (this.$_myfolder_isSelected(index))
                            return;

                        const folder = this.folderList[index];

                        //判断editor是否改变
                        if (this.$parent.$refs.notes.editor.isChanged()) {
                            //保存便签
                            this.$parent.$refs.notes.saveNote({
                                success: (note) => {
                                    //更新当前选中的folder
                                    this.$_myfolder_changeSelected(index);

                                    this.$_myfolder_notifyUpdateSelected(folder);
                                },
                                error: (error) => {
                                    this.$parent.$tips.tip("便签自动保存失败，请稍后手动保存")
                                },
                                neterror: () => {
                                    this.$parent.$tips.neterror();
                                }
                            });
                        } else {
                            //更新当前选中的folder
                            this.$_myfolder_changeSelected(index);

                            this.$_myfolder_notifyUpdateSelected(folder);
                        }
                    },

                    /**
                     * 私有方法
                     */

                    $_myfolder_selectFirstItem() {
                        this.folderList[0].on = true;
                        this.selectedIndex = 0;

                        //获取该文件夹下面的便签
                        this.$parent.$refs.notes.getFolderNotes(this.folderList[0].id);
                    },

                    //文件夹容器点击事件不响应
                    $_myfolder_isFolderListDom(event) {
                        if (event.target == event.currentTarget) {
                            return true;
                        }

                        return false;
                    },

                    //确定点击的笔记本文件夹项下标
                    $_myfolder_getFolderIndex(target) {
                        //确定点击事件文件夹dom
                        for (var dom = target; !dom.classList.contains("folder-item"); dom = dom.parentNode) {};

                        return parseInt(dom.dataset.index);
                    },

                    //检测是否是当前选中文件夹
                    $_myfolder_isSelected(index) {
                        return index == this.selectedIndex;
                    },

                    //更新当前文件夹状态
                    $_myfolder_changeSelected(index) {
                        let old = this.folderList[this.selectedIndex];
                        old.on = false;
                        this.$set(this.folderList, this.selectedIndex, old)

                        let _new = this.folderList[index];
                        _new.on = true;
                        this.$set(this.folderList, index, _new);
                        this.selectedIndex = index;

                        //获取该文件夹下面的便签
                        this.$parent.$refs.notes.getFolderNotes(this.folderList[this.selectedIndex].id);
                    },

                    //通知父组件更新数据
                    $_myfolder_notifyUpdateSelected(folder) {
                        //通知父组件更新当前选中的folder
                        this.$emit("eventselectedfolderchange", folder);
                    },
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
                    "gnote"
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
                                this.$_mynote_editorReset();
                                this.folderId = folderId;
                                this.noteList = notes;

                                if (0 == notes.length) {
                                    this.selectedIndex = null;
                                    this.$_mynote_notifyUpdateSelected(null);
                                } else {
                                    this.$_mynote_selecteFirstItem();
                                    this.$_mynote_notifyUpdateSelected(notes[0]);
                                }

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
                        if (null == this.selectedIndex) {
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

                    //绑定便签容器的点击事件避免每一个便签都添加点击事件.
                    nodeItemClick: function (event) {
                        if (this.$_mynote_isNoteListDom(event))
                            return;

                        //点击便签下标
                        const index = this.$_mynote_getNoteIndex(event.target);
                        if (this.$_mynote_isSelectedNote(index))
                            return;

                        const note = this.noteList[index];

                        //判断editor是否改变
                        if (this.editor.isChanged()) {
                            //保存便签
                            this.saveNote({
                                success: (note) => {
                                    //更新当前选中的note
                                    this.$_mynote_changeSelected(index);

                                    this.$_mynote_notifyUpdateSelected(note);
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
                            this.$_mynote_changeSelected(index);

                            this.$_mynote_notifyUpdateSelected(note);
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
                                let note = this.noteList[this.selectedIndex];
                                note.name = summary;
                                note.description = summary;
                                this.$emit("eventtextcountchange", data.length);
                            }
                        });
                    },

                    $_mynote_selecteFirstItem() {
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
                    $_mynote_changeSelected(index) {
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

                    //通知父组件更新数据
                    $_mynote_notifyUpdateSelected(note) {
                        //通知父组件更新当前选中的note
                        this.$emit("eventselectednotechange", note);
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