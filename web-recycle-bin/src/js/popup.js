document.addEventListener('DOMContentLoaded', () => {
  const bg = chrome.extension.getBackgroundPage();

  document.appView = new app.AppView(bg.tabs);

  // let curPage = 1;
  // const home = 1
  // const pageSize = 15;
  // const pageCount = bg.getClosedTabsCount();
  // const totalPage = Math.ceil(pageCount/pageSize);
  //
  // main();

  function main() {
    bindToolbarEvent();

    if (0 == totalPage)
      return;

    reload();
  }

  function bindToolbarEvent() {
    document.getElementById("next").addEventListener("click", onNext, false);
    document.getElementById("up").addEventListener("click", onUp, false);
    document.getElementById("clear").addEventListener("click", onClear, false);
  }


  function openTab() {
    const url = this.getElementsByTagName("a")[0].href;
    const option = {
      index: parseInt(this.dataset.index),
      url: url
    }

    chrome.tabs.create(option);
    bg.removeClosedTab(this.dataset.id);
    removeItem(this);
  }

  function removeItem(div) {
    div.parentNode.removeChild(div);
  }

  function createFavicon(tab, size) {
    let favicon = document.createElement("img");
    favicon.src = tab.favIconUrl;
    favicon.alt = "";
    favicon.width = size;
    favicon.height = size;
    return favicon;
  }

  function onNext() {
    if (curPage == totalPage)
      return;

    curPage += 1;
    reload();
  }

  function onUp() {
    if (home == curPage)
      return;

    curPage -= 1;
    reload();
  }

  function removeAllItems() {
    let list = document.getElementById("item-list");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }

  function onClear() {
    bg.clearClosedTabs();
    window.close();
  }

  function reload() {
    updateToolbar();
    removeAllItems();
    showClosedTabs();
  }

  function updateToolbar() {
    if (home == curPage) {
      hideUpButton();
    } else {
      showUpButton();
    }

    if (curPage == totalPage) {
      hideNextButton();
    } else {
      showNextButton();
    }

    return;
  }

  function showNextButton() {
    document.getElementById("next").style.display = "inline";
  }

  function showUpButton() {
    document.getElementById("up").style.display = "inline";
  }

  function hideNextButton() {
    document.getElementById("next").style.display = "none";
  }

  function hideUpButton() {
    document.getElementById("up").style.display = "none";
  }
});