document.addEventListener('DOMContentLoaded', () => {
  this.gdrive = new GDrive();

  this.gdrive.init({
    success: () => {
      console.log("init success");
    },
    error: (status, msg) => {
      console.log("status: " + status + " msg: " + msg);
    },
    neterror: () => {
      console.log("check network");
    }
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