class Tabs {
  constructor() {
    this.openedTabs = new Map(); // 已经打开的标签，由于关闭标签事件只有一个tabId所以需要记录打开的标签页
    this.closedTabs = new Array(); // 已经关闭的标签

  }

  getClosedTabs(start, end) {
    if (start > end)
      return;

    start = (undefined == start) ? 0 : start;
    end = (undefined == end) ? this.closedTabs.length : end;
    return this.closedTabs.slice(start, end);
  }

  delClosedTab(tabId) {
    for (var i = 0; i < this.closedTabs.length; i++) {
      if (this.closedTabs[i].id == tabId) {
        this.closedTabs.splice(i, 1);
        break;
      }
    }
  }

  clearClosedTabs() {
    this.closedTabs = new Array();
  }

  addOpenedTab(tab) {

    this.openedTabs.set(tab.id, {
      id: tab.id,
      index: tab.index,
      title: tab.title,
      url: tab.url,
      favicon: tab.favIconUrl || "../images/default.png"
    });
  }

  addClosedTab(tabId) {
    if (!this._isOpenedTab(tabId)) {
      return;
    }

    let tab = this.openedTabs.get(tabId);
    tab.date = new Date();
    this.closedTabs.unshift(tab);

    this.openedTabs.delete(tabId);
  }

  //检测是否是打开的标签页
  _isOpenedTab(id) {
    return this.openedTabs.has(id);
  }
};
const tabs = new Tabs()

const REG_LEGAL_URL = /^(http:|https:|ftp:|file:)/
function checkLegalUrl(tab) {
  if (tab.url && REG_LEGAL_URL.test(tab.url)) {
    return true;
  }

  return false;
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.getTabs) {
      const page = request.getTabs
      sendResponse({ tabs: tabs.getClosedTabs(page.start, page.end), total: tabs.closedTabs.length });
    } else if (request.delTabs) {
      tabs.delClosedTab(request.delTabs)
      sendResponse({});
    }  else if(request.clear) {
      tabs.clearClosedTabs()
      sendResponse({});
    } else {
      // TODO NOTHING
    }

  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status !== "complete") {
    return;
  }

  if (!this.checkLegalUrl(tab)) {
    return;
  }

  tabs.addOpenedTab(tab)
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  tabs.addClosedTab(tabId)
});

class TestTabs {
    assert(condition, msg) {
        if (!condition) {
            throw new Error(`[WRB] ${msg}`)
        }
    }

    test() {
        //测试空的closedTabs
        const tabs = new Tabs();
        var closedTabs = tabs.getClosedTabs();
        this.assert(closedTabs.length == 0, "func getClosedTabs() failed!");

        closedTabs = tabs.getClosedTabs(0);
        this.assert(closedTabs.length == 0, "func getClosedTabs() failed!");

        closedTabs = tabs.getClosedTabs(0, 1);
        this.assert(closedTabs.length == 0, "func getClosedTabs() failed!");

        closedTabs = tabs.getClosedTabs(1, 10);
        this.assert(closedTabs.length == 0, "func getClosedTabs() failed!");

        //添加opened tab
        const tabIdIndex = 1000;
        for (let i = 0; i < 10; i++) {
            tabs.addOpenedTab({
                id: i + tabIdIndex,
                index: i,
                title: "title" + i,
                content: "content" + i,
                url: "http://www.baidu.com?a=" + i,
                //image: null
            });
        }
        this.assert(tabs.openedTabs.size == 10, "func addOpendTab failed!");
        //添加closed tab
        for (let i = 0; i < 5; i++) {
            tabs.addClosedTab(i + tabIdIndex);
        }
        this.assert(tabs.closedTabs.length == 5, "func addClosedTab failed!");

        //测试添加后的数据
        this.assert(tabs.openedTabs.size == 5, "func addOpendTab failed!");
        for (let i = 5; i < tabs.openedTabs.size + 5; i++) {
            this.assert(tabs.openedTabs.get(i + tabIdIndex).id == i + tabIdIndex, "func addOpendTab failed!");
        }
        for (let i = 0; i < tabs.closedTabs.length; i++) {
            this.assert(tabs.closedTabs[i].id == (4 - i) + tabIdIndex, "func addClosedTab failed!");
        }

        closedTabs = tabs.getClosedTabs();
        this.assert(closedTabs.length == 5, "func getClosedTabs failed!");
        for (let i = 0; i < closedTabs.length; i++) {
            this.assert(closedTabs[i].id == (4 - i) + tabIdIndex, "func getClosedTabs failed!");
        }
        closedTabs = tabs.getClosedTabs(1);
        this.assert(closedTabs.length == 4, "func getClosedTabs failed!");
        for (let i = 0; i < closedTabs.length - 1; i++) {
            this.assert(closedTabs[i].id == (3 - i) + tabIdIndex, "func getClosedTabs failed!");
        }
        closedTabs = tabs.getClosedTabs(1, 3);
        this.assert(closedTabs.length == 2, "func getClosedTabs failed!");
        for (let i = 0; i < 2; i++) {
            this.assert(closedTabs[i].id == (3 - i) + tabIdIndex, "func getClosedTabs failed!");
        }
        closedTabs = tabs.getClosedTabs(10, 30);
        this.assert(closedTabs.length == 0, "func getClosedTabs failed!"); {}
        closedTabs = tabs.getClosedTabs(1, 30);
        this.assert(closedTabs.length == 4, "func getClosedTabs failed!");
        for (let i = 0; i < closedTabs.length; i++) {
            this.assert(closedTabs[i].id == (3 - i) + tabIdIndex, "func getClosedTabs failed!");
        }

        //删除closed tab
        const size = tabs.closedTabs.length;
        for (let i = 0; i < size - 1; i++) {
            tabs.delClosedTab(i + tabIdIndex);
        }
        this.assert(tabs.closedTabs.length == 1, "func delClosedTab failed!");
        this.assert(tabs.getClosedTabs()[0].id == 1004, "func delClosedTab failed!");

        //清空closed tab
        tabs.clearClosedTabs();
        this.assert(tabs.closedTabs.length == 0, "func clearClosedTabs failed!");
    }

}

const testTabs = new TestTabs();
testTabs.test();