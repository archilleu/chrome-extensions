/**
 * loading 插件
 * https://cn.vuejs.org/v2/api/#Vue-extend
 */

const loadingPlugin = {};

const Loading = {
    data: function () {
        return {
            count: 0,
        }
    },

    computed: {
        display() {
            return this.count > 0;
        }
    },

    methods: {
        show() {
            this.count++;
        },

        hide() {
            this.count--;
        },
    },


    template: `
    <div v-if="display" style="top: 0;bottom: 0;left: 0;right: 0;background-color: #9e9e9e33;position: fixed;z-index: 100;">
        <img style="position: relative;top: 50%;left: 50%;transform: translate(-16px, -16px);"
            src="images/loading.gif" />
    </div>
    `
}

loadingPlugin.install = function (Vue) {

    let vm = {}
    const loadingPlugin = Vue.extend(Loading)
    vm = new loadingPlugin().$mount()

    //挂载在body，如果挂载在root vm上需要处理响应式，参考https://cn.vuejs.org/v2/guide/reactivity.html
    document.body.appendChild(vm.$el)
    Vue.prototype.$loading = {
        show: () => {
            vm.show();
        },
        hide: () => {
            vm.hide();
        }
    }

}

export default loadingPlugin;