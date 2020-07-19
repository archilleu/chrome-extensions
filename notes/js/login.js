import GAuth from "./api/gauth.js"
import loading from "./plugin/loading.js"
import tips from "./plugin/tips.js"

document.addEventListener('DOMContentLoaded', () => {

    Vue.use(loading);
    Vue.use(tips);

    new Vue({
        el: "#app",
        methods: {
            async googleLogin() {
                this.$loading.show();
                try {
                    await GAuth.auth();
                    this.gotoMainWindow();
                } catch (e) {
                    this.$tips.message(`授权失败:${e}`);
                } finally {
                    this.$loading.hide();
                }
            },
            qqLogin() {
                this.$tips.message("QQ登陆尚未开放!")
            },
            gotoMainWindow() {
                window.location.href = chrome.extension.getURL('window.html');
            },
        }
    });

});