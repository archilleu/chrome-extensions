document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();
    const gdrive = bg.gdrive;

    const google = document.getElementById("google-login");
    google.addEventListener("click", function(event) {
        event.preventDefault();

        waitingDialog.show("request auth...");
        gdrive.auth(function(result) {
            if(result) {
                waitingDialog.show(result);
                setTimeout(function(){waitingDialog.hide()}, 1000);
                console.log(result);
                return;
            }

            gotoMainWindow();
        });
    }, false);

    const qq = document.getElementById("qq-login");
    qq.addEventListener("click", function() {
        event.preventDefault();
    }, false);

    function gotoMainWindow() {
        window.location.href = chrome.extension.getURL('window.html');
    }
});