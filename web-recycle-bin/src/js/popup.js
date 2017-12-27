document.addEventListener('DOMContentLoaded', () => {
  const bg = chrome.extension.getBackgroundPage();

  let curPage = 1;
  const home = 1
  const pageSize = 15;
  const pageCount = bg.getClosedTabsCount();
  const totalPage = Math.ceil(pageCount/pageSize);

  main();

  function main() {
    bindToolbarEvent();

    if(0 == totalPage)
      return;

    reload();
  }

  function bindToolbarEvent() {
    document.getElementById("next").addEventListener("click", onNext, false);
    document.getElementById("up").addEventListener("click", onUp, false);
    document.getElementById("clear").addEventListener("click", onClear, false);
  }

  function showClosedTabs() {
    const tabs = closedSortedTabs();
    const html = closedHtml(tabs);
    appendToList(html);
  };

  function closedSortedTabs() {
    const start = (curPage-1) * pageSize;
    const end = start + pageSize;
    const tabs = bg.getSortedClosedTabs({start:start, end});
    let tabsInfo = [];
    for(let i=0; i<tabs.length; i++) {
      let tabData = bg.getClosedTab(tabs[i].name);
      const tm = makeClosedTime(tabs[i].time);
      tabData.time = tm;
      tabsInfo.push(tabData);
    }

    return tabsInfo;
  }

  function makeClosedTime(time) {
    const tm = new Date(time);
    return (tm.getHours() + ":" + tm.getMinutes());
  }

  function closedHtml(tabs) {
    let div = document.createElement("div");
    for(let i=0; i<tabs.length; i++) {
      const item = createItem(tabs[i]);
      div.appendChild(item);
    }

    return div;
  }

  function createItem(tab) {
    let item = createDiv(tab);

    const favicon = createFavicon(tab, 16);
    const link = createLink(tab);
    const time = createTime(tab);

    item.appendChild(favicon);
    item.appendChild(link);
    item.appendChild(time);
    return item;
  }

  function createDiv(tab) {
    let div = document.createElement("div");
    div.setAttribute("class", "item");
    div.dataset.id = tab.id;
    div.dataset.index = tab.index;
    div.addEventListener("click", openTab, false);
    return div;
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

  function createLink(tab) {
    let a = document.createElement("a")  ;
    a.href = tab.url;
    a.title = tab.title;

    let span = document.createElement("span");
    span.innerText = tab.title;

    a.appendChild(span);
    return a;
  }

  function createTime(tab) {
    let span = document.createElement("span");
    span.innerText = tab.time;
    return span;
  }

  function appendToList(html) {
    let list = document.getElementById("item-list");
    list.appendChild(html);
  }

  function onNext() {
    if(curPage == totalPage)
      return;

    curPage += 1;
    reload();
  }

  function onUp() {
    if(home == curPage)
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
    if(home == curPage) {
      hideUpButton();
    } else {
      showUpButton();
    }

    if(curPage == totalPage) {
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
