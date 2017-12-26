$(function(){
  init(function(data) {
    test(data);
  });

  function init(callback) {
    clearTabs();

    const url = "../data/test_data.json";
    $.get(url, function(data) {
      callback(JSON.parse(data));
    });
  }

  function test(data) {
    testStorageEmpty();
    testOptTabs();
    testCheckComplete(data);
    testCheckUrl(data);
    testSaveTab(data);
    testClosedTab(data);
  }

  function testOptTabs() {
    const name = "test";
    const data = "test data";

    console.assert(null==get(name), "get empty tabs");
    save(name, data);
    const retData = get(name);
    console.assert(data == retData, "save data failed");

    remove(name);
  }

  function testCheckComplete(data) {
    console.assert(false == checkComplete(data.statusLoding.status),  "checkComplete loading");
    console.assert(true == checkComplete(data.statusComplete.status),  "checkComplete complete");
    console.assert(true == checkComplete(data.urlInvalid.status),  "checkComplete urlInvalid");
    console.assert(true == checkComplete(data.urlBaidu.status),  "checkComplete urlBaidu");
    console.assert(true == checkComplete(data.urlBing.status),  "checkComplete urlBing");
  }

  function testCheckUrl(data) {
    console.assert(false == checkValidUrl(data.urlInvalid.url), "checkValidUrl urlInvalid");
    console.assert(true == checkValidUrl(data.urlBaidu.url), "checkValidUrl urlBaidu");
    console.assert(true == checkValidUrl(data.urlBing.url), "checkValidUrl urlBing");
  }

  function testSaveTab(data) {
    const dataBaidu = data.urlBaidu;
    const dataBing = data.urlBing;

    saveTab(dataBaidu);
    saveTab(dataBing);

    let name = openedTabName(dataBaidu.id);
    let tabData = get(name);
    console.assert(compTab(dataBaidu, tabData), "save tab data faild");
    removeTab(dataBaidu);

    name = openedTabName(dataBing.id);
    tabData = get(name);
    console.assert(compTab(dataBing, tabData), "save tab data faild");
    removeTab(dataBing);

    testStorageEmpty();
  }

  function compTab(left, right) {
    if(left.id != right.id) return false;
    if(left.index != right.index) return false;
    if(left.title != right.title) return false;
    if(left.url != right.url) return false;
    if(left.favIconUrl != right.favIconUrl) return false;

    return true;
  }

  function testClosedTab(data) {
    initStorage();

    const dataBaidu = data.urlBaidu;
    const dataBing = data.urlBing;

    saveTab(dataBaidu);
    saveTab(dataBing);

    saveClosedTab(dataBaidu.id);
    saveClosedTab(dataBing.id);

    let closedTabs = getClosedTabs();
    for(let i=0; i<closedTabs.length; i++)
      console.assert(checkClosedTab(closedTabs[i], closedTabs), "closed tab store failed")

    const retDataBaidu = getClosedTab(dataBaidu.id);
    console.assert(compTab(retDataBaidu, dataBaidu), "get closed data failed");
    const retDataBing = getClosedTab(dataBing.id);
    console.assert(compTab(retDataBing, dataBing), "get closed data failed");

    removeClosedTab(dataBaidu.id);
    removeClosedTab(dataBing.id);
    closedTabs = getClosedTabs();
    console.assert(0 == closedTabs.length, "removeClosedTab failed");

    clearTabs();
  }

  function checkClosedTab(tab, tabs) {
    for(let i=0; i<tabs.length; i++) {
      if(tab.name == tabs[i].name)
        return true;
    }

    return false;
  }

  function testStorageEmpty() {
    console.assert(localStorage.length == 0, "storage not empty");
  }

});
