document.addEventListener('DOMContentLoaded', () => {

  const gdrive = chrome.extension.getBackgroundPage().gdrive;

  if (gdrive.checkAuth()) {
    gotoMainWindow();
  }

  const google = document.getElementById("google-login");
  google.addEventListener("click", function(event) {
    event.preventDefault();

    gdrive.auth({
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
  }, false);

  function gotoMainWindow() {
    window.location.href = chrome.extension.getURL('window.html');
  }
});