document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();
    const tabs = bg.tabs;
    const pageSize = 12;

    var app = app || new Vue({
        el: '#my-app',
        data: {
            curPage: 0,
            pageSize: pageSize,
            tabs: tabs,
            closedTabs: tabs.getClosedTabs(0, pageSize),
        },
        directives: {
            realImage(el, binding) {
                let imgUrl = binding.value
                if(imgUrl) {
                    setTimeout(()=>{
                        let img = new Image();
                        img.src = imgUrl;
                        img.onload = function () {
                            if (this.complete == true){
                                img = null;
                                el.setAttribute('src', imgUrl)
                            }
                        }
                    },10)
                }
            }
        },
        methods: {
            onLink(ev) {
                const id = ev.currentTarget.dataset.id;
                const index = ev.currentTarget.dataset.index;
                const url = ev.currentTarget.dataset.url;

                this._openTab(url, parseInt(index));
                this._deleteClosedTab(parseInt(id));
            },
            onPrev() {
                if (this.curPage <= 0)
                    return;

                this.curPage--;
                this._updatePage();
            },
            onNext() {
                if (this.curPage >= (this.pages - 1))
                    return;

                this.curPage++;
                this._updatePage();
            },
            onClear() {
                this.curPage = 0;
                this.tabs.clearClosedTabs();
                this._updatePage();
            },
            _openTab(url, index) {
                const option = {
                    index: index,
                    url: url
                }

                chrome.tabs.create(option);
            },

            _deleteClosedTab(id) {
                this.tabs.deleteClosedTab(id);
            },

            _updatePage() {
                const curIndex = this.curPage * this.pageSize;
                this.closedTabs = this.tabs.getClosedTabs(curIndex, curIndex + this.pageSize);
            }
        },
        computed: {
            pages() {
                return Math.ceil(tabs.closedTabs.length / this.pageSize);
            },
            showCurPage() {
                if (0 == this.pages)
                    return 0;

                return this.curPage + 1;
            }
        },
        filters: {
            formatTime(date) {
                let h = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
                let m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
                return `${h}:${m}`;
            }
        }
    });
});