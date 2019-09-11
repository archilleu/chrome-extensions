document.addEventListener('DOMContentLoaded', () => {

  chrome.browserAction.onClicked.addListener(() => {
    gotoLogin();
  });

  function gotoLogin() {
    window.open(chrome.extension.getURL('login.html'));
  }
});