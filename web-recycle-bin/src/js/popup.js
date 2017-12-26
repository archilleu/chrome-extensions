document.addEventListener('DOMContentLoaded', () => {
  const bg = chrome.extension.getBackgroundPage();

  // main();

  function main() {
    const tabs = closedSortedTabs();
    const html = closedHtml(tabs);
    appendToList(html);
  };

  function closedSortedTabs() {
    const tabs = bg.getClosedTabs();
    tabs.sort(function(left, right){
      if(left.time>right.time) return -1;
      if(left.time<right.time) return 1;
      return 0;
    });

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
    div.addEventListener("click", function(){ alert(0)}, false);
    return div;
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

});
