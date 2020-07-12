document.addEventListener('DOMContentLoaded', () => {

    new Vue({
        el: "#app",
        methods: {
            googleLogin() {
                this.$refs.loading.show();
                new GAuth().auth({
                    success: () => {
                        this.$refs.tips.tip("授权成功, 跳转中...");
                        this.$refs.loading.hide();
                        setTimeout(() => {
                            this.gotoMainWindow();
                        }, 1000);
                    },
                    error: (msg) => {
                        this.$refs.loading.hide();
                        this.$refs.tips.tip("授权失败");
                    }
                });
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