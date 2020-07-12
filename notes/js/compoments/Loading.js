/**
 * 全局注册Loading组件，显示加载过程
 */
Vue.component('loading', {
    data() {
        return {
            count: 0,
        }
    },
    methods: {
        show() {
            return ++this.count;
        },
        hide() {
            return --this.count;
        }
    },
    template: `
        <div id="loading" :class="{show: count>0}">
            <img src="images/loading.gif" />
        </div>
    `,
})