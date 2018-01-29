document.addEventListener('DOMContentLoaded', () => {

  //唯一实例
  this.gdrive = new GDrive();

  chrome.browserAction.onClicked.addListener(() => {
    gotoLogin();
  });

  function gotoLogin() {
    window.open(chrome.extension.getURL('login.html'));
  }
});