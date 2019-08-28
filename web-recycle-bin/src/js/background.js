document.addEventListener('DOMContentLoaded', () => {

    this.tabs = new Tabs();

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        // Note: this event is fired twice:
        // Once with `changeInfo.status` = "loading" and another time with "complete"

        if (tab.status !== "complete")
            return;

        this.tabs.addOpenedTab(tab);
    });

    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        this.tabs.addClosedTab(tabId);
    });
});