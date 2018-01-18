document.addEventListener('DOMContentLoaded', () => {
  this.gdrive = new GDrive();

  this.gdrive.init(function(result) {
    console.log(result);
  });

  chrome.browserAction.onClicked.addListener(() => {
    if (this.gdrive.checkAuth()) {
      gotoMainWindow();
    } else {
      gotoLogin();
    }
  });


  function gotoMainWindow() {
    window.open(chrome.extension.getURL('window.html'));
  }

  function gotoLogin() {
    window.open(chrome.extension.getURL('login.html'));
  }

});