class Tabs {
    constructor() {
        // Map特性:按添加顺序存储
        this.openedTabs = new Map(); // 已经打开的标签，由于关闭标签事件只有一个tabId所以需要记录打开的标签页
        this.closedTabs = new Array(); // 已经关闭的标签

        this.reg = /^(http:|https:|ftp:|file:)/; // 判断合法的URL地址
    }

    getClosedTabs(start, end) {
        if (start > end)
            return;

        start = (undefined == start) ? 0 : start;
        end = (undefined == end) ? this.closedTabs.length : end;
        return this.closedTabs.slice(start, end);
    }

    deleteClosedTab(tabId) {
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
        if (!this._checkValidUrl(tab))
            return;

        this.openedTabs.set(tab.id, {
            id: tab.id,
            index: tab.index,
            title: tab.title,
            url: tab.url,
            favicon: (tab.favIconUrl) ? tab.favIconUrl : "../images/default.png"
        });
    }

    addClosedTab(tabId) {
        if (!this._isOpenedTab(tabId))
            return;

        let tab = this.openedTabs.get(tabId);
        tab.date = new Date();
        this.closedTabs.unshift(tab);

        this.openedTabs.delete(tabId);
    }

    //检测是不是合法的url
    _checkValidUrl(tab) {
        if (tab.url && this.reg.test(tab.url))
            return true;

        return false;
    }

    //检测是否是打开的标签页
    _isOpenedTab(id) {
        if (!this.openedTabs.has(id))
            return false;

        return true;
    }

};