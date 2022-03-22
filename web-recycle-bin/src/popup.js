document.addEventListener('DOMContentLoaded', () => {

  let curPage = 1
  let pageCount = 0
  let totalPage = 0
  let tabs = []
  const home = 1
  const pageSize = 12

  const listDom = document.getElementById("item-list");
  const prevDom = document.getElementById("prev")
  const nextDom = document.getElementById("next")
  const clearDom = document.getElementById("clear")
  const curPageDom = document.getElementById("cur-page")
  const totalPageDom = document.getElementById("total-page")

  main()

  function main() {
    bindToolbarEvent()

    reload()
  }

  function bindToolbarEvent() {
    prevDom.addEventListener("click", () => {
      if (home == curPage)
        return;

      curPage -= 1;
      reload();
    }, false)

    nextDom.addEventListener("click", () => {
      if (curPage == totalPage)
        return;

      curPage += 1;
      reload();
    }, false)

    clearDom.addEventListener("click", () => {
      chrome.runtime.sendMessage({ clear: 'clear' }, () => {
        window.close();
      });
    }, false)
  }

  function reload() {
    chrome.runtime.sendMessage({
      getTabs: {
        start: (curPage - 1) * pageSize,
        end: curPage * pageSize
      }
    }, (request) => {
      if (0 === request.tabs.length) {
        return
      }

      tabs = request.tabs
      pageCount = request.total
      totalPage = Math.ceil(pageCount / pageSize);

      updateToolbar()
      removeAllItems()
      createItemListHtml(tabs)
    });
  }

  function updateToolbar() {
    curPageDom.innerText = curPage
    totalPageDom.innerText = totalPage
    prevDom.style.display = (home === curPage) ? "none" : "inline-block"
    nextDom.style.display = (curPage === totalPage) ? "none" : "inline-block"
  }

  function removeAllItems() {
    while (listDom.firstChild) {
      listDom.removeChild(listDom.firstChild);
    }
  }

  function createItemListHtml(tabs) {
    const itemList = document.getElementById("item-list")
    tabs.forEach(tab => {
      itemList.appendChild(createItem(tab))
    });
  }

  function createItem(tab) {
    const item = createDiv(tab)
    item.appendChild(createFavicon(tab))
    item.appendChild(createLink(tab))
    item.appendChild(createTime(tab))
    return item
  }

  function createDiv(tab) {
    const div = document.createElement("div");
    div.setAttribute("class", "item");
    div.dataset.id = tab.id;
    div.dataset.index = tab.index;
    div.addEventListener("click", function () {
      const url = this.getElementsByTagName("a")[0].href;
      const option = {
        index: parseInt(this.dataset.index),
        url: url
      }

      chrome.runtime.sendMessage({ delTabs: this.dataset.id }, () => {
        chrome.tabs.create(option);
      });
    }, false);
    return div;
  }

  function createFavicon(tab) {
    const favicon = document.createElement("img");
    favicon.src = tab.favicon;
    favicon.alt = "";
    favicon.width = 16;
    favicon.height = 16;
    return favicon;
  }

  function createLink(tab) {
    const a = document.createElement("a");
    a.href = tab.url;
    a.title = tab.title;
    a.innerText = tab.title
    return a;
  }

  function createTime(tab) {
    const span = document.createElement("span");
    span.innerText = new Date(tab.date).toLocaleTimeString();
    return span;
  }
})

