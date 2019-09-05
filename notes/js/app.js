document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();

    document.myapp = new Vue({
        el: '#app',
        data: {
            editor: null,
            gnode: new GNode(),
            gauth: new GAuth(),

            //便签文件夹列表
            newFolderName: "",
            deleteFolderName: "",
            nodeFolders: [],
            selectedFolder: 0,
            $btnCreateFolder: null,
            $btnDeleteFolder: null,

            //便签列表
            notes: {
                newrName: "",
                deleteName: "",
                list: [],
                selected: 0,
                $btnCreate: null,
                $btnDelete: null,
            },

            //提示
            tipsMsg: "",
            showTips: false,

            //loading...
            showLoading: false,
        },
        mounted() {
            this.$_myapp_init();
        },
        watch: {},
        methods: {
            //创建文件夹
            folderCreateDlg() {
                this.newFolderName = "";
                this.$btnCreateFolder.modal("show");
            },
            folderCreate() {
                if (this.newFolderName == "")
                    return;
                this.$btnCreateFolder.modal("hide");

                this.$_myapp_loadingShow();
                this.gnode.noteFolderCreate({
                    name: this.newFolderName,
                    success: (folder) => {
                        this.$_myapp_tips(folder.name + "创建成功")
                    },
                    error: (error) => {
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

                this.$btnDeleteFolder.modal("show");
            },
            folderDelete() {
                this.$btnDeleteFolder.modal("hide");

                this.$_myapp_loadingShow();
                this.gnode.noteFolderDelete({
                    id: this.selectedFolder.id,
                    success: (folder) => {
                        this.$_myapp_tips(folder.name + "删除成功")
                    },
                    error: (error) => {
                        this.$_myapp_tipsNeterror();
                    },
                    finaly: () => {
                        this.$_myapp_loadingHide();
                    }
                });
            },

            onfolderchange: function (folder) {
                this.selectedFolder = folder;

                /*
                //获取该便签文件夹的便签列表
                this.gnode.noteFolderNotes({
                    id: folder.id,
                    success: (notes) => {

                    },
                    error: (error) => {

                    },
                    neterror: () => {

                    }
                });*/
            },

            /**
             * 私有方法
             */

            //初始化
            $_myapp_init() {
                this.$btnCreateFolder = $('#create-folder');
                this.$btnDeleteFolder = $('#delete-folder');
                this.$_myapp_initEditor()
                this.$_myapp_initAuth();
            },

            //初始化文本编辑器
            $_myapp_initEditor: function () {
                this.editor = new EditorView({
                    el: "#codemirror-editor"
                });
            },

            //初始化授权
            $_myapp_initAuth: function () {
                this.gauth.auth({
                    success: (token) => {
                        this.$_myapp_initGNode();
                    },
                    error: (error) => {
                        this.$_myapp_tips(error.message);
                    }
                });
            },

            //初始化GNode对象
            $_myapp_initGNode: function () {
                this.$_myapp_loadingShow();

                this.gnode.init({
                    success: () => {
                        this.$_myapp_initNodeFolders();
                    },
                    error: (error) => {
                        this.$_myapp_loadingHide();
                        this.$_myapp_tips(error.message);
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

                this.gnode.noteFolders({
                    success: (folders) => {
                        this.nodeFolders = folders;
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
                if (!this.selectedFolder)
                    return false;

                //默认文件夹不能删除
                if (this.selectedFolder === this.gnode.DEFAULT_FOLDER_MYNOTES)
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
                this.showLoading = true;
            },
            $_myapp_loadingHide: function () {
                this.showLoading = false;
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

                        nodeFolders: [],
                    };
                },
                props: [
                    "dataFolders"
                ],
                methods: {
                    //绑定文件夹容器的点击事件避免每一个文件夹都添加点击事件.
                    nodeFolderItemClick: function (event) {
                        if (event.target == event.currentTarget) {
                            return;
                        }

                        //点击的文件夹下标
                        const index = this.$_myfolder_getFolderIndex(event.target);
                        const folder = this.nodeFolders[index];

                        if (this.$_myfolder_isSelectedFolder(index))
                            return;

                        this.$_myfolder_updateFolderStatus(index);

                        this.$_myfolder_updateNotes(folder);

                        this.$_myfolder_updateSelectedFolder(folder);
                    },


                    /**
                     * 私有方法
                     */

                    //确定点击的笔记本文件夹项下标
                    $_myfolder_getFolderIndex(target) {
                        //确定点击事件文件夹dom
                        const isFolder = target.classList.contains("folder-item");
                        if (isFolder) {
                            dom = target;
                        } else {
                            dom = target.parentNode;
                        }

                        return parseInt(dom.dataset.index);
                    },

                    //检测是否是当前选中文件夹
                    $_myfolder_isSelectedFolder(index) {
                        return index == this.selectedIndex;
                    },

                    //更新当前文件夹状态
                    $_myfolder_updateFolderStatus(index) {
                        let old = this.nodeFolders[this.selectedIndex];
                        old.on = false;
                        this.$set(this.nodeFolders, this.selectedIndex, old)

                        let _new = this.nodeFolders[index];
                        _new.on = true;
                        this.$set(this.nodeFolders, index, _new);
                        this.selectedIndex = index;
                    },

                    //通知父组件更新数据
                    $_myfolder_updateSelectedFolder(folder) {
                        //通知父组件更新当前选中的folder
                        this.$emit("onfolderchange", folder);
                    },

                    //更新兄弟主键更新note列表
                    $_myfolder_updateNotes(folder) {}
                },
                computed: {},
                watch: {
                    dataFolders: function (val) {
                        /**
                         * 1.拷贝一份副本，不然该watch会因为是同一份副本改变不停的触发
                         * 2.因为Vue对数组值改变不能通过赋值监测，所以需要调用方法来触发刷新
                         * https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
                         */
                        Object.assign(this.nodeFolders, val);
                        this.nodeFolders.splice(val.length);
                        this.nodeFolders.forEach((folder, index) => {
                            if (index == 0) {
                                folder.on = true;
                            } else {
                                folder.on = false;
                            }

                            folder.info = "128"
                        });
                    }
                }
            },
            'note-template': {
                template: "#note-template",
                data() {
                    return {
                        nodeList: [{
                                id: 1,
                                descript: 123,
                                time: Date.now(),
                                on: true
                            },
                            {
                                id: 2,
                                descript: 456,
                                time: Date.now(),
                                on: false
                            }
                        ]
                    };
                }
            }
        }
    });
});