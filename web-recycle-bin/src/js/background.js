const PREFIXTABS = "TABS";
const CLOSEDTABS = "CLOSED";

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  initStorage();
  bindEvent();
}

function initStorage() {
  clearTabs();
  saveClosedTabs([]);
}

function bindEvent() {
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Note: this event is fired twice:
    // Once with `changeInfo.status` = "loading" and another time with "complete"
    saveTab(tab);
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    saveClosedTab(tabId);
  });
}

function saveTab(tab) {
  if(!checkComplete(tab.status)) return;
  if(!checkValidUrl(tab.url)) return;

  const tabName = openedTabName(tab.id);
  const tabData = openedTabData(tab);
  save(tabName, tabData);
}

function checkComplete(status) {
  return status == "complete";
}

function checkValidUrl(url) {
  var re = /^(http:|https:|ftp:|file:)/;
  if (url && re.test(url)) {
    return true;
  } else {
    return false;
  }
}

function openedTabName(id) {
  return PREFIXTABS + "_" + id;
}

function openedTabData(tab) {
  const data = {
    id : tab.id,
    index : tab.index,
    title : tab.title,
    url : tab.url,
    favIconUrl : tab.favIconUrl
  }

  return data;
}

function saveClosedTab(id) {
  if(!checkIsCompleteTab(id))
    return;
    
  appendToClosedTab(id);
}

function checkIsCompleteTab(id) {
  const name = openedTabName(id);
  if(null == get(name))
    return false;

  return true;
}

function appendToClosedTab(id) {
  const tab = {
    name: id,
    time: (new Date()).getTime()
  }

  let closedTabs = getClosedTabs();
  closedTabs.push(tab);
  saveClosedTabs(closedTabs);
}

function getClosedTabs() {
  const data = get(CLOSEDTABS);
  return data;
}

function saveClosedTabs(data) {
  save(CLOSEDTABS, data);
}

function removeTab(tab) {
  const tabName = openedTabName(tab.id);
  remove(tabName);
}

function clearTabs() {
    clear();
}

function getClosedTab(id) {
  const tabName = openedTabName(id);
  return get(tabName);
}

function removeClosedTab(id) {
  let tabs = getClosedTabs();
  let flag = false;
  for(let i=0; i<tabs.length; i++) {
    if(tabs[i].name == id) {
      tabs.splice(i, 1);
      flag = true;
      break;
    }
  }

  if(flag)
    saveClosedTabs(tabs);
}

function save(tabName, tabData) {
  localStorage.setItem(tabName, JSON.stringify(tabData));
}

function get(tabName) {
  const tabData = localStorage.getItem(tabName);
  return JSON.parse(tabData);
}

function remove(tabName) {
  localStorage.removeItem(tabName);
}

function clear() {
  localStorage.clear();
}
