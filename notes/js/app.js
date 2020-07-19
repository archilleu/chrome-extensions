import headerBar from "./header_bar.js"
import GNode from "./gnote.js"
import folders from "./folders.js"
import notes from "./notes.js"
import store from './store/index.js'
import loading from "./plugin/loading.js"
import tips from "./plugin/tips.js"
import messageBox from "./plugin/messageBox.js"

document.addEventListener('DOMContentLoaded', () => {

    Vue.use(loading);
    Vue.use(tips);
    Vue.use(messageBox);

    const app = new Vue({
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
            await this.$_myapp_init();
        },
        methods: {

            /**
             * 私有方法
             */

            //初始化
            async $_myapp_init() {

                try {
                    this.$loading.show();

                    //初始化node接口
                    await GNode.init();

                    //获取便签文件夹
                    await this.$refs.folders.noteFolders();

                } catch (e) {
                    this.$tips.message(JSON.stringify(e));
                } finally {
                    this.$loading.hide();
                }


                //模态窗口对象
                // this.folders.$btnCreate = $("#create-folder");
                // this.folders.$btnDelete = $("#delete-folder");
                // this.notes.$btnDelete = $("#delete-note");
            },


        },
        components: {
            folders,
            notes,
            headerBar,
        },

        //vuex
        store: store,
    });
});