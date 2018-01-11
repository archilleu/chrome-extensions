document.addEventListener('DOMContentLoaded', () => {
  chrome.browserAction.onClicked.addListener(() => {

    waitingDialog.show();
    const gdrive = new GDrive();
    gdrive.checkAuth(function(result) {
      //已经授权了，跳到主页面, 否者需要登陆
      waitingDialog.hide();
      if (true == result) {
        gotoMainWindow();
      } else {
        window.open(chrome.extension.getURL('login.html'));
        $("#google-login").click(function(event) {
          event.stopPropagation();

          gdriverauth(function(result) {
            if (null != result.message) {
              alert(result.message);
              return;
            }

            gotoMainWindow();
          });
        });
      }
    })
  });



  function gotoMainWindow() {
    window.location.href = chrome.extension.getURL('window.html');
  }
});
