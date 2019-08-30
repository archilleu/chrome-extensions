document.addEventListener('DOMContentLoaded', () => {
    const bg = chrome.extension.getBackgroundPage();

    var app = app || new Vue({
        el: '#app',
        data: {
            name: "aa",
            info: "xx",
            folder: 'true'
        },
        methods: {},
        computed: {},
        filters: {},
        components: {
            'folder-template': {
                template: "#folder-template",
                data() {
                    return {
                        folderList: [{
                            id: 1,
                            name: "全部便签",
                            info: 123,
                            on: true
                        }, {
                            id: 2,
                            name: "fav",
                            info: 123,
                            on: false
                        }]
                    };
                }
            },
            'note-template': {
                template: "#note-template",
                data() {
                    return {
                        nodeList: [{
                                id: 1,
                                descript: 123,
                                time: Date.now(),
                                on: true
                            },
                            {
                                id: 2,
                                descript: 456,
                                time: Date.now(),
                                on: false
                            }
                        ]
                    };
                }
            }
        }
    });
});