import headerBar from "./headerBar.js"
import GNode from "./gnote.js"
import folders from "./folders.js"
import notes from "./notes.js"
import editor from "./editor.js"
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
                    //初始化node接口
                    await GNode.init();

                    //获取便签文件夹
                    await this.$refs.folders.noteFolders();

                } catch (e) {
                    this.$tips.message(JSON.stringify(e));
                }

            },


        },

        //全局加载loading状态，统一在axios中判定
        computed: {
            loading() {
                return this.$store.getters.loading;
            }
        },

        watch: {
            loading(val) {
                if (val > 0) {
                    this.$loading.show();
                } else {
                    this.$loading.hide();
                }
            }
        },

        components: {
            folders,
            notes,
            editor,
            headerBar,
        },

        //vuex
        store: store,
    });
});