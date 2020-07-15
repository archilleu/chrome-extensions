import GAuth from "./api/gauth.js"

document.addEventListener('DOMContentLoaded', () => {

    new Vue({
        el: "#app",
        methods: {
            async googleLogin() {
                this.$refs.loading.show();
                try {
                    await GAuth.auth();
                    this.$refs.tips.tip("授权成功, 跳转中...");
                    this.gotoMainWindow();
                } catch (e) {
                    this.$refs.tips.tip(`授权失败:${e}`);
                }finally {
                    this.$refs.loading.hide();
                }
            },
            qqLogin() {
                this.$refs.tips.tip("QQ登陆尚未开放!")
            },
            gotoMainWindow() {
                window.location.href = chrome.extension.getURL('window.html');
            }
        }
    });

});