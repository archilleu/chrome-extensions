document.addEventListener('DOMContentLoaded', () => {

    const auth = new GAuth();

    const $loading = $("#loading");

    const google = document.getElementById("google-login");
    google.addEventListener("click", function (event) {
        event.preventDefault();

        $loading.show();
        auth.auth({
            success: () => {
                tip("授权成功");
                gotoMainWindow();
            },
            error: (msg) => {
                $loading.hide();
                tip("授权失败");
            }
        });
    }, false);

    const qq = document.getElementById("qq-login");
    qq.addEventListener("click", function () {
        event.preventDefault();
        alert("QQ登陆未开放");
    }, false);

    function gotoMainWindow() {
        window.location.href = chrome.extension.getURL('window.html');
    }
});

function tip(msg) {
    const $tips = $("#snackbar");
    $tips.text(msg);
    $tips.addClass("show");
    setTimeout(() => {
        $tips.removeClass("show")
    }, 3000);
}