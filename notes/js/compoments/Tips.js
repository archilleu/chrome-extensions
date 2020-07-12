/**
 * 全局注册Tips组件，显示提示消息
 */
Vue.component('tips', {
    data() {
        return {
            show: false,
            msg: "未知错误...",
        }
    },
    methods: {
        tip(msg, delay) {
            delay = delay ? delay : 3000;
            this.msg = msg;
            this.show = true;
            setTimeout(() => {
                this.show = false;
            }, delay);
        },
    },
    template: `
        <div id="snackbar" :class="{show: show, hidden: !show}">
            {{ msg }}
        </div>
    `,
})