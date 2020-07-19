/**
 * loading 插件
 * https://cn.vuejs.org/v2/api/#Vue-extend
 */

const tipsPlugin = {};

const Tips = {
    data() {
        return {
            show: false,
            msg: "未知错误...",
        }
    },

    methods: {
        message(msg) {
            this.msg = msg;
            this.show = true;
            setTimeout(() => {
                this.show = false;
            }, 3000);
        },
    },

    //css文件另外引入
    template: `
        <div id="snackbar" :class="{show: show, hidden: !show}">
            {{ msg }}
        </div>
    `,
}

tipsPlugin.install = function (Vue) {

    let vm = {}
    const tipsPlugin = Vue.extend(Tips)
    vm = new tipsPlugin().$mount()

    //挂载在body，如果挂载在root vm上需要处理响应式，参考https://cn.vuejs.org/v2/guide/reactivity.html
    document.body.appendChild(vm.$el)
    Vue.prototype.$tips = {
        message: (msg) => {
            vm.message(msg);
        }
    }

}

export default tipsPlugin;