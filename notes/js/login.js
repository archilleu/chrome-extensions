document.addEventListener('DOMContentLoaded', () => {

    const auth = new GAuth();

    const google = document.getElementById("google-login");
    google.addEventListener("click", function(event) {
        event.preventDefault();

        auth.auth({
            success: () => {
                gotoMainWindow();
            },
            error: (msg) => {
                console.log(msg);
            }
        });
    }, false);

    const qq = document.getElementById("qq-login");
    qq.addEventListener("click", function() {
        event.preventDefault();
        alert("QQ登陆未开放");
    }, false);

    function gotoMainWindow() {
        window.location.href = chrome.extension.getURL('window.html');
    }
});