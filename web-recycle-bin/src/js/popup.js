document.addEventListener('DOMContentLoaded', () => {
  const bg = chrome.extension.getBackgroundPage();

  const pageSize = 2;
  let curPage = 0;
  const closedCount = bg.getClosedTabsCount();
  const closedTotalPage = Math.ceil(closedCount/pageSize) - 1;

  bindToolbarEvent();
  showClosedTabs();

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
    const start = curPage * pageSize;
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
      url: url,
      active: false
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
    if(curPage == closedTotalPage)
      return;

    curPage += 1;
    reload();
  }

  function onUp() {
    if(0 == curPage)
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
    reload();
  }

  function reload() {
    removeAllItems();
    showClosedTabs();
  }
});
