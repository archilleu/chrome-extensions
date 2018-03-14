const PREFIXTABS = "TABS";
const CLOSEDTABS = "CLOSED";

class Tabs {
  constructor() {
    this.openedTabs = {};
    this.closedTabs = [];
    this.re = /^(http:|https:|ftp:|file:)/;
  }

  getClosedTabs(option) {
    option = !option ? {} : option;
    option.start = !option.start ? 0 : option.start;
    option.end = option.end ? option.end : this.closedTabs.length;
    return this.closedTabs.slice(option.start, option.end);
  }

  removeClosedTab(tabId) {
    for (var i = 0; i < this.closedTabs.length; i++) {
      if (this.closedTabs[i].id == tabId) {
        this.closedTabs.splice(i, 1);
        break;
      }
    }
  }

  clear() {
    this.closedTabs = [];
  }

  saveTab(tab) {
    if (!this._checkValid(tab)) {
      return;
    }

    const data = {
      id: tab.id,
      index: tab.index,
      title: tab.title,
      content: tab.title,
      href: tab.url,
      image: undefined == tab.favIconUrl ? "../images/default.png" : tab.favIconUrl
    }
    this.openedTabs[tab.id] = data;
  }

  saveClosedTab(tabId) {
    if (!this._checkIsCompleteTab(tabId)) {
      return;
    }

    let tab = this.openedTabs[tabId];
    tab.date = new Date();
    this.closedTabs.unshift(tab);
    delete this.openedTabs[tabId];
  }

  _checkValid(tab) {
    if (!this._checkComplete(tab)) return false;
    if (!this._checkValidUrl(tab)) return false;
    return true;
  }

  _checkComplete(tab) {
    return tab.status == "complete";
  }

  _checkValidUrl(tab) {
    if (tab.url && this.re.test(tab.url)) {
      return true;
    } else {
      return false;
    }
  }

  _checkIsCompleteTab(id) {
    if (!this.openedTabs[id])
      return false;

    return true;
  }

};

document.addEventListener('DOMContentLoaded', () => {

  this.tabs = new Tabs();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Note: this event is fired twice:
    // Once with `changeInfo.status` = "loading" and another time with "complete"
    this.tabs.saveTab(tab);
  });

  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    this.tabs.saveClosedTab(tabId);
  });
});