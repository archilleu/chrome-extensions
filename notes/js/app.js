document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();

    document.myapp = new Vue({
        el: '#app',
        data: {
            editor: null,
            gnode: new GNode(),
            gauth: new GAuth(),

            nodeFolders: [],

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
            /**
             * 私有方法
             */

            //初始化
            $_myapp_init() {
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

                this.gnode.NodeFolders({
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
                        curFolder: null,
                        curIndex: 0
                    };
                },
                props: [
                    "dataFolders"
                ],
                methods: {
                    //绑定文件夹容器的点击事件避免每一个文件夹都添加点击事件.
                    nodeFolderItemClick: function (event) {
                        // 如果点击容器本身则不处理
                        if (event.target == event.currentTarget) {
                            return;
                        }

                        //确定点击事件文件夹dom
                        var folder = event.target.querySelector(".folder-item");
                        if(!folder) {
                            folder = event.target.parentNode;
                        }

                        console.log(folder);
                    },


                    /**
                     * 私有方法
                     */

                    //重置文件夹的初始状态
                    $_myfolder_reset: function () {
                        this.curFolder = this.dataFolders[0];
                        this.curIndex = 0;
                    },
                },
                computed: {
                    nodeFolders: function () {
                        this.dataFolders.forEach((folder, index) => {
                            if (index == 0) {
                                folder.on = true;
                            }

                            folder.info = "128"
                        });

                        this.$_myfolder_reset();
                        return this.dataFolders;
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