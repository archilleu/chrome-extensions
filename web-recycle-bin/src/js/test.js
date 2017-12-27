let gSleepTime = 0;

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
    testSortedClosedTab(data);
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
    if(undefined == left.favIconUrl) {
      left.favIconUrl= "../images/default.png";
    }
    if(undefined == right.favIconUrl) {
      right.favIconUrl= "../images/default.png";
    }
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

  function testSortedClosedTab(data) {
    initStorage();

    const dataBaidu = data.urlBaidu;
    const dataBing = data.urlBing;
    const dataUrl1 = data.url1;
    const dataUrl2 = data.url2;
    const size = data.urlSortedSize;

    saveTab(dataBaidu);
    saveTab(dataBing);
    saveTab(dataUrl1);
    saveTab(dataUrl2);

    gSleepTime += 100*size;

    saveClosedTab(dataBaidu.id);
    setTimeoutInterval(function(){
      saveClosedTab(dataBing.id);
      setTimeoutInterval(function() {
        saveClosedTab(dataUrl1.id);
        setTimeoutInterval(function() {
          saveClosedTab(dataUrl2.id);
          setTimeoutInterval(function() {
            let tabs = getSortedClosedTabs();
            console.assert(tabs.length==size, "getSortedClosedTabs length != 1");

            tabs = getSortedClosedTabs({start:0, end:1});
            console.assert(tabs.length==1, "getSortedClosedTabs length != 1");
            console.assert(compTab(getClosedTab(tabs[0].name), dataUrl2));

            tabs = getSortedClosedTabs({start:1});
            console.assert(tabs.length==3, "getSortedClosedTabs length != 1");
            console.assert(compTab(getClosedTab(tabs[0].name), dataUrl1));
            console.assert(compTab(getClosedTab(tabs[1].name), dataBing));
            console.assert(compTab(getClosedTab(tabs[2].name), dataBaidu));

            tabs = getSortedClosedTabs({start:3, end:4});
            console.assert(tabs.length==1, "g.idetSortedClosedTabs length != 1");
            console.assert(compTab(getClosedTab(tabs[0].name), dataBaidu));

            tabs = getSortedClosedTabs({start:4, end:5});
            console.assert(tabs.length==0, "getSortedClosedTabs length != 1");
            tabs = getSortedClosedTabs({start:6, end:8});
            console.assert(tabs.length==0, "getSortedClosedTabs length != 1");

            clearTabs();
          });
        });
      })
    });

  }

  function setTimeoutInterval(callback, interval) {
    if(undefined == interval)
      interval = 100;

    setTimeout(callback, interval);
  }

});
