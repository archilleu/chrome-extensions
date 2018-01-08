document.addEventListener('DOMContentLoaded', () => {
  chrome.browserAction.onClicked.addListener(()=>{
    window.open(chrome.extension.getURL('window.html'));
  });
});
