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
            tabs.deleteClosedTab(i + tabIdIndex);
        }
        this.assert(tabs.closedTabs.length == 1, "func deleteClosedTab failed!");
        this.assert(tabs.getClosedTabs()[0].id == 1004, "func deleteClosedTab failed!");

        //清空closed tab
        tabs.clearClosedTabs();
        this.assert(tabs.closedTabs.length == 0, "func clearClosedTabs failed!");
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const testTabs = new TestTabs();
    testTabs.test();
});