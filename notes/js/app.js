import HeaderBar from "./header_bar.js"
import GNode from "./gnote.js"
import folders from "./folders.js"
import store from './store/index.js'

document.addEventListener('DOMContentLoaded', () => {

    new Vue({
        el: '#app',
        data: {
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
        async mounted() {
            this.$_myapp_init();
        },
        methods: {

            /**
             * 私有方法
             */

            //初始化
            async $_myapp_init() {

                //初始化node接口
                await GNode.init();

                //获取便签文件夹
                await this.$refs.folders.noteFolders();

                //模态窗口对象
                // this.folders.$btnCreate = $("#create-folder");
                // this.folders.$btnDelete = $("#delete-folder");
                // this.notes.$btnDelete = $("#delete-note");
            },


        },
        components: {
            folders,
            HeaderBar,
        },

        //vuex
        store: store,
    });
});